'use client';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import HMStatusBadge from '@/components/ui/HMStatusBadge';
import HMButton from '@/components/ui/HMButton';
import { scoreColor } from '@/lib/types';
import type { DBUser, DBRecruiter, DBJob } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface Props { profile: DBUser | null; recruiter: DBRecruiter | null; activeJobs: DBJob[]; }

export default function RecruiterDashboardClient({ profile, recruiter, activeJobs }: Props) {
  const router = useRouter();
  const name = profile?.full_name ?? 'Recruiter';
  const company = recruiter?.company_name ?? 'Your Company';
  const stats = [
    { label: 'Active Jobs',  value: activeJobs.length.toString(), icon: '💼', color: '#1565C0' },
    { label: 'Avg Match %',  value: activeJobs.length > 0 ? Math.round(activeJobs.reduce((a, j) => a + (j.avg_match_score ?? 0), 0) / activeJobs.length) + '%' : '—', icon: '🎯', color: '#6A1B9A' },
    { label: 'Applicants',   value: activeJobs.reduce((a, j) => a + (j.applicant_count ?? 0), 0).toString(), icon: '👥', color: '#2E7D32' },
    { label: 'Shortlisted',  value: '—', icon: '⭐', color: '#F57F17' },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-hm-surface">
      <div className="hm-gradient-primary-rev px-5 pt-14 pb-7">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] text-white/72 mb-0.5">Welcome back,</div>
            <div className="text-[22px] font-black text-white">{name} 👋</div>
            <div className="text-[13px] text-white/75 mt-0.5">{company}</div>
          </div>
          <Avatar name={name} size={46} />
        </div>
      </div>

      <div className="px-4">
        <div className="grid grid-cols-2 gap-2.5 my-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-hm-border">
              <div className="text-[26px] mb-1.5">{s.icon}</div>
              <div className="text-[26px] font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-hm-textS font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-3.5">
          <div className="text-[17px] font-black text-hm-textP">Active Jobs</div>
          <button onClick={() => router.push('/recruiter/jobs')}
            className="bg-transparent border-none text-hm-primary text-[13px] font-bold cursor-pointer">View All →</button>
        </div>

        {activeJobs.map(job => (
          <div key={job.id} className="bg-white rounded-2xl p-5 mb-3 border border-hm-border">
            <div className="flex justify-between items-start mb-2.5">
              <div>
                <div className="text-[15px] font-bold text-hm-textP mb-0.5">{job.title}</div>
                <div className="text-[13px] text-hm-textS">📍 {job.location} · 💼 {job.employment_type}</div>
              </div>
              <HMStatusBadge status={job.status} small />
            </div>
            <div className="flex gap-4 mb-3.5">
              <div className="text-[13px] text-hm-textS">👥 <strong className="text-hm-textP">{job.applicant_count}</strong> applicants</div>
              <div className="text-[13px] font-bold" style={{ color: scoreColor(job.avg_match_score ?? 0) }}>
                ● {job.avg_match_score}% avg
              </div>
            </div>
            <HMButton size="sm" onClick={() => router.push(`/recruiter/jobs/${job.id}/candidates`)} className="h-[38px] text-[13px]">
              View Candidates
            </HMButton>
          </div>
        ))}

        <div className="bg-white rounded-2xl p-5 mb-3 border border-hm-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 bg-transparent border-none cursor-pointer p-0">
            <div className="w-10 h-10 rounded-xl bg-hm-redBg flex items-center justify-center text-lg flex-shrink-0">🚪</div>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold text-hm-red">Log Out</div>
              <div className="text-xs text-hm-textS mt-0.5">Sign out of your account</div>
            </div>
            <span className="text-hm-red text-lg">›</span>
          </button>
        </div>
      </div>

      <button onClick={() => router.push('/recruiter/jobs/new')}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-hm-primary border-none cursor-pointer text-white text-3xl flex items-center justify-center z-60"
        style={{ boxShadow: '0 4px 16px rgba(21,101,192,0.4)' }}>+</button>
    </div>
  );
}
