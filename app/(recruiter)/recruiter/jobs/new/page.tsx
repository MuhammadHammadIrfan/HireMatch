'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackHeader from '@/components/layout/BackHeader';
import HMInput from '@/components/ui/HMInput';
import HMTextarea from '@/components/ui/HMTextarea';
import HMSelect from '@/components/ui/HMSelect';
import HMButton from '@/components/ui/HMButton';
import HMToast from '@/components/ui/HMToast';
import { createClient } from '@/lib/supabase/client';

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const EXP_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead'];

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', department: '', type: '', location: '', remote: false,
    description: '', skills: [] as string[], experience: '', salary: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [skillImportance, setSkillImportance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<null | 'draft' | 'publish'>(null);
  const [toast, setToast] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm(f => ({ ...f, skills: [...f.skills, newSkill.trim()] }));
      setSkillImportance(s => ({ ...s, [newSkill.trim()]: 'high' }));
      setNewSkill('');
    }
  };

  const publish = async (isDraft: boolean) => {
    setLoading(isDraft ? 'draft' : 'publish');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(null); return; }

    const jobData = {
      recruiter_id: user.id,
      title: form.title || 'Untitled Job',
      department: form.department,
      employment_type: form.type,
      location: form.location,
      is_remote: form.remote,
      description: form.description,
      experience_level: form.experience,
      salary_range: form.salary,
      status: isDraft ? 'draft' : 'active',
      skills: form.skills.map(s => ({ name: s, importance: skillImportance[s] ?? 'high' })),
      published_at: isDraft ? null : new Date().toISOString(),
    };

    const { data: job, error } = await supabase.from('jobs').insert(jobData).select().single();

    if (error) { setToast('Failed to save job'); setLoading(null); return; }

    // Generate embedding for active jobs
    if (!isDraft && job) {
      fetch('/api/jobs/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      }).catch(() => {});
    }

    setLoading(null);
    setToast(isDraft ? 'Draft saved successfully' : 'Job published successfully!');
    setTimeout(() => router.push('/recruiter/jobs'), 1200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {toast && <HMToast message={toast} onClose={() => setToast(null)} />}
      <BackHeader title="Post a New Job" onBack={() => router.push('/recruiter/dashboard')} />
      <div className="flex-1 px-5 pt-5 pb-32 overflow-y-auto">
        <HMInput label="Job Title" placeholder="e.g. Senior Frontend Developer" value={form.title} onChange={set('title') as (v: string) => void} />
        <HMInput label="Department" placeholder="e.g. Engineering" value={form.department} onChange={set('department') as (v: string) => void} />

        <div className="mb-4">
          <div className="text-[13px] font-semibold text-hm-textS mb-2">Employment Type</div>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map(t => (
              <button key={t} onClick={() => set('type')(t)}
                className="px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer font-sans transition-all duration-150"
                style={{
                  border: `1.5px solid ${form.type === t ? '#1565C0' : '#E0E7EF'}`,
                  background: form.type === t ? 'rgba(21,101,192,0.09)' : 'white',
                  color: form.type === t ? '#1565C0' : '#5A6A7A',
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <HMInput label="Location" placeholder="e.g. San Francisco, CA" value={form.location} onChange={set('location') as (v: string) => void} />

        <div className="flex items-center justify-between mb-4 px-3.5 py-3 bg-hm-surface rounded-[10px]">
          <div className="text-sm font-semibold text-hm-textP">🌐 Remote OK</div>
          <div onClick={() => set('remote')(!form.remote)}
            className="w-11 h-[26px] rounded-full cursor-pointer relative transition-colors duration-200"
            style={{ background: form.remote ? '#1565C0' : '#E0E7EF' }}>
            <div className="w-5 h-5 rounded-full bg-white absolute top-[3px] transition-all duration-200"
              style={{ left: form.remote ? 20 : 3, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>
        </div>

        <HMTextarea label="Job Description" placeholder="Describe the role…" value={form.description}
          onChange={set('description') as (v: string) => void} rows={5} maxLength={2000} />

        <div className="mb-4">
          <div className="text-[13px] font-semibold text-hm-textS mb-2">Required Skills</div>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {form.skills.map(s => (
              <div key={s} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full"
                style={{ background: 'rgba(21,101,192,0.09)' }}>
                <span className="text-xs font-semibold text-hm-primary">{s}</span>
                <select value={skillImportance[s] ?? 'high'}
                  onChange={e => setSkillImportance(si => ({ ...si, [s]: e.target.value }))}
                  className="border-none bg-transparent text-[10px] font-bold cursor-pointer outline-none"
                  style={{ color: skillImportance[s] === 'high' ? '#C62828' : skillImportance[s] === 'medium' ? '#F57F17' : '#5A6A7A' }}>
                  <option value="high">HIGH</option>
                  <option value="medium">MED</option>
                  <option value="low">LOW</option>
                </select>
                <button onClick={() => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))}
                  className="bg-transparent border-none cursor-pointer text-hm-primary text-base leading-none px-1">×</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()}
              placeholder="Type skill + Enter"
              className="flex-1 h-10 border-[1.5px] border-hm-border rounded-lg px-3 font-sans text-[13px] outline-none" />
            <button onClick={addSkill}
              className="h-10 px-4 rounded-lg bg-hm-primary text-white border-none font-bold text-[13px] cursor-pointer whitespace-nowrap">+ Add</button>
          </div>
        </div>

        <HMSelect label="Experience Level" value={form.experience} onChange={set('experience') as (v: string) => void} options={EXP_LEVELS} />
        <HMInput label="Salary Range (optional)" placeholder="e.g. $80k – $120k" value={form.salary} onChange={set('salary') as (v: string) => void} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 pt-3.5 pb-8 bg-white border-t border-hm-border flex gap-2.5">
        <HMButton variant="secondary" className="flex-1" loading={loading === 'draft'} onClick={() => publish(true)}>Save Draft</HMButton>
        <HMButton className="flex-[2]" loading={loading === 'publish'} onClick={() => publish(false)}>Publish Job</HMButton>
      </div>
    </div>
  );
}
