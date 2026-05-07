'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HMMatchRing from '@/components/ui/HMMatchRing';
import HMSkillChip from '@/components/ui/HMSkillChip';
import HMButton from '@/components/ui/HMButton';
import { CompanyLogo } from '@/components/ui/Avatar';
import SkillGapContent from '@/components/features/SkillGapContent';
import type { JobWithRecruiter } from '@/lib/types';

interface Props {
  job: JobWithRecruiter & { matched_skills: string[]; missing_skills: Array<{name:string;importance:string;suggestion:string}> };
  userId: string | null;
}

export default function JobDetailClient({ job, userId }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'requirements' | 'skill-gap'>('overview');
  const [bookmarked, setBookmarked] = useState(false);
  const companyName = job.recruiter?.company_name ?? 'Company';

  return (
    <div className="min-h-screen bg-hm-surface flex flex-col">
      <div className="bg-white border-b border-hm-border sticky top-0 z-20">
        <div className="max-w-[720px] mx-auto">
          <div className="flex items-center px-4 pt-14 pb-4 gap-3 md:pt-5">
            <button onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-hm-surface border-none cursor-pointer flex items-center justify-center text-hm-textP hover:bg-hm-border transition-colors">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className="flex-1" />
            <button onClick={() => setBookmarked(!bookmarked)}
              className="w-9 h-9 rounded-xl border-none cursor-pointer flex items-center justify-center transition-colors"
              style={{ background: bookmarked ? 'rgba(59,130,246,0.10)' : '#F8FAFC', color: bookmarked ? '#3B82F6' : '#64748B' }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          </div>

          <div className="px-5 pb-5 flex items-start gap-4">
            <CompanyLogo company={companyName} size={56} />
            <div className="flex-1">
              <div className="font-display text-xl font-black text-hm-textP mb-1">{job.title}</div>
              <div className="text-sm text-hm-textS mb-1">{companyName} · {job.location}</div>
              <div className="text-[13px] text-hm-textS">{job.employment_type}</div>
            </div>
          </div>

          <div className="mx-5 mb-4 rounded-2xl p-3.5 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.07), rgba(6,182,212,0.05))' }}>
            <HMMatchRing score={job.match_score ?? 0} size={68} />
            <div>
              <div className="font-display text-[13px] font-bold text-hm-textP mb-0.5">Your Match Score</div>
              <div className="text-xs text-hm-textS">Based on your skills &amp; experience</div>
              {job.salary_range && <div className="text-[13px] font-bold text-hm-green mt-1">💰 {job.salary_range}</div>}
            </div>
          </div>

          <div className="flex border-b border-hm-border">
            {(['overview', 'requirements', 'skill-gap'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-3 border-none bg-transparent text-[13px] cursor-pointer transition-all duration-150"
                style={{
                  fontFamily: 'var(--font-display, Plus Jakarta Sans, system-ui)',
                  fontWeight: tab === t ? 700 : 500,
                  color: tab === t ? '#3B82F6' : '#64748B',
                  borderBottom: `2px solid ${tab === t ? '#3B82F6' : 'transparent'}`,
                }}>
                {t === 'overview' ? 'Overview' : t === 'requirements' ? 'Requirements' : 'Skill Gap'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-5 pt-5 pb-8">
          {tab === 'overview' && (
            <p className="text-sm text-hm-textP leading-[1.75]"
              style={{ fontFamily: 'var(--font-dm, DM Sans, system-ui)' }}>{job.description}</p>
          )}
          {tab === 'requirements' && (
            <div>
              <div className="font-display text-[15px] font-bold text-hm-textP mb-3">Requirements</div>
              {(job.requirements ?? []).map((r, i) => (
                <div key={i} className="flex gap-2.5 mb-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-hm-blue mt-1.5 flex-shrink-0" />
                  <div className="text-sm text-hm-textP"
                    style={{ fontFamily: 'var(--font-dm, DM Sans, system-ui)' }}>{r}</div>
                </div>
              ))}
            </div>
          )}
          {tab === 'skill-gap' && (
            <SkillGapContent
              matchScore={job.match_score ?? 0}
              matchedSkills={job.matched_skills ?? []}
              missingSkills={(job.missing_skills ?? []).map(s => ({
                name: s.name,
                importance: s.importance as 'high' | 'medium' | 'low',
                suggestion: s.suggestion,
              }))}
            />
          )}
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 border-t border-hm-border px-5 pt-3 pb-8 md:pb-4 flex gap-2.5"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div className="max-w-[720px] mx-auto flex gap-2.5 w-full">
          <HMButton variant="secondary" onClick={() => router.push(`/candidate/jobs/${job.id}/skill-gap`)} className="flex-1">
            Skill Gap
          </HMButton>
          <HMButton onClick={() => router.push(`/candidate/apply/${job.id}`)} className="flex-[2]">Apply Now</HMButton>
        </div>
      </div>
    </div>
  );
}
