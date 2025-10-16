import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

export async function OPTIONS() {
  return new NextResponse('ok', { headers: corsHeaders });
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the latest policy (sorted by updated_at)
    const { data, error } = await supabase
      .from('policy')
      .select('id, title, content, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Policy not found' },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    return NextResponse.json(
      { data },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err) {
    console.error('Error fetching policy:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
