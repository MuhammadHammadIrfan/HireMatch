'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HMStatusBadge from '@/components/ui/HMStatusBadge';
import HMButton from '@/components/ui/HMButton';
import { scoreColor } from '@/lib/types';
import type { DBJob, JobStatus } from '@/lib/types';

const TABS = ['Active', 'Draft', 'Closed'];
const TAB_MAP: Record<string, JobStatus> = { Active: 'active', Draft: 'draft', Closed: 'closed' };

export default function ActiveJobsClient({ jobs }: { jobs: DBJob[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Active');
  const filtered = jobs.filter(j => j.status === TAB_MAP[activeTab]);

  return (
    <div className="min-h-screen bg-hm-surface">
      <div className="bg-white pt-14 border-b border-hm-border">
        <div className="px-5 text-[22px] font-black text-hm-textP mb-3.5">My Jobs</div>
        <div className="flex">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="flex-1 py-2.5 border-none bg-transparent font-sans text-[13px] cursor-pointer transition-all duration-150"
              style={{
                fontWeight: activeTab === t ? 700 : 400,
                color: activeTab === t ? '#1565C0' : '#5A6A7A',
                borderBottom: `2.5px solid ${activeTab === t ? '#1565C0' : 'transparent'}`,
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">💼</div>
            <div className="text-[15px] font-bold text-hm-textP mb-2">No jobs here yet</div>
            <div className="text-[13px] text-hm-textS mb-5">Post a job to get started</div>
            <HMButton onClick={() => router.push('/recruiter/jobs/new')} fullWidth={false} className="px-6">Post a Job</HMButton>
          </div>
        ) : (
          filtered.map(job => (
            <div key={job.id} onClick={() => router.push(`/recruiter/jobs/${job.id}/candidates`)}
              className="bg-white rounded-2xl p-5 mb-3 border border-hm-border cursor-pointer">
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-hm-textP mb-0.5">{job.title}</div>
                  <div className="text-[13px] text-hm-textS">{job.department} · {job.location}</div>
                </div>
                <HMStatusBadge status={job.status} small />
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="text-[13px] text-hm-textS">👥 <strong className="text-hm-textP">{job.applicant_count}</strong> applicants</div>
                {job.created_at && (
                  <div className="text-[13px] text-hm-textS">🗓 {Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86400000)}d ago</div>
                )}
                {(job.avg_match_score ?? 0) > 0 && (
                  <div className="text-[13px] font-bold" style={{ color: scoreColor(job.avg_match_score ?? 0) }}>
                    ● {job.avg_match_score}% avg match
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <button onClick={() => router.push('/recruiter/jobs/new')}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-hm-primary border-none cursor-pointer text-white text-3xl flex items-center justify-center z-60"
        style={{ boxShadow: '0 4px 16px rgba(21,101,192,0.4)' }}>+</button>
    </div>
  );
}
