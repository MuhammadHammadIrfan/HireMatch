import HMCard from './HMCard';
import { CompanyLogo } from './Avatar';
import HMScorePill from './HMScorePill';
import HMSkillChip from './HMSkillChip';
import HMButton from './HMButton';
import type { JobWithRecruiter } from '@/lib/types';

function IconMapPin() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function IconBriefcase() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}

interface HMJobCardProps {
  job: JobWithRecruiter;
  onPress?: () => void;
  onApply?: () => void;
  showApply?: boolean;
}

export default function HMJobCard({ job, onPress, onApply, showApply = true }: HMJobCardProps) {
  const skills = Array.isArray(job.skills) ? job.skills.map(s => typeof s === 'string' ? s : s.name) : [];

  return (
    <HMCard onClick={onPress}>
      <div className="flex flex-wrap items-start gap-3 mb-3">
        <CompanyLogo company={job.recruiter?.company_name ?? 'Company'} size={44} />
        <div className="flex-1 min-w-[140px]">
          <div className="font-display text-[15px] font-bold text-hm-textP mb-0.5 leading-tight whitespace-normal break-words">{job.title}</div>
          <div className="text-[13px] text-hm-textS whitespace-normal break-words">{job.recruiter?.company_name}</div>
        </div>
        <div className="w-full flex justify-start sm:w-auto sm:ml-auto">
          <HMScorePill score={job.match_score ?? 0} />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center gap-1 text-[11px] text-hm-textS">
          <IconMapPin /> {job.location}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-hm-textS">
          <IconBriefcase /> {job.employment_type}
        </span>
      </div>

      {skills.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {skills.slice(0, 3).map(s => <HMSkillChip key={s} label={s} variant="primary" />)}
          {skills.length > 3 && (
            <span className="text-[11px] text-hm-textS self-center">+{skills.length - 3} more</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-hm-cyan" />
        <span className="text-[11px] text-hm-cyan font-semibold">AI-matched to your skills</span>
      </div>

      {showApply && (
        <HMButton
          onClick={e => { e.stopPropagation(); onApply?.(); }}
          size="lg"
        >
          Apply Now
        </HMButton>
      )}
    </HMCard>
  );
}
