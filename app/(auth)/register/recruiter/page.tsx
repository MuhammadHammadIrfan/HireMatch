'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackHeader from '@/components/layout/BackHeader';
import HMInput from '@/components/ui/HMInput';
import HMButton from '@/components/ui/HMButton';
import { completeRecruiterSetup } from '@/app/actions/auth';

const SIZES = ['1–10', '11–50', '51–200', '201–500', '500+'];

export default function RecruiterRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ company: '', size: '', industry: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.company || !form.size || !form.industry) { setError('Please fill all required fields'); return; }
    try {
      setLoading(true);
      setError('');
      await completeRecruiterSetup({ companyName: form.company, companySize: form.size, industry: form.industry });
      router.push('/recruiter/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to complete setup');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <BackHeader title="Company Setup" onBack={() => router.push('/register')} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-5 pb-32 md:pb-10 max-w-2xl md:mx-auto md:w-full">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>1</div>
            <div className="flex-1 h-1 rounded-full" style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }} />
            <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-hm-textS bg-hm-border">2</div>
            <div className="flex-1 h-1 rounded-full bg-hm-border" />
            <span className="text-xs text-hm-textS font-medium">Step 1 of 2</span>
          </div>

          <h2 className="font-display text-2xl font-black text-hm-navy mb-1" style={{ letterSpacing: '-0.5px' }}>
            Company Details
          </h2>
          <p className="text-sm text-hm-textS mb-6" style={{ fontFamily: 'var(--font-dm, DM Sans, system-ui)' }}>
            Tell us about your organization
          </p>

          {error && (
            <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5 text-sm"
              style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', color: '#F43F5E' }}>
              <span>⚠</span>
              <span style={{ fontFamily: 'var(--font-dm, DM Sans, system-ui)' }}>{error}</span>
            </div>
          )}

          <HMInput label="Company Name" placeholder="e.g. Acme Corp" value={form.company} onChange={set('company')} />

          <div className="mb-5">
            <div className="text-xs font-semibold text-hm-textS mb-2 uppercase tracking-wide">Company Size</div>
            <div className="flex gap-2 flex-wrap">
              {SIZES.map(s => (
                <button key={s} onClick={() => set('size')(s)}
                  className="px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150"
                  style={{
                    border: `1.5px solid ${form.size === s ? '#3B82F6' : '#E2E8F0'}`,
                    background: form.size === s ? 'rgba(59,130,246,0.08)' : 'white',
                    color: form.size === s ? '#3B82F6' : '#64748B',
                    fontFamily: 'var(--font-dm, DM Sans, system-ui)',
                    boxShadow: form.size === s ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <HMInput label="Industry" placeholder="e.g. Technology, Finance…" value={form.industry} onChange={set('industry')} />
        </div>
      </div>

      {/* Sticky bottom bar — works on both mobile and desktop */}
      <div className="sticky bottom-0 px-5 pt-4 pb-8 md:pb-5 bg-white/90 border-t border-hm-border"
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div className="max-w-2xl mx-auto">
          <HMButton loading={loading} onClick={handleRegister}>Complete Setup</HMButton>
        </div>
      </div>
    </div>
  );
}
