import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth/verify-admin';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Check auth + MFA (AAL2)
  const authResult = await verifyAdmin(supabase);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('inquiries')
    .select('id, title, email, name, status, created_at, reply_title', {
      count: 'exact',
    });

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Query error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: data.map((item) => ({ ...item, hasReply: !!item.reply_title })),
    total: count || 0,
    limit,
    offset,
  });
}
