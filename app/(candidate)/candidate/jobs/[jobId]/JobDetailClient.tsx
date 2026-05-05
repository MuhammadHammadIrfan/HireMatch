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
      <div className="bg-white border-b border-hm-border">
        <div className="flex items-center px-4 pt-14 pb-4 gap-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-[#F0F4F8] border-none cursor-pointer text-lg flex items-center justify-center">←</button>
          <div className="flex-1" />
          <button onClick={() => setBookmarked(!bookmarked)}
            className={`w-9 h-9 rounded-full border-none cursor-pointer text-lg ${bookmarked ? 'text-hm-primary' : 'text-hm-textS'}`}
            style={{ background: bookmarked ? 'rgba(21,101,192,0.09)' : '#F0F4F8' }}>
            {bookmarked ? '🔖' : '🏷'}
          </button>
        </div>
        <div className="px-5 pb-5 flex items-start gap-4">
          <CompanyLogo company={companyName} size={56} />
          <div className="flex-1">
            <div className="text-xl font-black text-hm-textP mb-1">{job.title}</div>
            <div className="text-sm text-hm-textS mb-1">{companyName} · {job.location}</div>
            <div className="text-[13px] text-hm-textS">💼 {job.employment_type}</div>
          </div>
        </div>

        <div className="mx-5 mb-4 rounded-2xl p-3.5 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg,rgba(21,101,192,0.09),rgba(46,125,50,0.06))' }}>
          <HMMatchRing score={job.match_score ?? 0} size={68} />
          <div>
            <div className="text-[13px] font-bold text-hm-textP mb-0.5">Your Match Score</div>
            <div className="text-xs text-hm-textS">Based on your skills & experience</div>
            {job.salary_range && <div className="text-[13px] font-bold text-hm-green mt-1">💰 {job.salary_range}</div>}
          </div>
        </div>

        <div className="flex border-b border-hm-border">
          {(['overview', 'requirements', 'skill-gap'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-3 border-none bg-transparent font-sans text-[13px] cursor-pointer transition-all duration-150"
              style={{
                fontWeight: tab === t ? 700 : 400,
                color: tab === t ? '#1565C0' : '#5A6A7A',
                borderBottom: `2.5px solid ${tab === t ? '#1565C0' : 'transparent'}`,
              }}>
              {t === 'overview' ? 'Overview' : t === 'requirements' ? 'Requirements' : 'Skill Gap'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-28">
        {tab === 'overview' && (
          <p className="text-sm text-hm-textP leading-[1.75]">{job.description}</p>
        )}
        {tab === 'requirements' && (
          <div>
            <div className="text-[15px] font-bold text-hm-textP mb-3">Requirements</div>
            {(job.requirements ?? []).map((r, i) => (
              <div key={i} className="flex gap-2.5 mb-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-hm-primary mt-1.5 flex-shrink-0" />
                <div className="text-sm text-hm-textP">{r}</div>
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

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-hm-border px-5 pt-3 pb-8 flex gap-2.5">
        <HMButton variant="secondary" onClick={() => router.push(`/candidate/jobs/${job.id}/skill-gap`)} className="flex-1">
          Skill Feedback
        </HMButton>
        <HMButton onClick={() => router.push(`/candidate/apply/${job.id}`)} className="flex-[2]">Apply Now</HMButton>
      </div>
    </div>
  );
}
