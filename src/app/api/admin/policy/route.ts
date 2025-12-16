import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth/verify-admin';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check auth + MFA (AAL2)
    const authResult = await verifyAdmin(supabase);
    if (!authResult.success) {
      return authResult.response;
    }

    // Get the latest policy
    const { data, error } = await supabase
      .from('policy')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error('Error fetching policy:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
