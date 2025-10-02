import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createDecipheriv } from 'node:crypto';

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

// Generate 6-character alphanumeric auth code
function generateAuthCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { keyId, title, content, email, name, phone } = body;

    // Validate required fields
    if (!keyId || !title || !content || !email || !name) {
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

    // Get and consume one-time key
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

    // Decrypt fields
    const decryptedTitle = await decryptAES(title.encrypted, keyData.key, title.iv);
    const decryptedContent = await decryptAES(content.encrypted, keyData.key, content.iv);
    const decryptedEmail = await decryptAES(email.encrypted, keyData.key, email.iv);
    const decryptedName = await decryptAES(name.encrypted, keyData.key, name.iv);
    const decryptedPhone = phone ? await decryptAES(phone.encrypted, keyData.key, phone.iv) : null;

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
      return new Response(
        JSON.stringify({ error: 'Failed to submit inquiry' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Send email notification (invoke send-auth-code function)
    try {
      await supabase.functions.invoke('send-auth-code', {
        body: {
          email: decryptedEmail,
          authCode: inquiry.auth_code,
          inquiryId: inquiry.id,
        },
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    return new Response(
      JSON.stringify({
        id: inquiry.id,
        message: 'Inquiry submitted successfully. Check your email for verification code.',
      }),
      {
        status: 201,
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
