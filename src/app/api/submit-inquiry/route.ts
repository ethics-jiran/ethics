import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

export async function OPTIONS() {
  return new NextResponse('ok', { headers: corsHeaders });
}

// Helper: Convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes as Uint8Array;
}

// Helper: Convert base64 to Uint8Array
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes as Uint8Array;
}

// AES-GCM decryption using Web Crypto API
async function decryptAES(
  encryptedBase64: string,
  keyHex: string,
  ivBase64: string
): Promise<string> {
  const keyBytes = hexToBytes(keyHex);
  const iv = base64ToBytes(ivBase64);
  const encrypted = base64ToBytes(encryptedBase64);

  // Import key
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    encrypted as BufferSource
  );

  // Convert to string
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Generate 6-character alphanumeric auth code
function generateAuthCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyId, title, content, email, name, phone } = body;

    // Validate required fields
    if (!keyId || !title || !content || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Use admin client to bypass RLS for anonymous inquiry submission
    let supabase;
    try {
      supabase = createAdminClient();
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      console.log('Service role key exists:', !!serviceKey);
      console.log('Service role key prefix:', serviceKey?.substring(0, 20) + '...');
    } catch (envError) {
      console.error('Admin client creation failed:', envError);
      return NextResponse.json(
        { error: 'Server configuration error' },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Get and consume one-time key
    const { data: keyData, error: keyError } = await supabase
      .from('aes_keys')
      .select('key, expires_at, consumed')
      .eq('key_id', keyId)
      .single();

    if (keyError) {
      console.error('Key fetch error:', keyError);
      return NextResponse.json(
        { error: 'Invalid or expired encryption key' },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (!keyData) {
      console.error('Key not found for keyId:', keyId);
      return NextResponse.json(
        { error: 'Invalid or expired encryption key' },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Check if already consumed or expired
    if (keyData.consumed || new Date(keyData.expires_at) < new Date()) {
      await supabase.from('aes_keys').delete().eq('key_id', keyId);
      return NextResponse.json(
        { error: 'Invalid or expired encryption key' },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Mark key as consumed
    await supabase.from('aes_keys').update({ consumed: true }).eq('key_id', keyId);

    // Decrypt fields
    const decryptedTitle = await decryptAES(
      title.encrypted,
      keyData.key,
      title.iv
    );
    const decryptedContent = await decryptAES(
      content.encrypted,
      keyData.key,
      content.iv
    );
    const decryptedEmail = await decryptAES(
      email.encrypted,
      keyData.key,
      email.iv
    );
    const decryptedName = await decryptAES(name.encrypted, keyData.key, name.iv);
    const decryptedPhone = phone
      ? await decryptAES(phone.encrypted, keyData.key, phone.iv)
      : null;

    // Generate auth code
    const authCode = generateAuthCode();

    // Insert inquiry
    const { data: inquiry, error: insertError } = await supabase
      .from('inquiries')
      .insert({
        title: decryptedTitle,
        content: decryptedContent,
        email: decryptedEmail,
        name: decryptedName,
        phone: decryptedPhone,
        auth_code: authCode,
      })
      .select('id, auth_code')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit inquiry' },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Fast response: DB insert only (200)
    // Enqueue outbox jobs then return immediately
    await supabase.from('notification_outbox').insert([
      {
        type: 'submit_user_email',
        payload: {
          inquiry_id: inquiry.id,
          email: decryptedEmail,
          auth_code: inquiry.auth_code,
        },
      },
      {
        type: 'submit_admin_notify',
        payload: {
          inquiry_id: inquiry.id,
        },
      },
    ]);

    return NextResponse.json(
      { id: inquiry.id },
      { status: 200, headers: corsHeaders }
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
