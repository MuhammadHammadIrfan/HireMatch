'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HMButton from '@/components/ui/HMButton';
import { scoreColor } from '@/lib/types';

interface Props {
  job: { id: string; title: string; recruiters?: { company_name: string } | null };
  application: { reference_code: string; match_score: number | null; submitted_at: string };
  userId: string;
}

export default function ApplyConfirmationClient({ job, application }: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const companyName = job.recruiters?.company_name ?? 'the company';

  useEffect(() => {
    const t = setTimeout(() => setChecked(true), 400);
    return () => clearTimeout(t);
  }, []);

  const score = application.match_score ?? 0;
  const submittedDate = new Date(application.submitted_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-hm-surface flex flex-col items-center justify-center px-7">
      {/* Animated checkmark */}
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{
          background: 'rgba(16,185,129,0.10)',
          transform: checked ? 'scale(1)' : 'scale(0)',
          transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
        <svg width={52} height={52} viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="25" fill="rgba(16,185,129,0.15)" />
          <path d="M14 26l9 9 15-15" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
            fill="none" className="hm-check-path" />
        </svg>
      </div>

      <h1 className="text-2xl font-black text-hm-textP mb-2.5 text-center">Application Submitted!</h1>
      <p className="text-sm text-hm-textS text-center leading-relaxed mb-7">
        Your application for <strong className="text-hm-textP">{job.title}</strong> at{' '}
        <strong className="text-hm-textP">{companyName}</strong> has been submitted successfully.
      </p>

      <div className="bg-white rounded-2xl p-5 w-full mb-7 border border-hm-border">
        <div className="flex justify-between mb-2.5">
          <div className="text-[13px] text-hm-textS">Reference</div>
          <div className="text-[13px] font-bold text-hm-primary">{application.reference_code}</div>
        </div>
        <div className="flex justify-between mb-2.5">
          <div className="text-[13px] text-hm-textS">Match Score</div>
          <div className="text-[13px] font-bold" style={{ color: scoreColor(score) }}>{score}%</div>
        </div>
        <div className="flex justify-between">
          <div className="text-[13px] text-hm-textS">Submitted</div>
          <div className="text-[13px] font-semibold text-hm-textP">{submittedDate}</div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2.5">
        <HMButton onClick={() => router.push('/candidate/applications')}>Track My Application</HMButton>
        <HMButton variant="secondary" onClick={() => router.push('/candidate/dashboard')}>Back to Dashboard</HMButton>
      </div>
    </div>
  );
}
