'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HMStatusBadge from '@/components/ui/HMStatusBadge';
import HMButton from '@/components/ui/HMButton';
import { scoreColor } from '@/lib/types';
import type { DBJob, JobStatus } from '@/lib/types';

const TABS = ['Active', 'Draft', 'Closed'] as const;
const TAB_STATUS: Record<string, JobStatus> = { Active: 'active', Draft: 'draft', Closed: 'closed' };
const TAB_COLOR: Record<string, string> = { Active: '#10B981', Draft: '#F59E0B', Closed: '#94A3B8' };

function daysAgo(date: string) {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
}

export default function ActiveJobsClient({ jobs }: { jobs: DBJob[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Active' | 'Draft' | 'Closed'>('Active');

  const counts = { Active: 0, Draft: 0, Closed: 0 };
  for (const j of jobs) {
    if (j.status === 'active') counts.Active++;
    else if (j.status === 'draft') counts.Draft++;
    else if (j.status === 'closed') counts.Closed++;
  }

  const filtered = jobs.filter(j => j.status === TAB_STATUS[activeTab]);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerBg {
          0%   { background-position: 0% 50%; }
          100% { background-position: -200% 50%; }
        }
        @keyframes accentPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Shimmer rainbow bar */}
      <div style={{
        height: 3, width: '100%',
        background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4, #10B981, #3B82F6)',
        backgroundSize: '200% 100%',
        animation: 'shimmerBg 4s linear infinite',
      }} />

      {/* Sticky header */}
      <div style={{
        background: 'white', borderBottom: '1px solid #E2E8F0',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{
          padding: '36px 32px 0',
          paddingTop: 'max(36px, env(safe-area-inset-top, 36px))',
        }} className="md:pt-8 md:px-10">
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 24, animation: 'fadeSlideUp 0.4s ease both',
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 'clamp(26px, 3.5vw, 36px)', color: '#0F172A', lineHeight: 1.1,
              }}>
                My Jobs
              </div>
              <div style={{ fontSize: 15, color: '#64748B', fontFamily: 'var(--font-dm)', marginTop: 4 }}>
                {jobs.length} posting{jobs.length !== 1 ? 's' : ''} total
              </div>
            </div>
            <button onClick={() => router.push('/recruiter/jobs/new')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 22px', borderRadius: 14, color: 'white',
                fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                fontFamily: 'var(--font-display)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 6px 20px rgba(59,130,246,0.40)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(59,130,246,0.50)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(59,130,246,0.40)';
              }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Post Job
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', animation: 'fadeSlideUp 0.4s ease both', animationDelay: '60ms' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px 8px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: 15, fontFamily: 'var(--font-dm)',
                  fontWeight: activeTab === t ? 800 : 500,
                  color: activeTab === t ? TAB_COLOR[t] : '#94A3B8',
                  borderBottom: `3px solid ${activeTab === t ? TAB_COLOR[t] : 'transparent'}`,
                  transition: 'all 0.15s ease',
                }}>
                {t}
                {counts[t] > 0 && (
                  <span style={{
                    fontSize: 12, fontWeight: 900, padding: '2px 8px', borderRadius: 999,
                    background: activeTab === t ? `${TAB_COLOR[t]}18` : '#F1F5F9',
                    color: activeTab === t ? TAB_COLOR[t] : '#94A3B8',
                  }}>
                    {counts[t]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 'clamp(16px, 4vw, 40px) clamp(16px, 4vw, 40px) 100px' }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', paddingTop: 100, paddingBottom: 100,
            animation: 'fadeSlideUp 0.45s ease both',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: '0 auto 24px',
              background: 'rgba(148,163,184,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900,
              color: '#0F172A', marginBottom: 10,
            }}>
              No {activeTab.toLowerCase()} jobs
            </div>
            <div style={{ fontSize: 16, color: '#64748B', marginBottom: 32, fontFamily: 'var(--font-dm)' }}>
              {activeTab === 'Active' ? 'Post a job to start receiving applications' : `No ${activeTab.toLowerCase()} postings yet`}
            </div>
            {activeTab !== 'Closed' && (
              <HMButton onClick={() => router.push('/recruiter/jobs/new')} fullWidth={false} className="px-10 h-12 text-base">Post a Job</HMButton>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(420px, 100%), 1fr))', gap: 20 }}>
            {filtered.map((job, i) => (
              <div key={job.id}
                onClick={() => router.push(`/recruiter/jobs/${job.id}/candidates`)}
                style={{
                  background: 'white', borderRadius: 22, overflow: 'hidden', cursor: 'pointer',
                  border: '1px solid #F1F5F9',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                  transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease',
                  animation: 'fadeSlideUp 0.45s ease both',
                  animationDelay: `${i * 60}ms`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 48px rgba(0,0,0,0.10)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)';
                }}>
                {/* Gradient accent bar */}
                <div style={{ height: 4, background: 'linear-gradient(90deg, #3B82F6, #06B6D4)' }} />

                <div style={{ padding: '24px 28px' }}>
                  {/* Title row */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'space-between', gap: 14, marginBottom: 8,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900,
                        color: '#0F172A', marginBottom: 4, lineHeight: 1.2,
                      }}>
                        {job.title}
                      </div>
                      <div style={{
                        fontSize: 14, color: '#64748B', fontFamily: 'var(--font-dm)',
                        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6,
                      }}>
                        {job.department && <span>{job.department}</span>}
                        {job.department && job.location && <span style={{ color: '#CBD5E1' }}>·</span>}
                        {job.location && <span>{job.location}</span>}
                        {job.employment_type && <><span style={{ color: '#CBD5E1' }}>·</span><span>{job.employment_type}</span></>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <HMStatusBadge status={job.status} small />
                      {job.is_remote && (
                        <span style={{
                          fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999,
                          background: 'rgba(6,182,212,0.08)', color: '#06B6D4',
                        }}>
                          Remote OK
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: '#F1F5F9', margin: '16px 0' }} />

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: 'Applicants', value: String(job.applicant_count), color: '#0F172A' },
                      { label: 'Avg Match', value: (job.avg_match_score ?? 0) > 0 ? `${job.avg_match_score}%` : '—', color: scoreColor(job.avg_match_score ?? 0) },
                      { label: 'Posted', value: daysAgo(job.created_at), color: '#64748B' },
                    ].map(s => (
                      <div key={s.label} style={{
                        textAlign: 'center', padding: '14px 8px', borderRadius: 14,
                        background: '#F8FAFC',
                      }}>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900,
                          color: s.color, lineHeight: 1,
                        }}>
                          {s.value}
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, fontFamily: 'var(--font-dm)' }}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Match progress bar */}
                  {(job.avg_match_score ?? 0) > 0 && (
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ height: 6, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 999,
                          width: `${job.avg_match_score ?? 0}%`,
                          background: `linear-gradient(90deg, ${scoreColor(job.avg_match_score ?? 0)}, ${scoreColor(job.avg_match_score ?? 0)}88)`,
                          transition: 'width 0.8s ease-out',
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr' }} className="sm:grid-cols-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => router.push(`/recruiter/jobs/${job.id}/candidates`)}
                      style={{
                        height: 44, borderRadius: 12, border: 'none', width: '100%',
                        background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                        color: 'white', fontSize: 14, fontWeight: 800,
                        cursor: 'pointer', fontFamily: 'var(--font-dm)', whiteSpace: 'nowrap', textAlign: 'center',
                        transition: 'opacity 0.15s ease',
                        boxShadow: '0 4px 14px rgba(59,130,246,0.30)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                      View Candidates
                    </button>
                    <button
                      onClick={() => router.push('/recruiter/pipeline')}
                      style={{
                        height: 44, padding: '0 18px', borderRadius: 12, width: '100%',
                        border: '1.5px solid #E2E8F0', background: 'transparent',
                        fontSize: 14, fontWeight: 700, color: '#64748B',
                        cursor: 'pointer', fontFamily: 'var(--font-dm)', whiteSpace: 'nowrap', textAlign: 'center',
                        transition: 'border-color 0.15s ease, color 0.15s ease, background 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = '#F8FAFC';
                        (e.currentTarget as HTMLElement).style.borderColor = '#CBD5E1';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0';
                      }}>
                      Pipeline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => router.push('/recruiter/jobs/new')}
        className="fixed bottom-20 right-5 md:bottom-8 md:right-8 w-14 h-14 rounded-2xl border-none cursor-pointer text-white flex items-center justify-center z-[60] transition-all duration-150 hover:-translate-y-1 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', boxShadow: '0 8px 32px rgba(59,130,246,0.50)' }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  );
}
