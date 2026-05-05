'use client';
import { useRouter } from 'next/navigation';
import HMButton from '@/components/ui/HMButton';
import { createClient } from '@/lib/supabase/client';

export default function VerifyPage() {
  const router = useRouter();
  const checkAndContinue = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (profile?.role === 'recruiter') router.push('/recruiter/jobs/new');
      else router.push('/candidate/resume/upload');
    } else {
      router.push('/candidate/resume/upload');
    }
  };
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
      <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6 animate-hm-pulse"
        style={{ background: 'rgba(21,101,192,0.09)' }}>✉️</div>
      <h1 className="text-2xl font-black text-hm-textP mb-3 text-center">Verify Your Email</h1>
      <p className="text-sm text-hm-textS text-center leading-relaxed mb-2">We&apos;ve sent a verification link to your email</p>
      <button className="bg-transparent border-none text-hm-primary text-sm font-semibold cursor-pointer mb-8">Resend Email</button>
      <div className="w-full"><HMButton onClick={checkAndContinue}>Continue to Profile Setup →</HMButton></div>
      <p className="mt-4 text-xs text-hm-textS text-center">Check your spam folder if you don&apos;t see the email</p>
    </div>
  );
}
