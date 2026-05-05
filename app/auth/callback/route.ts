import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // Check if user has a role assigned
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'candidate') {
        return NextResponse.redirect(new URL('/candidate/dashboard', requestUrl.origin));
      }
      if (profile?.role === 'recruiter') {
        return NextResponse.redirect(new URL('/recruiter/dashboard', requestUrl.origin));
      }
      // No role yet → role selection
      return NextResponse.redirect(new URL('/register', requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
