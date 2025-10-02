import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createCipheriv, createDecipheriv } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AES-GCM decryption
async function decryptAES(encryptedBase64: string, keyHex: string, ivBase64: string): Promise<string> {
  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(ivBase64, 'base64');
  const encrypted = Buffer.from(encryptedBase64, 'base64');

  // GCM mode: last 16 bytes are the auth tag
  const authTag = encrypted.subarray(-16);
  const ciphertext = encrypted.subarray(0, -16);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

// AES-GCM encryption
async function encryptAES(plaintext: string, keyHex: string): Promise<{ iv: string; encrypted: string }> {
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();
  const result = Buffer.concat([encrypted, authTag]);

  return {
    iv: Buffer.from(iv).toString('base64'),
    encrypted: result.toString('base64'),
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { keyId, email, authCode } = body;

    // Validate required fields
    if (!keyId || !email || !authCode) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get and consume one-time key for request
    const { data: keyData, error: keyError } = await supabase
      .from('aes_keys')
      .select('key, expires_at, consumed')
      .eq('key_id', keyId)
      .single();

    if (keyError || !keyData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired encryption key' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if already consumed or expired
    if (keyData.consumed || new Date(keyData.expires_at) < new Date()) {
      await supabase.from('aes_keys').delete().eq('key_id', keyId);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired encryption key' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Mark key as consumed
    await supabase.from('aes_keys').update({ consumed: true }).eq('key_id', keyId);

    // Decrypt request fields
    const decryptedEmail = await decryptAES(email.encrypted, keyData.key, email.iv);
    const decryptedAuthCode = (await decryptAES(authCode.encrypted, keyData.key, authCode.iv)).toUpperCase();

    // Query inquiry
    const { data, error } = await supabase
      .from('inquiries')
      .select('id, title, content, email, name, phone, status, created_at, reply_title, reply_content, replied_at')
      .eq('email', decryptedEmail)
      .eq('auth_code', decryptedAuthCode)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or verification code' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate new session AES key for encrypting response
    const responseKeyBytes = new Uint8Array(32);
    crypto.getRandomValues(responseKeyBytes);
    const responseKey = Array.from(responseKeyBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

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
      reply_title: data.reply_title ? await encryptAES(data.reply_title, responseKey) : null,
      reply_content: data.reply_content ? await encryptAES(data.reply_content, responseKey) : null,
      replied_at: data.replied_at,
    };

    // Return encrypted data with response key
    return new Response(
      JSON.stringify({
        aesKey: responseKey,
        data: encryptedData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
