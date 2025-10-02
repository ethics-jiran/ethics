import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
      return new Response(
        JSON.stringify({ error: 'Failed to generate encryption key' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        keyId,
        key,
        expiresIn: 300, // 5 minutes
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
