import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendReplySchema, updateStatusSchema } from '@/lib/validations/inquiry';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Note: MFA is enforced by RLS RESTRICTIVE policy
  // RLS checks: auth.jwt() ->> 'aal' = 'aal2'
  // If user doesn't have AAL2, RLS will block data access

  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Note: MFA is enforced by RLS RESTRICTIVE policy
  // RLS checks: auth.jwt() ->> 'aal' = 'aal2'
  // If user doesn't have AAL2, RLS will block data access

  try {
    const body = await request.json();

    // Validate either reply or status update
    let updateData: any = {};
    let shouldSendEmail = false;

    if (body.replyTitle && body.replyContent) {
      const validated = sendReplySchema.parse(body);
      updateData = {
        reply_title: validated.replyTitle,
        reply_content: validated.replyContent,
        replied_at: new Date().toISOString(),
        replied_by: user.id,
      };
      if (validated.status) {
        updateData.status = validated.status;
      }
      shouldSendEmail = true;
    } else if (body.status) {
      const validated = updateStatusSchema.parse(body);
      updateData = { status: validated.status };
    } else {
      return NextResponse.json(
        { error: 'Either reply or status update required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('inquiries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    let emailSent = false;
    if (shouldSendEmail) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/email/send-reply-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            inquiryId: data.id,
            replyTitle: data.reply_title,
            replyContent: data.reply_content,
          }),
        });
        emailSent = response.ok;
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    return NextResponse.json({ data, emailSent });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.issues },
        { status: 400 }
      );
    }
    console.error('Update error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
