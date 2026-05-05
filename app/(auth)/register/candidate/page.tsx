'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BackHeader from '@/components/layout/BackHeader';
import HMInput from '@/components/ui/HMInput';
import HMButton from '@/components/ui/HMButton';
import HMProgressBar from '@/components/ui/HMProgressBar';
import { createClient } from '@/lib/supabase/client';

function pwStrength(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH_COLORS = ['#E0E7EF', '#C62828', '#F57F17', '#F9A825', '#2E7D32'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

export default function CandidateRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const strength = pwStrength(form.password);

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError('Please fill all fields'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) { setError(signUpError.message); setLoading(false); return; }

    // Set role in users table
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('users').upsert({ id: user.id, email: form.email, full_name: form.name, role: 'candidate' });
      await supabase.from('candidates').upsert({ id: user.id });
    }

    setLoading(false);
    router.push('/verify');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <BackHeader title="Create Account" onBack={() => router.push('/register')} />
      <div className="flex-1 px-5 pb-28 overflow-y-auto pt-5">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-1 rounded-full bg-hm-primary" />
          <div className="flex-1 h-1 rounded-full bg-hm-border" />
          <span className="text-[11px] text-hm-textS ml-1">Step 1 of 2</span>
        </div>
        <h2 className="text-xl font-bold text-hm-textP mb-5">Your Details</h2>

        {error && <div className="bg-hm-redBg border border-hm-red rounded-[10px] px-3.5 py-2.5 mb-4 text-[13px] text-hm-red font-medium">⚠ {error}</div>}

        <HMInput label="Full Name" placeholder="Enter your full name" value={form.name} onChange={set('name')} />
        <HMInput label="Email Address" type="email" placeholder="Enter your email" value={form.email} onChange={set('email')} />
        <HMInput label="Password" type={showPw ? 'text' : 'password'} placeholder="Create a password"
          value={form.password} onChange={set('password')} rightIcon={showPw ? '🙈' : '👁'} onRightIconClick={() => setShowPw(!showPw)} />

        {form.password && (
          <div className="-mt-2 mb-4">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex-1 h-1 rounded-full transition-colors duration-200"
                  style={{ background: i <= strength ? STRENGTH_COLORS[strength] : '#E0E7EF' }} />
              ))}
            </div>
            <div className="text-[11px] font-semibold" style={{ color: STRENGTH_COLORS[strength] }}>
              {STRENGTH_LABELS[strength]}
            </div>
          </div>
        )}

        <HMInput label="Confirm Password" type="password" placeholder="Confirm your password"
          value={form.confirm} onChange={set('confirm')} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 pt-4 pb-8 bg-white border-t border-hm-border">
        <HMButton loading={loading} onClick={handleRegister}>Create Account</HMButton>
        <div className="text-center mt-3.5 text-[13px] text-hm-textS">
          Already have an account?{' '}
          <Link href="/login" className="text-hm-primary font-bold no-underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
