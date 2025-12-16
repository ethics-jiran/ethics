import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendReplySchema, updateStatusSchema } from '@/lib/validations/inquiry';
import { ZodError } from 'zod';
import { verifyAdmin } from '@/lib/auth/verify-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Check auth + MFA (AAL2)
  const authResult = await verifyAdmin(supabase);
  if (!authResult.success) {
    return authResult.response;
  }

  const { data, error } = await supabase
    .from('inquiries')
    .select(`
      *,
      replies:inquiry_replies(
        id,
        title,
        content,
        status,
        created_at,
        updated_at,
        created_by
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
  }

  // Sort replies by creation date (newest first)
  if (data.replies) {
    data.replies.sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Check auth + MFA (AAL2)
  const authResult = await verifyAdmin(supabase);
  if (!authResult.success) {
    return authResult.response;
  }

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
        replied_by: authResult.userId,
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
