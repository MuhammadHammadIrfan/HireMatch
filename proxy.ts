import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Public paths
  const isPublic = ['/', '/login', '/register', '/verify', '/forgot-password', '/auth/callback']
    .some(p => pathname.startsWith(p));

  // API routes — always allow
  if (pathname.startsWith('/api/')) return supabaseResponse;

  // Not authenticated → redirect to login
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Authenticated: get role from DB
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;

    // Candidate trying to access recruiter routes
    if (role === 'candidate' && pathname.startsWith('/recruiter')) {
      return NextResponse.redirect(new URL('/candidate/dashboard', request.url));
    }

    // Recruiter trying to access candidate routes
    if (role === 'recruiter' && pathname.startsWith('/candidate')) {
      return NextResponse.redirect(new URL('/recruiter/dashboard', request.url));
    }

    // Authenticated user hitting root → redirect to dashboard
    if (pathname === '/' && role) {
      return NextResponse.redirect(
        new URL(role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard', request.url)
      );
    }

    // Authenticated but no role → must complete registration
    if (!role && pathname !== '/register' && !pathname.startsWith('/register') && pathname !== '/verify') {
      return NextResponse.redirect(new URL('/register', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.png|.*\\.webp).*)'],
};
