'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import HMMatchRing from '@/components/ui/HMMatchRing';
import HMStatusBadge from '@/components/ui/HMStatusBadge';
import HMSkillChip from '@/components/ui/HMSkillChip';
import HMButton from '@/components/ui/HMButton';
import HMTextarea from '@/components/ui/HMTextarea';
import HMToast from '@/components/ui/HMToast';
import SkillGapContent from '@/components/features/SkillGapContent';
import { VALID_TRANSITIONS, STATUS_META } from '@/lib/types';
import type { ApplicationStatus, DBCandidate, DBUser, DBApplication, DBSkillGap } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface Props {
  candidate: DBCandidate;
  user: DBUser;
  application: DBApplication | null;
  skillGaps: DBSkillGap[];
  jobId?: string;
}

function CompanyInitial({ name, size = 36 }: { name: string; size?: number }) {
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#F59E0B'];
  const color = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
  return (
    <div className="rounded-xl flex items-center justify-center text-white font-display font-black flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}>
      {(name ?? '?')[0]}
    </div>
  );
}

export default function CandidateProfileViewClient({ candidate, user, application, skillGaps, jobId }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<'resume' | 'match' | 'notes'>('resume');
  const [status, setStatus] = useState<ApplicationStatus>((application?.status ?? 'submitted') as ApplicationStatus);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<{ text: string; ts: string }[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const nexts = VALID_TRANSITIONS[status] ?? [];
  const matchScore = application?.match_score ?? 0;
  const name = user.full_name ?? 'Candidate';
  const workExp = Array.isArray(candidate.work_experience) ? candidate.work_experience : [];
  const education = Array.isArray(candidate.education) ? candidate.education : [];
  const skills = candidate.skills ?? [];

  const updateStatus = async (newStatus: ApplicationStatus) => {
    if (!application) return;
    setUpdatingStatus(true);
    const supabase = createClient();
    await supabase.from('applications').update({ status: newStatus }).eq('id', application.id);
    setStatus(newStatus);
    setToast(`Status updated to ${STATUS_META[newStatus].label}`);
    setUpdatingStatus(false);
  };

  const STATUS_LEFT: Record<string, string> = {
    submitted: '#3B82F6', under_review: '#F59E0B', shortlisted: '#10B981', rejected: '#F43F5E',
  };

  return (
    <div className="min-h-screen bg-hm-surface flex flex-col">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerBg {
          0%   { background-position: 0% 50%; }
          100% { background-position: -200% 50%; }
        }
      `}</style>

      {toast && <HMToast message={toast} onClose={() => setToast(null)} />}

      {/* Shimmer top bar */}
      <div style={{
        height: 3, width: '100%',
        background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4, #10B981, #3B82F6)',
        backgroundSize: '200% 100%',
        animation: 'shimmerBg 4s linear infinite',
        flexShrink: 0,
      }} />

      {/* Header */}
      <div className="bg-white border-b border-hm-border sticky top-0 z-20">
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '36px 28px 16px', gap: 14,
          paddingTop: 'max(36px, env(safe-area-inset-top, 36px))',
        }} className="md:pt-7 md:px-10">
          <button onClick={() => router.back()}
            style={{
              width: 42, height: 42, borderRadius: 13,
              background: '#F8FAFC', border: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#E2E8F0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 900, color: '#0F172A' }}>Candidate Profile</div>
          <div style={{ width: 42 }} />
        </div>

        {/* Candidate hero */}
        <div style={{ padding: '0 28px 16px' }} className="md:px-10">
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16,
            borderLeft: `4px solid ${STATUS_LEFT[status] ?? '#E2E8F0'}`, paddingLeft: 14,
          }}>
            <Avatar name={name} size={64} src={user.avatar_url} />
            <div className="flex-1 min-w-0">
              <div className="font-display text-[22px] font-black text-hm-textP">{name}</div>
              {candidate.headline && (
                <div className="text-[15px] text-hm-textS mb-1.5" style={{ fontFamily: 'var(--font-dm)' }}>{candidate.headline}</div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <HMStatusBadge status={status} small />
                {application?.reference_code && (
                  <span className="text-[10px] font-mono font-bold text-hm-textS bg-slate-100 px-2 py-0.5 rounded-md">
                    {application.reference_code}
                  </span>
                )}
              </div>
            </div>
            <HMMatchRing score={matchScore} size={60} />
          </div>

          {/* Profile strength bar */}
          {candidate.profile_strength > 0 && (
            <div style={{ padding: '0 28px 4px' }} className="md:px-10">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontFamily: 'var(--font-dm)' }}>Profile strength</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#3B82F6', fontFamily: 'var(--font-dm)' }}>{candidate.profile_strength}%</span>
              </div>
              <div style={{ height: 6, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  width: `${candidate.profile_strength}%`,
                  background: 'linear-gradient(90deg, #3B82F6, #06B6D4)',
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderTop: '1px solid #E2E8F0' }}>
          {(['resume', 'match', 'notes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '14px 8px', border: 'none', background: 'transparent',
                fontSize: 14, cursor: 'pointer', transition: 'all 0.15s ease',
                fontFamily: 'var(--font-dm)',
                fontWeight: tab === t ? 800 : 500,
                color: tab === t ? '#3B82F6' : '#64748B',
                borderBottom: `3px solid ${tab === t ? '#3B82F6' : 'transparent'}`,
              }}>
              {t === 'resume' ? 'Resume' : t === 'match' ? 'Match Details' : 'Notes'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 28px 32px', maxWidth: 760, margin: '0 auto', width: '100%' }} className="md:px-10">
        {tab === 'resume' && (
          <div className="space-y-5">
            {/* Skills */}
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <div className="font-display text-[14px] font-bold text-hm-textP mb-3">
                Skills
                <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-hm-blueBg text-hm-blue">{skills.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => <HMSkillChip key={s} label={s} variant="matched" />)}
                {skills.length === 0 && <div className="text-[13px] text-hm-textS">No skills listed</div>}
              </div>
            </div>

            {/* Work experience */}
            {workExp.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <div className="font-display text-[14px] font-bold text-hm-textP mb-4">Work Experience</div>
                <div className="space-y-4">
                  {workExp.map((w, i) => (
                    <div key={i} className={`flex gap-3 ${i < workExp.length - 1 ? 'pb-4 border-b border-hm-border' : ''}`}>
                      <CompanyInitial name={w.company} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-hm-textP">{w.title}</div>
                        <div className="text-[13px] text-hm-textS">{w.company}</div>
                        <div className="text-[11px] text-hm-textS mt-0.5">{w.start_date} – {w.end_date ?? 'Present'}</div>
                        {w.description && (
                          <div className="text-[12px] text-hm-textS mt-1 line-clamp-2">{w.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <div className="font-display text-[14px] font-bold text-hm-textP mb-4">Education</div>
                <div className="space-y-3">
                  {education.map((e, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-base flex-shrink-0">🎓</div>
                      <div>
                        <div className="text-sm font-bold text-hm-textP">{e.degree}{e.field ? `, ${e.field}` : ''}</div>
                        <div className="text-[13px] text-hm-textS">{e.school}</div>
                        {e.year && <div className="text-[11px] text-hm-textS mt-0.5">Class of {e.year}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resume link */}
            {candidate.resume_url && (
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <div className="font-display text-[14px] font-bold text-hm-textP mb-3">Resume</div>
                <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-hm-surface hover:bg-hm-blueBg transition-colors no-underline">
                  <div className="w-10 h-10 rounded-xl bg-hm-blueBg flex items-center justify-center text-lg flex-shrink-0">📄</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-hm-blue truncate">{candidate.resume_filename ?? 'Resume'}</div>
                    <div className="text-[11px] text-hm-textS">Click to view PDF</div>
                  </div>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>
            )}
          </div>
        )}

        {tab === 'match' && (
          <SkillGapContent
            matchScore={matchScore}
            matchedSkills={skills}
            missingSkills={skillGaps.map(g => ({ name: g.skill_name, importance: g.importance, suggestion: g.suggestion ?? '' }))}
          />
        )}

        {tab === 'notes' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <HMTextarea label="Add a note" placeholder="Internal notes about this candidate…" value={note} onChange={setNote} rows={3} />
              <div className="mt-3">
                <HMButton size="sm" onClick={() => {
                  if (note.trim()) { setNotes(n => [{ text: note, ts: 'Just now' }, ...n]); setNote(''); setToast('Note added'); }
                }} className="h-[38px] text-[13px]">
                  Add Note
                </HMButton>
              </div>
            </div>
            {notes.map((n, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-card">
                <div className="text-[13px] text-hm-textP mb-1.5">{n.text}</div>
                <div className="text-[11px] text-hm-textS">{n.ts}</div>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="text-center py-8 text-hm-textS text-[13px]">No notes yet</div>
            )}
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div style={{
        position: 'sticky', bottom: 0,
        borderTop: '1px solid #E2E8F0',
        padding: '16px 28px 28px',
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }} className="md:pb-5 md:px-10">
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {nexts.length > 0 ? (
            <div className="flex gap-2">
              {nexts.map(n => (
                <HMButton key={n}
                  variant={n === 'shortlisted' ? 'greenSolid' : n === 'rejected' ? 'redSolid' : 'amberSolid'}
                  className="flex-1 h-[42px] text-[13px]"
                  loading={updatingStatus}
                  onClick={() => updateStatus(n)}>
                  {STATUS_META[n].label}
                </HMButton>
              ))}
            </div>
          ) : (
            <div className="text-center text-[13px] text-hm-textS py-1">
              Status: <strong style={{ color: STATUS_META[status]?.text }}>{STATUS_META[status]?.label}</strong> — no further actions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
