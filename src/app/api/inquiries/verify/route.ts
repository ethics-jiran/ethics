import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyInquirySchema } from '@/lib/validations/inquiry';
import { decrypt } from '@/lib/crypto-server';
import { ZodError } from 'zod';
import type { Database } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = verifyInquirySchema.parse(body);

    // Decrypt email if encrypted
    const privateKey = process.env.RSA_PRIVATE_KEY!;
    const email = validated.encrypted_email
      ? decrypt(validated.encrypted_email, privateKey)
      : validated.email!;

    const authCode = validated.authCode.toUpperCase();

    // Use service role for verifying anonymous inquiries
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('inquiries')
      .select(
        'id, title, content, email, name, phone, status, created_at, reply_title, reply_content, replied_at'
      )
      .eq('email', email)
      .eq('auth_code', authCode)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Invalid email or verification code' },
        { status: 401 }
      );
    }

    // Response is sent in plain text since user has already authenticated
    // The request (email) was encrypted, protecting it in transit
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.errors },
        { status: 400 }
      );
    }
    console.error('Verification error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
