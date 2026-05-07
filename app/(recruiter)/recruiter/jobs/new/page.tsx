'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HMToast from '@/components/ui/HMToast';
import { createClient } from '@/lib/supabase/client';

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const EXP_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead'];

const IMPORTANCE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  high:   { bg: 'rgba(244,63,94,0.10)',  text: '#F43F5E', label: 'HIGH' },
  medium: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B', label: 'MED' },
  low:    { bg: 'rgba(16,185,129,0.10)', text: '#10B981', label: 'LOW' },
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-wider text-hm-textS mb-2"
      style={{ fontFamily: 'var(--font-dm)' }}>
      {children}
    </div>
  );
}

function StyledInput({ value, onChange, placeholder, onKeyDown }: {
  value: string; onChange: (v: string) => void; placeholder: string; onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="w-full h-11 border border-hm-border rounded-xl px-3.5 text-[14px] text-hm-textP outline-none transition-all duration-150 bg-white"
      style={{
        fontFamily: 'var(--font-dm)',
        boxShadow: 'none',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
    />
  );
}

function StyledTextarea({ value, onChange, placeholder, rows = 5 }: {
  value: string; onChange: (v: string) => void; placeholder: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-hm-border rounded-xl px-3.5 py-3 text-[14px] text-hm-textP outline-none resize-none transition-all duration-150 bg-white"
      style={{ fontFamily: 'var(--font-dm)', lineHeight: 1.6 }}
      onFocus={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
    />
  );
}

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
    const s = newSkill.trim();
    if (s && !form.skills.includes(s)) {
      setForm(f => ({ ...f, skills: [...f.skills, s] }));
      setSkillImportance(si => ({ ...si, [s]: 'high' }));
      setNewSkill('');
    }
  };

  const cycleImportance = (skill: string) => {
    const cycle = ['high', 'medium', 'low'];
    const current = skillImportance[skill] ?? 'high';
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    setSkillImportance(si => ({ ...si, [skill]: next }));
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

    if (!isDraft && job) {
      fetch('/api/jobs/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      }).catch(() => {});
    }

    setLoading(null);
    setToast(isDraft ? 'Draft saved successfully' : 'Job published!');
    setTimeout(() => router.push('/recruiter/jobs'), 1200);
  };

  const completionItems = [
    { done: form.title.length > 0, label: 'Job title' },
    { done: form.type.length > 0, label: 'Employment type' },
    { done: form.location.length > 0, label: 'Location' },
    { done: form.description.length > 50, label: 'Description (50+ chars)' },
    { done: form.skills.length > 0, label: 'At least one skill' },
    { done: form.experience.length > 0, label: 'Experience level' },
  ];
  const completionScore = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);

  return (
    <div className="min-h-screen bg-hm-surface flex flex-col">
      {toast && <HMToast message={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white border-b border-hm-border sticky top-0 z-20">
        <div className="flex items-center px-4 pt-14 pb-4 gap-3 md:pt-5">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-hm-surface border border-hm-border flex items-center justify-center cursor-pointer hover:bg-hm-border transition-colors flex-shrink-0">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="flex-1">
            <div className="font-display text-[16px] font-black text-hm-textP">Post a Job</div>
            <div className="text-[11px] text-hm-textS" style={{ fontFamily: 'var(--font-dm)' }}>
              {completionScore}% complete
            </div>
          </div>
          {/* Completion ring */}
          <svg width={36} height={36} viewBox="0 0 36 36" className="flex-shrink-0">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#E2E8F0" strokeWidth="3"/>
            <circle cx="18" cy="18" r="15" fill="none"
              stroke={completionScore === 100 ? '#10B981' : '#3B82F6'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 15}`}
              strokeDashoffset={`${2 * Math.PI * 15 * (1 - completionScore / 100)}`}
              transform="rotate(-90 18 18)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <text x="18" y="22" textAnchor="middle" fontSize="9" fontWeight="800"
              fill={completionScore === 100 ? '#10B981' : '#3B82F6'}
              style={{ fontFamily: 'var(--font-display)' }}>
              {completionScore}%
            </text>
          </svg>
        </div>
      </div>

      <div className="flex-1 px-4 pt-5 pb-4 max-w-2xl mx-auto w-full space-y-4">

        {/* Basic info */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(59,130,246,0.10)' }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <span className="font-display text-[14px] font-bold text-hm-textP">Basic Info</span>
          </div>

          <div className="space-y-4">
            <div>
              <FieldLabel>Job Title *</FieldLabel>
              <StyledInput value={form.title} onChange={set('title') as any} placeholder="e.g. Senior Frontend Developer" />
            </div>
            <div>
              <FieldLabel>Department</FieldLabel>
              <StyledInput value={form.department} onChange={set('department') as any} placeholder="e.g. Engineering, Product, Design" />
            </div>
            <div>
              <FieldLabel>Employment Type</FieldLabel>
              <div className="flex gap-2 flex-wrap">
                {TYPES.map(t => (
                  <button key={t} onClick={() => set('type')(t)}
                    className="px-3.5 py-2 rounded-xl text-[12px] font-semibold cursor-pointer transition-all duration-150"
                    style={{
                      border: `1.5px solid ${form.type === t ? '#3B82F6' : '#E2E8F0'}`,
                      background: form.type === t ? 'rgba(59,130,246,0.08)' : 'white',
                      color: form.type === t ? '#3B82F6' : '#64748B',
                      fontFamily: 'var(--font-dm)',
                      fontWeight: form.type === t ? 700 : 500,
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(6,182,212,0.10)' }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <span className="font-display text-[14px] font-bold text-hm-textP">Location</span>
          </div>

          <div className="space-y-4">
            <div>
              <FieldLabel>Office Location</FieldLabel>
              <StyledInput value={form.location} onChange={set('location') as any} placeholder="e.g. San Francisco, CA or New York, NY" />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-hm-surface rounded-xl border border-hm-border cursor-pointer"
              onClick={() => set('remote')(!form.remote)}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: form.remote ? 'rgba(6,182,212,0.12)' : '#F1F5F9' }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={form.remote ? '#06B6D4' : '#94A3B8'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-hm-textP">Remote OK</div>
                  <div className="text-[11px] text-hm-textS" style={{ fontFamily: 'var(--font-dm)' }}>
                    Candidates can work remotely
                  </div>
                </div>
              </div>
              <div className="w-11 h-[26px] rounded-full relative transition-colors duration-200 flex-shrink-0"
                style={{ background: form.remote ? '#3B82F6' : '#E2E8F0' }}>
                <div className="w-5 h-5 rounded-full bg-white absolute top-[3px] transition-all duration-200"
                  style={{ left: form.remote ? 20 : 3, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.10)' }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <span className="font-display text-[14px] font-bold text-hm-textP">Description</span>
            {form.description.length > 0 && (
              <span className="ml-auto text-[11px] font-semibold"
                style={{ color: form.description.length > 50 ? '#10B981' : '#F59E0B', fontFamily: 'var(--font-dm)' }}>
                {form.description.length} chars
              </span>
            )}
          </div>
          <StyledTextarea
            value={form.description}
            onChange={set('description') as any}
            placeholder="Describe the role, responsibilities, and what success looks like in this position…"
            rows={6}
          />
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.12)' }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <span className="font-display text-[14px] font-bold text-hm-textP">Required Skills</span>
            {form.skills.length > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
                {form.skills.length}
              </span>
            )}
          </div>

          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {form.skills.map(s => {
                const imp = skillImportance[s] ?? 'high';
                const colors = IMPORTANCE_COLORS[imp];
                return (
                  <div key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                    style={{ background: colors.bg, border: `1px solid ${colors.text}22` }}>
                    <span className="text-[12px] font-bold text-hm-textP">{s}</span>
                    <button onClick={() => cycleImportance(s)}
                      className="text-[9px] font-black px-1.5 py-0.5 rounded-md border-none cursor-pointer transition-colors"
                      style={{ background: colors.bg, color: colors.text }}
                      title="Click to change importance">
                      {colors.label}
                    </button>
                    <button onClick={() => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))}
                      className="w-4 h-4 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors hover:bg-slate-200"
                      style={{ background: 'rgba(0,0,0,0.06)', color: '#64748B' }}>
                      <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSkill()}
              placeholder="Type a skill and press Enter"
              className="flex-1 h-10 border border-hm-border rounded-xl px-3 text-[13px] text-hm-textP outline-none transition-all"
              style={{ fontFamily: 'var(--font-dm)' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <button onClick={addSkill}
              className="h-10 px-4 rounded-xl text-white text-[13px] font-bold border-none cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', fontFamily: 'var(--font-dm)' }}>
              Add
            </button>
          </div>

          {form.skills.length === 0 && (
            <div className="mt-3 text-[12px] text-hm-textS" style={{ fontFamily: 'var(--font-dm)' }}>
              Skills are used for AI matching — add the most important ones first
            </div>
          )}
        </div>

        {/* Experience & Salary */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.10)' }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <span className="font-display text-[14px] font-bold text-hm-textP">Requirements</span>
          </div>

          <div className="space-y-4">
            <div>
              <FieldLabel>Experience Level</FieldLabel>
              <div className="flex gap-2 flex-wrap">
                {EXP_LEVELS.map(l => (
                  <button key={l} onClick={() => set('experience')(l)}
                    className="px-3.5 py-2 rounded-xl text-[12px] font-semibold cursor-pointer transition-all duration-150"
                    style={{
                      border: `1.5px solid ${form.experience === l ? '#10B981' : '#E2E8F0'}`,
                      background: form.experience === l ? 'rgba(16,185,129,0.08)' : 'white',
                      color: form.experience === l ? '#10B981' : '#64748B',
                      fontFamily: 'var(--font-dm)',
                      fontWeight: form.experience === l ? 700 : 500,
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Salary Range (optional)</FieldLabel>
              <StyledInput value={form.salary} onChange={set('salary') as any} placeholder="e.g. $80,000 – $120,000 per year" />
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="font-display text-[13px] font-bold text-hm-textP mb-3">Job Completeness</div>
          <div className="space-y-2">
            {completionItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: item.done ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.12)' }}>
                  {item.done ? (
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  )}
                </div>
                <span className="text-[12px]" style={{
                  color: item.done ? '#10B981' : '#94A3B8',
                  fontFamily: 'var(--font-dm)',
                  fontWeight: item.done ? 600 : 400,
                  textDecoration: item.done ? 'line-through' : 'none',
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${completionScore}%`,
                  background: completionScore === 100
                    ? 'linear-gradient(90deg, #10B981, #06B6D4)'
                    : 'linear-gradient(90deg, #3B82F6, #06B6D4)',
                }} />
            </div>
          </div>
        </div>

        <div className="h-2" />
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 px-4 pt-3.5 pb-8 md:pb-5 border-t border-hm-border"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div className="max-w-2xl mx-auto flex gap-2.5">
          <button
            onClick={() => publish(true)}
            disabled={loading !== null}
            className="flex-1 h-[46px] rounded-xl text-[13px] font-bold border border-hm-border bg-white text-hm-textP cursor-pointer transition-all hover:bg-hm-surface disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-dm)' }}>
            {loading === 'draft' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Saving…
              </span>
            ) : 'Save Draft'}
          </button>
          <button
            onClick={() => publish(false)}
            disabled={loading !== null || !form.title.trim()}
            className="flex-[2] h-[46px] rounded-xl text-[13px] font-bold text-white border-none cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
              fontFamily: 'var(--font-dm)',
              boxShadow: loading === null && form.title.trim() ? '0 4px 20px rgba(59,130,246,0.35)' : 'none',
            }}>
            {loading === 'publish' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Publishing…
              </span>
            ) : 'Publish Job'}
          </button>
        </div>
      </div>
    </div>
  );
}
