'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Analytics } from '@/lib/analytics';

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [topError, setTopError] = useState('');

  const handleGoogle = async () => {
    setGoogleLoading(true);
    // Don't pass role here anymore, role is selected after login
    Analytics.login('google', 'candidate'); 
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

      {/* Removed Email, Password, and Role Toggle inputs */}

      <button onClick={handleGoogle} disabled={googleLoading}
        className="w-full h-12 border-[1.5px] border-hm-border rounded-[10px] bg-white flex items-center justify-center gap-2.5 font-sans text-sm font-semibold text-hm-textP cursor-pointer hover:bg-hm-surface transition-colors mt-auto mb-[20vh]">
        <svg width={20} height={20} viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>
    </div>
  );
}
