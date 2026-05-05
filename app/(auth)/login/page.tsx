'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HMInput from '@/components/ui/HMInput';
import HMButton from '@/components/ui/HMButton';
import { createClient } from '@/lib/supabase/client';
import { Analytics } from '@/lib/analytics';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [topError, setTopError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'This field is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Please enter a valid email';
    if (!password) e.password = 'This field is required';
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTopError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setTopError(error.message); return; }

    // Get user role to redirect
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('users').select('role, email, full_name').eq('id', user.id).single();
      Analytics.identify(user.id, { email: profile?.email ?? user.email ?? '', role: profile?.role ?? 'candidate', name: profile?.full_name ?? undefined });
      Analytics.login('email', profile?.role ?? 'candidate');
      if (profile?.role === 'recruiter') router.push('/recruiter/dashboard');
      else router.push('/candidate/dashboard');
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    Analytics.login('google', role);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setTopError(error.message); setGoogleLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pb-10">
      <div className="pt-16 text-center mb-7">
        <div className="w-13 h-13 rounded-2xl flex items-center justify-center mx-auto mb-3.5"
          style={{ background: 'rgba(21,101,192,0.09)', width: 52, height: 52 }}>
          <svg width={28} height={28} viewBox="0 0 48 48" fill="none">
            <rect x="6" y="16" width="36" height="26" rx="5" fill="#1565C0" fillOpacity="0.8"/>
            <rect x="16" y="10" width="16" height="10" rx="3" fill="#1565C0"/>
            <circle cx="36" cy="12" r="8" fill="#FFD54F"/>
            <path d="M33 12l2 2 4-4" stroke="#1565C0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-black text-hm-textP mb-1">Welcome back</h1>
        <p className="text-sm text-hm-textS">Smart Jobs. Real Matches.</p>
      </div>

      {topError && (
        <div className="bg-hm-redBg border border-hm-red rounded-[10px] px-3.5 py-2.5 mb-4 text-[13px] text-hm-red font-medium">
          ⚠ {topError}
        </div>
      )}

      {/* Role Toggle */}
      <div className="flex bg-hm-surface rounded-xl p-1 mb-5 gap-1">
        {(['candidate', 'recruiter'] as const).map(r => (
          <button key={r} onClick={() => setRole(r)}
            className={[
              'flex-1 h-[38px] rounded-[9px] border-none font-semibold text-sm cursor-pointer transition-all duration-200 font-sans',
              role === r ? 'bg-hm-primary text-white' : 'bg-transparent text-hm-textS',
            ].join(' ')}>
            {r === 'candidate' ? '👤 Candidate' : '🏢 Recruiter'}
          </button>
        ))}
      </div>

      <HMInput label="Email Address" type="email" placeholder="Enter your email"
        value={email} onChange={v => { setEmail(v); setErrors(e => ({ ...e, email: '' })); setTopError(''); }}
        error={errors.email} icon="✉" />
      <HMInput label="Password" type={showPw ? 'text' : 'password'} placeholder="Enter your password"
        value={password} onChange={v => { setPassword(v); setErrors(e => ({ ...e, password: '' })); }}
        error={errors.password} icon="🔒" rightIcon={showPw ? '🙈' : '👁'} onRightIconClick={() => setShowPw(!showPw)} />

      <div className="text-right -mt-2 mb-5">
        <Link href="/forgot-password" className="text-hm-primary text-[13px] font-semibold no-underline">
          Forgot Password?
        </Link>
      </div>

      <HMButton loading={loading} onClick={handleLogin}>Login</HMButton>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-hm-border" />
        <span className="text-xs text-hm-textS">or continue with</span>
        <div className="flex-1 h-px bg-hm-border" />
      </div>

      <button onClick={handleGoogle} disabled={googleLoading}
        className="w-full h-12 border-[1.5px] border-hm-border rounded-[10px] bg-white flex items-center justify-center gap-2.5 font-sans text-sm font-semibold text-hm-textP cursor-pointer hover:bg-hm-surface transition-colors">
        <svg width={20} height={20} viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <div className="text-center mt-6 text-[13px] text-hm-textS">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-hm-primary font-bold no-underline">Register</Link>
      </div>
    </div>
  );
}
