import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth/verify-admin';

// GET - Fetch all FAQs (admin)
export async function GET() {
  try {
    const supabase = await createClient();

    // Check auth + MFA (AAL2)
    const authResult = await verifyAdmin(supabase);
    if (!authResult.success) {
      return authResult.response;
    }

    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching FAQs:', error);
      return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new FAQ
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth + MFA (AAL2)
    const authResult = await verifyAdmin(supabase);
    if (!authResult.success) {
      return authResult.response;
    }

    const body = await request.json();
    const { title, content, display_order, is_active } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('faqs')
      .insert({
        title,
        content: content || null,
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating FAQ:', error);
      return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
