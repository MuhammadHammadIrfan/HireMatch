import HMCard from './HMCard';
import { CompanyLogo } from './Avatar';
import HMScorePill from './HMScorePill';
import HMSkillChip from './HMSkillChip';
import HMButton from './HMButton';
import type { JobWithRecruiter } from '@/lib/types';

interface HMJobCardProps {
  job: JobWithRecruiter;
  onPress?: () => void;
  onApply?: () => void;
  showApply?: boolean;
}

export default function HMJobCard({ job, onPress, onApply, showApply = true }: HMJobCardProps) {
  const skills = Array.isArray(job.skills) ? job.skills.map(s => typeof s === 'string' ? s : s.name) : [];

  return (
    <HMCard onClick={onPress} className="mb-3">
      <div className="flex items-start gap-3 mb-3">
        <CompanyLogo company={job.recruiter?.company_name ?? 'Company'} size={44} />
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-hm-textP mb-0.5 truncate">{job.title}</div>
          <div className="text-[13px] text-hm-textS">{job.recruiter?.company_name} · {job.location}</div>
        </div>
        <HMScorePill score={job.match_score ?? 0} />
      </div>
      <div className="flex gap-1.5 flex-wrap mb-3">
        {skills.slice(0, 3).map(s => <HMSkillChip key={s} label={s} variant="primary" />)}
      </div>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[11px] text-hm-textS">📍 {job.location}</span>
        <span className="text-[11px] text-hm-textS">·</span>
        <span className="text-[11px] text-hm-textS">💼 {job.employment_type}</span>
      </div>
      <div className="text-[11px] text-hm-primary font-medium mb-3">↗ Matched based on your skills</div>
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
