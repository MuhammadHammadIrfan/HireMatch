'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import HMMatchRing from '@/components/ui/HMMatchRing';
import HMSkillChip from '@/components/ui/HMSkillChip';
import HMStatusBadge from '@/components/ui/HMStatusBadge';
import HMToast from '@/components/ui/HMToast';
import { VALID_TRANSITIONS, STATUS_META } from '@/lib/types';
import type { ApplicationStatus, DBJob } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface Props {
  job: DBJob;
  applications: any[];
}

export default function CandidateRankingClient({ job, applications: initApps }: Props) {
  const router = useRouter();
  const [applications, setApplications] = useState(initApps);
  const [sort, setSort] = useState<'match' | 'name'>('match');
  const [toast, setToast] = useState<string | null>(null);

  const sorted = [...applications].sort((a, b) =>
    sort === 'match' ? (b.match_score ?? 0) - (a.match_score ?? 0) : (a.users?.full_name ?? '').localeCompare(b.users?.full_name ?? '')
  );

  const updateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    const supabase = createClient();
    await supabase.from('applications').update({ status: newStatus }).eq('id', appId);
    setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    setToast(`Status updated to ${STATUS_META[newStatus].label}`);
  };

  return (
    <div className="min-h-screen bg-hm-surface">
      {toast && <HMToast message={toast} onClose={() => setToast(null)} />}
      <div className="hm-gradient-primary px-5 pt-14 pb-5">
        <div className="flex items-center gap-2.5 mb-3">
          <button onClick={() => router.back()}
            className="w-[34px] h-[34px] rounded-full bg-white/15 border-none cursor-pointer text-white text-lg">←</button>
          <div className="flex-1">
            <div className="text-[17px] font-bold text-white">{job.title}</div>
            <div className="text-[13px] text-white/75">{job.location} · {job.employment_type}</div>
          </div>
        </div>
        <div className="flex gap-3">
          {[
            { label: 'Applicants', value: applications.length },
            { label: 'Avg Match', value: `${applications.length > 0 ? Math.round(applications.reduce((a, b) => a + (b.match_score ?? 0), 0) / applications.length) : 0}%` },
            { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length },
          ].map(stat => (
            <div key={stat.label} className="bg-white/12 rounded-[10px] px-3.5 py-2 flex-1 text-center">
              <div className="text-xl font-black text-white">{stat.value}</div>
              <div className="text-[11px] text-white/75">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-10">
        <div className="flex justify-between items-center mb-3.5">
          <div className="text-[15px] font-bold text-hm-textP">Ranked Candidates</div>
          <select value={sort} onChange={e => setSort(e.target.value as 'match' | 'name')}
            className="border border-hm-border rounded-lg px-2.5 py-1.5 text-xs font-sans cursor-pointer outline-none text-hm-textP">
            <option value="match">By Match %</option>
            <option value="name">By Name</option>
          </select>
        </div>

        {sorted.map((app, idx) => {
          const nexts = VALID_TRANSITIONS[app.status as ApplicationStatus] ?? [];
          const candidateSkills = app.candidates?.skills ?? [];
          const name = app.users?.full_name ?? 'Candidate';
          const gapSkill = app.skill_gaps?.[0]?.skill_name ?? '';

          return (
            <div key={app.id} className="bg-white rounded-2xl mb-3 border border-hm-border overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => router.push(`/recruiter/candidates/${app.candidate_id}?jobId=${job.id}&appId=${app.id}`)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: idx < 3 ? '#1565C0' : '#F5F7FA', color: idx < 3 ? 'white' : '#5A6A7A' }}>
                    #{idx + 1}
                  </div>
                  <Avatar name={name} size={42} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold text-hm-textP mb-0.5">{name}</div>
                    <div className="text-xs text-hm-textS">{app.candidates?.headline}</div>
                  </div>
                  <HMMatchRing score={app.match_score ?? 0} size={52} animate />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {candidateSkills.slice(0, 3).map((s: string) => <HMSkillChip key={s} label={s} variant="matched" />)}
                </div>
                <div className="flex items-center justify-between">
                  {gapSkill && <div className="text-xs text-hm-amber font-semibold">⚠ Gap: {gapSkill}</div>}
                  {nexts.length > 0 ? (
                    <select value={app.status}
                      onChange={e => { e.stopPropagation(); updateStatus(app.id, e.target.value as ApplicationStatus); }}
                      onClick={e => e.stopPropagation()}
                      className="border border-hm-border rounded-full px-2 py-1 text-[11px] font-bold font-sans cursor-pointer outline-none"
                      style={{ background: STATUS_META[app.status as ApplicationStatus]?.bg, color: STATUS_META[app.status as ApplicationStatus]?.text }}>
                      <option value={app.status}>{STATUS_META[app.status as ApplicationStatus]?.label}</option>
                      {nexts.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                    </select>
                  ) : <HMStatusBadge status={app.status} small />}
                </div>
              </div>
              <div className="flex border-t border-hm-border">
                <button onClick={() => router.push(`/recruiter/candidates/${app.candidate_id}?jobId=${job.id}&appId=${app.id}`)}
                  className="flex-1 py-2.5 border-none bg-transparent cursor-pointer text-hm-primary font-sans text-[13px] font-semibold">
                  View Profile →
                </button>
                <button onClick={() => router.push(`/recruiter/jobs/${job.id}/match/${app.candidate_id}`)}
                  className="flex-1 py-2.5 border-none border-l border-hm-border bg-transparent cursor-pointer text-hm-textS font-sans text-[13px]">
                  Match Details
                </button>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">👥</div>
            <div className="text-[15px] font-bold text-hm-textP mb-2">No applicants yet</div>
            <div className="text-[13px] text-hm-textS">Candidates will appear here when they apply</div>
          </div>
        )}
      </div>
    </div>
  );
}
