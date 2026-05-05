'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HMStatusBadge from '@/components/ui/HMStatusBadge';
import HMButton from '@/components/ui/HMButton';
import StatusTimeline from '@/components/features/StatusTimeline';
import { scoreColor } from '@/lib/types';
import type { ApplicationStatus } from '@/lib/types';

const TABS = ['All', 'Submitted', 'Under Review', 'Shortlisted', 'Rejected'];
const TAB_MAP: Record<string, ApplicationStatus> = {
  'Submitted': 'submitted', 'Under Review': 'under_review',
  'Shortlisted': 'shortlisted', 'Rejected': 'rejected',
};

export default function ApplicationsClient({ applications }: { applications: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = applications.filter(a =>
    activeTab === 'All' || a.status === TAB_MAP[activeTab]
  );

  return (
    <div className="min-h-screen bg-hm-surface">
      <div className="bg-white pt-14 border-b border-hm-border">
        <div className="px-5 text-[22px] font-black text-hm-textP mb-3.5">My Applications</div>
        <div className="flex overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="px-4 py-2.5 border-none bg-transparent font-sans text-[13px] cursor-pointer whitespace-nowrap flex-shrink-0 transition-all duration-150"
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
            <div className="text-5xl mb-3">📋</div>
            <div className="text-[15px] font-bold text-hm-textP mb-2">No applications yet</div>
            <div className="text-[13px] text-hm-textS mb-5">You haven&apos;t applied to any jobs yet</div>
            <HMButton onClick={() => router.push('/candidate/jobs')} fullWidth={false} className="px-6">Browse Jobs</HMButton>
          </div>
        ) : (
          filtered.map(app => (
            <div key={app.id} className="bg-white rounded-2xl mb-3 border border-hm-border overflow-hidden">
              <div onClick={() => setExpanded(expanded === app.id ? null : app.id)} className="px-4 py-4 cursor-pointer">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="text-[15px] font-bold text-hm-textP mb-0.5">{app.jobs?.title}</div>
                    <div className="text-[13px] text-hm-textS">{app.jobs?.recruiters?.company_name}</div>
                  </div>
                  <HMStatusBadge status={app.status} small />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-hm-textS">
                    Applied {new Date(app.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-bold" style={{ color: scoreColor(app.match_score ?? 0) }}>
                      {app.match_score ?? 0}% match
                    </div>
                    <span className="text-hm-textS text-sm inline-block transition-transform duration-200"
                      style={{ transform: expanded === app.id ? 'rotate(180deg)' : 'rotate(0)' }}>⌃</span>
                  </div>
                </div>
              </div>
              {expanded === app.id && (
                <div className="border-t border-hm-border px-4 py-3 bg-hm-surface">
                  <div className="text-[13px] font-bold text-hm-textP mb-2">Application Timeline</div>
                  <StatusTimeline
                    status={app.status}
                    submittedAt={app.submitted_at}
                    reviewedAt={app.reviewed_at}
                    shortlistedAt={app.shortlisted_at}
                  />
                  <div className="mt-3">
                    <HMButton variant="secondary" size="sm"
                      onClick={() => router.push(`/candidate/jobs/${app.job_id}`)}>
                      View Job Details
                    </HMButton>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
