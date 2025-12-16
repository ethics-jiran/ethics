import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Middleware for authentication and routing
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Redirect root to admin
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isSetupMfaPath = request.nextUrl.pathname.startsWith('/setup-mfa');

  // 로그인 안 되어 있으면 로그인 페이지로
  if ((isAdminPath || isSetupMfaPath) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // MFA 체크 (admin 페이지 접근 시)
  if (isAdminPath && user) {
    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (mfaData) {
      // MFA가 설정되어 있지만 아직 인증 안 됨 (aal1 상태)
      if (mfaData.currentLevel === 'aal1' && mfaData.nextLevel === 'aal2') {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('mfa_required', 'true');
        return NextResponse.redirect(url);
      }

      // MFA가 아예 설정 안 됨
      if (mfaData.currentLevel === 'aal1' && mfaData.nextLevel === 'aal1') {
        const url = request.nextUrl.clone();
        url.pathname = '/setup-mfa';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
