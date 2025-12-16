import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();

  // scope: 'global' - 모든 세션에서 로그아웃
  const { error } = await supabase.auth.signOut({ scope: 'global' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Supabase 쿠키 삭제 (sb-로 시작하는 모든 쿠키)
  const response = NextResponse.json({ success: true });
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-')) {
      response.cookies.delete(cookie.name);
    }
  }

  return response;
}
