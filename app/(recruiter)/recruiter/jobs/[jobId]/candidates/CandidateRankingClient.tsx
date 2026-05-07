'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import HMMatchRing from '@/components/ui/HMMatchRing';
import HMSkillChip from '@/components/ui/HMSkillChip';
import HMStatusBadge from '@/components/ui/HMStatusBadge';
import HMToast from '@/components/ui/HMToast';
import { VALID_TRANSITIONS, STATUS_META, scoreColor } from '@/lib/types';
import type { ApplicationStatus, DBJob } from '@/lib/types';
import { updateApplicationStatus } from '@/app/actions/applications';

interface Props { job: DBJob; applications: any[]; }

const STATUS_LEFT: Record<string, string> = {
  submitted: '#3B82F6', under_review: '#F59E0B', shortlisted: '#10B981', rejected: '#F43F5E',
};

export default function CandidateRankingClient({ job, applications: initApps }: Props) {
  const router = useRouter();
  const [applications, setApplications] = useState(initApps);
  const [sort, setSort] = useState<'match' | 'name' | 'date'>('match');
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = [...applications]
    .filter(a => statusFilter === 'all' || a.status === statusFilter)
    .sort((a, b) => {
      if (sort === 'match') return (b.match_score ?? 0) - (a.match_score ?? 0);
      if (sort === 'name') return (a.candidates?.users?.full_name ?? '').localeCompare(b.candidates?.users?.full_name ?? '');
      return new Date(b.submitted_at ?? 0).getTime() - new Date(a.submitted_at ?? 0).getTime();
    });

  const updateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      setToast(`Status updated to ${STATUS_META[newStatus].label}`);
    } catch (err: any) {
      setToast(`Error: ${err.message}`);
    }
  };

  const avgScore = applications.length > 0
    ? Math.round(applications.reduce((a, b) => a + (b.match_score ?? 0), 0) / applications.length)
    : 0;
  const shortlisted = applications.filter(a => a.status === 'shortlisted').length;
  const underReview = applications.filter(a => a.status === 'under_review').length;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerBg {
          0%   { background-position: 0% 50%; }
          100% { background-position: -200% 50%; }
        }
      `}</style>

      {toast && <HMToast message={toast} onClose={() => setToast(null)} />}

      {/* Shimmer top bar */}
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

          {/* Back + title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, animation: 'fadeSlideUp 0.4s ease both' }}>
            <button onClick={() => router.back()}
              style={{
                width: 42, height: 42, borderRadius: 13,
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#E2E8F0')}
              onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 'clamp(18px, 2.5vw, 26px)', color: '#0F172A',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {job.title}
              </div>
              <div style={{ fontSize: 14, color: '#64748B', fontFamily: 'var(--font-dm)', marginTop: 3 }}>
                {[job.location, job.employment_type].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
            marginBottom: 16, animation: 'fadeSlideUp 0.4s ease both', animationDelay: '60ms',
          }}>
            {[
              { label: 'Total', value: applications.length, color: '#3B82F6' },
              { label: 'Avg Match', value: `${avgScore}%`, color: '#8B5CF6' },
              { label: 'Reviewing', value: underReview, color: '#F59E0B' },
              { label: 'Shortlisted', value: shortlisted, color: '#10B981' },
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

          {/* Sort + filter controls */}
          <div style={{
            display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16,
            animation: 'fadeSlideUp 0.4s ease both', animationDelay: '120ms',
          }}>
            <select value={sort} onChange={e => setSort(e.target.value as any)}
              style={{
                height: 38, padding: '0 12px', border: '1px solid #E2E8F0',
                borderRadius: 11, fontSize: 14, color: '#0F172A', cursor: 'pointer',
                outline: 'none', background: 'white', flexShrink: 0,
                fontFamily: 'var(--font-dm)', fontWeight: 700,
              }}>
              <option value="match">By Match %</option>
              <option value="name">By Name</option>
              <option value="date">By Date</option>
            </select>
            {(['all', 'submitted', 'under_review', 'shortlisted', 'rejected'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{
                  height: 38, padding: '0 14px', borderRadius: 11,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                  fontFamily: 'var(--font-dm)', transition: 'all 0.15s ease',
                  background: statusFilter === s
                    ? (s === 'all' ? '#0F172A' : STATUS_META[s as ApplicationStatus]?.bg ?? '#F1F5F9')
                    : 'white',
                  color: statusFilter === s
                    ? (s === 'all' ? 'white' : STATUS_META[s as ApplicationStatus]?.text ?? '#64748B')
                    : '#64748B',
                  border: `1.5px solid ${statusFilter === s ? 'transparent' : '#E2E8F0'}`,
                }}>
                {s === 'all' ? 'All' : STATUS_META[s as ApplicationStatus]?.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 32px 80px', maxWidth: 900, margin: '0 auto', width: '100%' }} className="md:px-10">
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 20px',
            animation: 'fadeSlideUp 0.45s ease both',
          }}>
            <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800,
              color: '#0F172A', marginBottom: 8,
            }}>
              No candidates
            </div>
            <div style={{ fontSize: 14, color: '#64748B', fontFamily: 'var(--font-dm)' }}>
              {statusFilter === 'all'
                ? 'Candidates will appear here when they apply'
                : `No ${STATUS_META[statusFilter as ApplicationStatus]?.label} candidates`}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((app, idx) => {
              const name = app.candidates?.users?.full_name ?? 'Candidate';
              const nexts = VALID_TRANSITIONS[app.status as ApplicationStatus] ?? [];
              const isExpanded = expanded === app.id;
              const skills = app.candidates?.skills ?? [];
              const gapSkills = app.skill_gaps ?? [];
              const borderColor = STATUS_LEFT[app.status] ?? '#E2E8F0';

              return (
                <div key={app.id}
                  style={{
                    background: 'white', borderRadius: 20, overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                    border: '1px solid #F1F5F9',
                    borderLeft: `4px solid ${borderColor}`,
                    animation: 'fadeSlideUp 0.45s ease both',
                    animationDelay: `${idx * 50}ms`,
                    transition: 'box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.09)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'}>

                  <div style={{ padding: '20px 24px', cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : app.id)}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      {/* Rank badge */}
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 900, flexShrink: 0, marginTop: 4,
                        background: idx < 3 ? 'linear-gradient(135deg, #3B82F6, #06B6D4)' : '#F1F5F9',
                        color: idx < 3 ? 'white' : '#94A3B8',
                        fontFamily: 'var(--font-display)',
                      }}>
                        #{idx + 1}
                      </div>

                      <Avatar name={name} size={50} src={app.candidates?.users?.avatar_url} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 900,
                          color: '#0F172A', marginBottom: 3,
                        }}>
                          {name}
                        </div>
                        {app.candidates?.headline && (
                          <div style={{
                            fontSize: 14, color: '#64748B', fontFamily: 'var(--font-dm)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            marginBottom: 7,
                          }}>
                            {app.candidates.headline}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <HMStatusBadge status={app.status} small />
                          {app.match_score != null && (
                            <span style={{
                              fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-dm)',
                              color: scoreColor(app.match_score),
                            }}>
                              ● {app.match_score}% match
                            </span>
                          )}
                        </div>
                      </div>

                      <HMMatchRing score={app.match_score ?? 0} size={52} />
                    </div>

                    {skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                        {skills.slice(0, 4).map((s: string) => <HMSkillChip key={s} label={s} variant="matched" />)}
                        {skills.length > 4 && (
                          <span style={{ fontSize: 11, color: '#94A3B8', alignSelf: 'center', fontFamily: 'var(--font-dm)' }}>
                            +{skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {gapSkills.length > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B', fontFamily: 'var(--font-dm)' }}>
                          {gapSkills.length} skill gap{gapSkills.length !== 1 ? 's' : ''}: {gapSkills.slice(0, 2).map((g: any) => g.skill_name).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Expand chevron */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                      <svg
                        width={16} height={16} viewBox="0 0 24 24" fill="none"
                        stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                        style={{ transition: 'transform 0.2s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{
                      borderTop: '1px solid #F1F5F9',
                      padding: '16px 20px',
                      background: '#FAFBFC',
                    }}>
                      {nexts.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                            textTransform: 'uppercase', color: '#94A3B8',
                            fontFamily: 'var(--font-dm)', marginBottom: 10,
                          }}>
                            Update Status
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {nexts.map(n => (
                              <button key={n} onClick={() => updateStatus(app.id, n)}
                                style={{
                                  flex: 1, padding: '9px 8px', borderRadius: 12,
                                  fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                                  background: STATUS_META[n].bg, color: STATUS_META[n].text,
                                  fontFamily: 'var(--font-dm)',
                                  transition: 'transform 0.15s ease',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                                → {STATUS_META[n].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {gapSkills.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                            textTransform: 'uppercase', color: '#94A3B8',
                            fontFamily: 'var(--font-dm)', marginBottom: 10,
                          }}>
                            Skill Gaps
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {gapSkills.map((g: any, i: number) => {
                              const c = g.importance === 'high' ? '#F43F5E' : g.importance === 'medium' ? '#F59E0B' : '#10B981';
                              return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: c, flexShrink: 0 }} />
                                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-display)', flex: 1 }}>
                                    {g.skill_name}
                                  </span>
                                  <span style={{
                                    fontSize: 10, fontWeight: 800, padding: '2px 8px',
                                    borderRadius: 999, background: `${c}15`, color: c,
                                    fontFamily: 'var(--font-dm)',
                                  }}>
                                    {g.importance}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => router.push(`/recruiter/candidates/${app.candidate_id}?jobId=${job.id}&appId=${app.id}`)}
                        style={{
                          width: '100%', padding: '11px', borderRadius: 14,
                          fontSize: 13, fontWeight: 700,
                          color: '#3B82F6', border: '1.5px solid #3B82F6',
                          background: 'transparent', cursor: 'pointer',
                          fontFamily: 'var(--font-dm)',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.06)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        View Full Profile →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
