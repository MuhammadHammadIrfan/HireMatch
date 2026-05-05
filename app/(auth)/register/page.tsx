'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackHeader from '@/components/layout/BackHeader';
import HMButton from '@/components/ui/HMButton';
import { completeCandidateSetup } from '@/app/actions/auth';

export default function RegisterRolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<'candidate' | 'recruiter' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const OPTIONS = [
    { key: 'candidate' as const, icon: '🔍', title: "I'm a Job Seeker", sub: 'Find jobs that match your skills and experience' },
    { key: 'recruiter' as const, icon: '🏢', title: "I'm a Recruiter", sub: 'Post jobs and find the best candidates using AI matching' },
  ];

  const handleContinue = async () => {
    if (!selected) return;
    
    if (selected === 'candidate') {
      try {
        setLoading(true);
        setError('');
        await completeCandidateSetup();
        router.push('/candidate/dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to complete setup');
        setLoading(false);
      }
    } else {
      router.push('/register/recruiter');
    }
  };

  return (
    <div className="min-h-screen bg-hm-surface px-5 pb-10 flex flex-col">
      <div className="pt-2 pb-8 mt-12">
        <h1 className="text-[26px] font-black text-hm-textP mb-2">Join HireMatch</h1>
        <p className="text-sm text-hm-textS">Choose how you want to use the platform</p>
      </div>

      {error && <div className="bg-hm-redBg border border-hm-red rounded-[10px] px-3.5 py-2.5 mb-4 text-[13px] text-hm-red font-medium">⚠ {error}</div>}

      {OPTIONS.map(opt => (
        <div key={opt.key} onClick={() => setSelected(opt.key)}
          className="bg-white rounded-2xl p-6 mb-4 cursor-pointer transition-all duration-200"
          style={{
            border: `2px solid ${selected === opt.key ? '#1565C0' : '#E0E7EF'}`,
            boxShadow: selected === opt.key ? '0 0 0 4px rgba(21,101,192,0.09)' : 'none',
          }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[26px] mb-3.5"
            style={{ background: selected === opt.key ? 'rgba(21,101,192,0.09)' : '#F0F4F8' }}>
            {opt.icon}
          </div>
          <div className="text-lg font-bold text-hm-textP mb-1.5">{opt.title}</div>
          <div className="text-[13px] text-hm-textS leading-relaxed">{opt.sub}</div>
          {selected === opt.key && (
            <div className="mt-3 text-xs text-hm-primary font-semibold">✓ Selected</div>
          )}
        </div>
      ))}

      <div className="mt-auto pt-4">
        <HMButton
          disabled={!selected || loading}
          loading={loading}
          onClick={handleContinue}
        >
          Continue →
        </HMButton>
      </div>
    </div>
  );
}
