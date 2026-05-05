'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BackHeader from '@/components/layout/BackHeader';
import HMButton from '@/components/ui/HMButton';

export default function RegisterRolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<'candidate' | 'recruiter' | null>(null);

  const OPTIONS = [
    { key: 'candidate' as const, icon: '🔍', title: "I'm a Job Seeker", sub: 'Find jobs that match your skills and experience' },
    { key: 'recruiter' as const, icon: '🏢', title: "I'm a Recruiter", sub: 'Post jobs and find the best candidates using AI matching' },
  ];

  return (
    <div className="min-h-screen bg-hm-surface px-5 pb-10">
      <BackHeader title="" onBack={() => router.push('/login')} />
      <div className="pt-2 pb-8">
        <h1 className="text-[26px] font-black text-hm-textP mb-2">Join HireMatch</h1>
        <p className="text-sm text-hm-textS">Choose how you want to use the platform</p>
      </div>

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

      <div className="sticky bottom-0 pt-4">
        <HMButton
          disabled={!selected}
          onClick={() => router.push(selected === 'candidate' ? '/register/candidate' : '/register/recruiter')}
        >
          Continue →
        </HMButton>
      </div>
    </div>
  );
}
