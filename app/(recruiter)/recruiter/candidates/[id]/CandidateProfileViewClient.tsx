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

export default function CandidateProfileViewClient({ candidate, user, application, skillGaps, jobId }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<'resume' | 'match' | 'notes'>('resume');
  const [status, setStatus] = useState<ApplicationStatus>((application?.status ?? 'submitted') as ApplicationStatus);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<{ text: string; ts: string }[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const nexts = VALID_TRANSITIONS[status] ?? [];
  const matchScore = application?.match_score ?? 0;
  const name = user.full_name ?? 'Candidate';
  const workExp = Array.isArray(candidate.work_experience) ? candidate.work_experience : [];
  const education = Array.isArray(candidate.education) ? candidate.education : [];
  const skills = candidate.skills ?? [];

  const updateStatus = async (newStatus: ApplicationStatus) => {
    if (!application) return;
    const supabase = createClient();
    await supabase.from('applications').update({ status: newStatus }).eq('id', application.id);
    setStatus(newStatus);
    setToast(`Status updated to ${STATUS_META[newStatus].label}`);
  };

  return (
    <div className="min-h-screen bg-hm-surface flex flex-col">
      {toast && <HMToast message={toast} onClose={() => setToast(null)} />}
      <div className="bg-white border-b border-hm-border">
        <div className="flex items-center px-4 pt-14 pb-4 gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-[#F0F4F8] border-none cursor-pointer text-lg">←</button>
          <div className="flex-1 text-center text-[16px] font-bold text-hm-textP">Candidate Profile</div>
          <div className="w-9" />
        </div>
        <div className="px-5 pb-4 flex items-center gap-4">
          <Avatar name={name} size={56} />
          <div className="flex-1">
            <div className="text-lg font-black text-hm-textP mb-0.5">{name}</div>
            <div className="text-[13px] text-hm-textS mb-1.5">{candidate.headline}</div>
            <HMStatusBadge status={status} small />
          </div>
          <HMMatchRing score={matchScore} size={64} />
        </div>
        <div className="flex border-b border-hm-border">
          {(['resume', 'match', 'notes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-3 border-none bg-transparent font-sans text-[13px] cursor-pointer transition-all duration-150"
              style={{
                fontWeight: tab === t ? 700 : 400,
                color: tab === t ? '#1565C0' : '#5A6A7A',
                borderBottom: `2.5px solid ${tab === t ? '#1565C0' : 'transparent'}`,
              }}>
              {t === 'resume' ? 'Resume' : t === 'match' ? 'Match Details' : 'Notes'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-32">
        {tab === 'resume' && (
          <div>
            <div className="text-sm font-bold text-hm-textP mb-2.5">Skills</div>
            <div className="flex flex-wrap gap-2 mb-5">
              {skills.map(s => <HMSkillChip key={s} label={s} variant="matched" />)}
            </div>
            <div className="text-sm font-bold text-hm-textP mb-2.5">Work Experience</div>
            {workExp.map((w, i) => (
              <div key={i} className="flex gap-3 mb-4 items-start">
                <div className="w-0.5 bg-hm-primary rounded-full min-h-[44px] flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold text-hm-textP">{w.title}</div>
                  <div className="text-[13px] text-hm-textS">{w.company}</div>
                  <div className="text-[11px] text-hm-textS mt-0.5">{w.start_date} – {w.end_date ?? 'Present'}</div>
                </div>
              </div>
            ))}
            <div className="text-sm font-bold text-hm-textP mb-2.5">Education</div>
            {education.map((e, i) => (
              <div key={i} className="mb-2">
                <div className="text-sm font-bold text-hm-textP">{e.degree}</div>
                <div className="text-[13px] text-hm-textS">{e.school} · {e.year}</div>
              </div>
            ))}
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
          <div>
            <HMTextarea label="Add a note" placeholder="Internal notes about this candidate…" value={note} onChange={setNote} rows={3} />
            <HMButton size="sm" onClick={() => { if (note.trim()) { setNotes(n => [{ text: note, ts: 'Just now' }, ...n]); setNote(''); setToast('Note added'); } }} className="h-[38px] text-[13px] mb-5">
              Add Note
            </HMButton>
            {notes.map((n, i) => (
              <div key={i} className="p-3.5 bg-white rounded-[10px] mb-2.5 border border-hm-border">
                <div className="text-[13px] text-hm-textP mb-1">{n.text}</div>
                <div className="text-[11px] text-hm-textS">{n.ts}</div>
              </div>
            ))}
            {notes.length === 0 && <div className="text-center text-hm-textS text-[13px] pt-5">No notes yet</div>}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-hm-border px-4 pt-3 pb-8">
        {nexts.length > 0 ? (
          <div className="flex gap-2">
            {nexts.map(n => (
              <HMButton key={n}
                variant={n === 'shortlisted' ? 'greenSolid' : n === 'rejected' ? 'redSolid' : 'amberSolid'}
                className="flex-1 h-[42px] text-[13px]"
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
  );
}
