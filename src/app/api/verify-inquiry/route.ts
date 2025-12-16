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

// Helper: Convert Uint8Array to base64
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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

// AES-GCM encryption using Web Crypto API
async function encryptAES(
  plaintext: string,
  keyHex: string
): Promise<{ iv: string; encrypted: string }> {
  const keyBytes = hexToBytes(keyHex);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Import key
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // Encode plaintext
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    data
  );

  return {
    iv: bytesToBase64(iv),
    encrypted: bytesToBase64(new Uint8Array(encrypted)),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyId, email, authCode } = body;

    // Validate required fields
    if (!keyId || !email || !authCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Use admin client to bypass RLS for anonymous access
    const supabase = createAdminClient();

    // Get and consume one-time key for request
    const { data: keyData, error: keyError } = await supabase
      .from('aes_keys')
      .select('key, expires_at, consumed')
      .eq('key_id', keyId)
      .single();

    if (keyError || !keyData) {
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
    await supabase
      .from('aes_keys')
      .update({ consumed: true })
      .eq('key_id', keyId);

    // Decrypt request fields
    const decryptedEmail = await decryptAES(
      email.encrypted,
      keyData.key,
      email.iv
    );
    const decryptedAuthCode = (
      await decryptAES(authCode.encrypted, keyData.key, authCode.iv)
    ).toUpperCase();

    // Query inquiry with replies
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        id,
        title,
        content,
        email,
        name,
        phone,
        status,
        created_at,
        replies:inquiry_replies(
          id,
          title,
          content,
          status,
          created_at
        )
      `)
      .eq('email', decryptedEmail)
      .eq('auth_code', decryptedAuthCode)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Invalid email or verification code' },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Generate new session AES key for encrypting response
    const responseKeyBytes = new Uint8Array(32);
    crypto.getRandomValues(responseKeyBytes);
    const responseKey = Array.from(responseKeyBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Sort replies by creation date (oldest first for user view)
    const replies = (data.replies || []).sort((a: any, b: any) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Encrypt each field with response key
    const encryptedData = {
      id: data.id,
      title: await encryptAES(data.title, responseKey),
      content: await encryptAES(data.content, responseKey),
      email: await encryptAES(data.email, responseKey),
      name: await encryptAES(data.name, responseKey),
      phone: data.phone ? await encryptAES(data.phone, responseKey) : null,
      status: data.status,
      created_at: data.created_at,
      replies: await Promise.all(
        replies.map(async (reply: any) => ({
          id: reply.id,
          title: await encryptAES(reply.title, responseKey),
          content: await encryptAES(reply.content, responseKey),
          status: reply.status,
          created_at: reply.created_at,
        }))
      ),
    };

    // Return encrypted data with response key
    return NextResponse.json(
      {
        aesKey: responseKey,
        data: encryptedData,
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
