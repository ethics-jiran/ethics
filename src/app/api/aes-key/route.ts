import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function OPTIONS() {
  return new NextResponse('ok', { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    // Create Supabase client with service role
    const supabase = await createClient();

    // Generate random key ID and AES key
    const keyId = crypto.randomUUID().replace(/-/g, '');
    const keyBytes = new Uint8Array(32); // 256-bit key
    crypto.getRandomValues(keyBytes);
    const key = Array.from(keyBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Calculate expiry (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Store in database
    const { error } = await supabase.from('aes_keys').insert({
      key_id: keyId,
      key,
      expires_at: expiresAt,
      consumed: false,
    });

    if (error) {
      console.error('Failed to store key:', error);
      return NextResponse.json(
        { error: 'Failed to generate encryption key' },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    return NextResponse.json(
      {
        keyId,
        key,
        expiresIn: 300, // 5 minutes
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
