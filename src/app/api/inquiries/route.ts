import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createInquirySchema } from '@/lib/validations/inquiry';
import { decrypt } from '@/lib/crypto-server';
import { ZodError } from 'zod';
import type { Database } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createInquirySchema.parse(body);

    // Decrypt encrypted fields if present
    const privateKey = process.env.RSA_PRIVATE_KEY!;

    const title = validated.encrypted_title
      ? decrypt(validated.encrypted_title, privateKey)
      : validated.title!;

    const content = validated.encrypted_content
      ? decrypt(validated.encrypted_content, privateKey)
      : validated.content!;

    const email = validated.encrypted_email
      ? decrypt(validated.encrypted_email, privateKey)
      : validated.email!;

    const name = validated.encrypted_name
      ? decrypt(validated.encrypted_name, privateKey)
      : validated.name!;

    const phone = validated.encrypted_phone
      ? decrypt(validated.encrypted_phone, privateKey)
      : validated.phone || null;

    // Generate 6-character alphanumeric auth code
    const authCode = Array.from({ length: 6 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
    ).join('');

    // Use service role for inserting anonymous inquiries
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        title,
        content,
        email,
        name,
        phone,
        auth_code: authCode,
      })
      .select('id, auth_code')
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Trigger email Edge Function
    try {
      await supabase.functions.invoke('send-auth-code', {
        body: {
          email: validated.email,
          authCode: data.auth_code,
          inquiryId: data.id,
        },
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails - user can still check with auth code
    }

    return NextResponse.json(
      {
        id: data.id,
        message: 'Inquiry submitted successfully. Check your email for verification code.',
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.errors },
        { status: 400 }
      );
    }
    console.error('Inquiry creation error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
