'use client';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import HMMatchRing from '@/components/ui/HMMatchRing';
import HMProgressBar from '@/components/ui/HMProgressBar';
import HMJobCard from '@/components/ui/HMJobCard';
import { calcProfileStrength } from '@/lib/types';
import type { DBUser, DBCandidate, JobWithRecruiter } from '@/lib/types';

interface Props {
  profile: DBUser | null;
  candidate: DBCandidate | null;
  matchedJobs: JobWithRecruiter[];
}

export default function CandidateDashboardClient({ profile, candidate, matchedJobs }: Props) {
  const router = useRouter();
  const name = profile?.full_name ?? 'There';
  const profileStrength = calcProfileStrength({
    hasResume: !!candidate?.resume_url,
    skillCount: candidate?.skills?.length ?? 0,
    workExpCount: candidate?.work_experience?.length ?? 0,
    educationCount: candidate?.education?.length ?? 0,
    hasHeadline: !!candidate?.headline,
  });

  const strengthMsg = profileStrength < 40
    ? 'Upload your resume to get started'
    : profileStrength < 70 ? 'Add skills to improve visibility'
    : 'Looking great! Keep it updated';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-hm-surface">
      {/* Header */}
      <div className="hm-gradient-primary px-5 pt-14 pb-7">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="text-[13px] text-white/72 mb-0.5">{greeting},</div>
            <div className="text-[22px] font-black text-white">{name} 👋</div>
          </div>
          <Avatar name={name} size={46} />
        </div>
        <div className="text-[13px] text-white/80 mt-2 bg-white/12 rounded-[10px] px-3 py-2 inline-block">
          ✨ You have <strong>{matchedJobs.length} new matches</strong> today
        </div>
      </div>

      <div className="px-4">
        {/* Profile Strength */}
        <div className="bg-white rounded-2xl p-5 my-4 border border-hm-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[13px] text-hm-textS font-semibold mb-1">Profile Strength</div>
              <div className="text-[32px] font-black text-hm-primary leading-none">{profileStrength}%</div>
              <div className="text-xs text-hm-textS mt-0.5">{strengthMsg}</div>
            </div>
            <HMMatchRing score={profileStrength} size={80} />
          </div>
          <HMProgressBar value={profileStrength} color="#1565C0" />
          <button onClick={() => router.push('/candidate/profile')}
            className="bg-transparent border-none text-hm-primary text-[13px] font-bold cursor-pointer mt-3 p-0">
            Improve Now →
          </button>
        </div>

        {/* Best Matches */}
        <div className="flex justify-between items-center mb-3.5">
          <div className="text-[17px] font-black text-hm-textP">Best Matches</div>
          <button onClick={() => router.push('/candidate/jobs')}
            className="bg-transparent border-none text-hm-primary text-[13px] font-bold cursor-pointer">
            View All →
          </button>
        </div>

        {matchedJobs.length === 0 && !candidate?.resume_url ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-hm-border mb-4">
            <div className="text-4xl mb-3">📄</div>
            <div className="text-[15px] font-bold text-hm-textP mb-2">Upload your resume first</div>
            <div className="text-[13px] text-hm-textS mb-4">We&apos;ll match you with the best jobs using AI</div>
            <button onClick={() => router.push('/candidate/resume/upload')}
              className="bg-hm-primary text-white px-5 py-2.5 rounded-[10px] text-[13px] font-semibold border-none cursor-pointer">
              Upload Resume
            </button>
          </div>
        ) : (
          matchedJobs.map(job => (
            <HMJobCard key={job.id} job={job}
              onPress={() => router.push(`/candidate/jobs/${job.id}`)}
              onApply={() => router.push(`/candidate/apply/${job.id}`)} />
          ))
        )}
      </div>
    </div>
  );
}
