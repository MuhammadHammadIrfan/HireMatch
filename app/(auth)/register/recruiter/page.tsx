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
      await completeRecruiterSetup({
        companyName: form.company,
        companySize: form.size,
        industry: form.industry
      });
      router.push('/recruiter/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to complete setup');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <BackHeader title="Recruiter Account" onBack={() => router.push('/register')} />
      <div className="flex-1 px-5 pb-32 overflow-y-auto pt-5">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-1 rounded-full bg-hm-primary" />
          <div className="flex-1 h-1 rounded-full bg-hm-border" />
          <span className="text-[11px] text-hm-textS ml-1">Step 1 of 2</span>
        </div>
        <h2 className="text-xl font-bold text-hm-textP mb-5">Company Details</h2>

        {error && <div className="bg-hm-redBg border border-hm-red rounded-[10px] px-3.5 py-2.5 mb-4 text-[13px] text-hm-red font-medium">⚠ {error}</div>}

        <HMInput label="Company Name" placeholder="e.g. Acme Corp" value={form.company} onChange={set('company')} />

        <div className="mb-4">
          <div className="text-[13px] font-semibold text-hm-textS mb-2">Company Size</div>
          <div className="flex gap-1.5 flex-wrap">
            {SIZES.map(s => (
              <button key={s} onClick={() => set('size')(s)}
                className="px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150 font-sans"
                style={{
                  border: `1.5px solid ${form.size === s ? '#1565C0' : '#E0E7EF'}`,
                  background: form.size === s ? 'rgba(21,101,192,0.09)' : 'white',
                  color: form.size === s ? '#1565C0' : '#5A6A7A',
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <HMInput label="Industry" placeholder="e.g. Technology, Finance…" value={form.industry} onChange={set('industry')} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 pt-4 pb-8 bg-white border-t border-hm-border">
        <HMButton loading={loading} onClick={handleRegister}>Complete Setup</HMButton>
      </div>
    </div>
  );
}
