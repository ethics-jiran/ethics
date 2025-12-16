import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function OPTIONS() {
  return new NextResponse('ok', { headers: corsHeaders });
}

export async function GET() {
  try {
    // Use admin client to bypass RLS for public FAQ access
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching FAQs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch FAQs' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({ data }, { headers: corsHeaders });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
