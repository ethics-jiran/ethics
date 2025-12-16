import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendReplySchema } from '@/lib/validations/inquiry';
import { ZodError } from 'zod';
import { verifyAdmin } from '@/lib/auth/verify-admin';

export async function POST(
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

    // Validate request
    const validated = sendReplySchema.parse(body);

    // Insert new reply with status
    const { data: reply, error: replyError } = await supabase
      .from('inquiry_replies')
      .insert({
        inquiry_id: id,
        title: validated.replyTitle,
        content: validated.replyContent,
        status: validated.status || 'completed',
        created_by: authResult.userId,
      })
      .select()
      .single();

    if (replyError || !reply) {
      console.error('Reply insert error:', replyError);
      return NextResponse.json(
        { error: 'Failed to create reply' },
        { status: 500 }
      );
    }

    // Update inquiry status if provided
    if (validated.status) {
      const { error: statusError } = await supabase
        .from('inquiries')
        .update({ status: validated.status })
        .eq('id', id);

      if (statusError) {
        console.error('Status update error:', statusError);
      }
    }

    // Get inquiry details for email
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('email')
      .eq('id', id)
      .single();

    if (inquiryError || !inquiry) {
      console.error('Inquiry fetch error:', inquiryError);
      // Reply was created successfully, just email failed
      return NextResponse.json({
        data: reply,
        emailSent: false,
        warning: 'Reply created but email notification failed',
      });
    }

    // Send email notification
    let emailSent = false;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/email/send-reply-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inquiry.email,
          inquiryId: id,
          replyTitle: reply.title,
          replyContent: reply.content,
        }),
      });
      emailSent = response.ok;
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    return NextResponse.json({ data: reply, emailSent });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.issues },
        { status: 400 }
      );
    }
    console.error('Reply creation error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
