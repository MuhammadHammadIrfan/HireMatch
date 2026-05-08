'use client';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { scoreColor } from '@/lib/types';

const COLUMNS = [
  {
    key: 'submitted',
    label: 'Applied',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.10)',
    gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    emptyIcon: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M19 8v6M22 11l-3-3-3 3',
  },
  {
    key: 'under_review',
    label: 'Reviewing',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.10)',
    gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
    emptyIcon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 6 0 3 3 0 0 0-6 0',
  },
  {
    key: 'shortlisted',
    label: 'Shortlisted',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.10)',
    gradient: 'linear-gradient(135deg, #10B981, #34D399)',
    emptyIcon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    color: '#F43F5E',
    bg: 'rgba(244,63,94,0.10)',
    gradient: 'linear-gradient(135deg, #F43F5E, #FB7185)',
    emptyIcon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  },
];

export default function PipelineClient({ columns }: { columns: Record<string, any[]> }) {
  const router = useRouter();
  const total = Object.values(columns).reduce((a, arr) => a + arr.length, 0);

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
        @keyframes cardPop {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes colFade {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Shimmer rainbow bar */}
      <div style={{
        height: 3, width: '100%',
        background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4, #10B981, #3B82F6)',
        backgroundSize: '200% 100%',
        animation: 'shimmerBg 4s linear infinite',
      }} />

      {/* Dark hero header */}
      <div style={{
        background: 'linear-gradient(160deg, #080E1C 0%, #0F172A 50%, #111827 100%)',
        position: 'relative', overflow: 'hidden',
        padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,48px) 80px',
      }}>

        {/* Ambient orbs */}
        <div style={{
          position: 'absolute', top: '-30%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle at 60% 40%, rgba(59,130,246,0.12), transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-5%',
          width: 360, height: 360, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle at 40% 60%, rgba(16,185,129,0.08), transparent 70%)',
        }} />

        {/* Ghost text */}
        <div style={{
          position: 'absolute', right: 24, bottom: 10,
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'clamp(80px, 14vw, 160px)', color: 'white',
          opacity: 0.025, lineHeight: 1, pointerEvents: 'none',
          userSelect: 'none', letterSpacing: '-0.04em',
        }}>
          Pipeline
        </div>

        {/* Fade into page */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          background: 'linear-gradient(to bottom, transparent 0%, #F8FAFC 100%)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{ animation: 'fadeSlideUp 0.4s ease both', marginBottom: 28 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(28px, 4vw, 46px)', color: 'white',
              lineHeight: 1.05, marginBottom: 8, letterSpacing: '-0.02em',
            }}>
              Pipeline
            </div>
            <div style={{ fontSize: 15, color: 'rgba(148,163,184,0.85)', fontFamily: 'var(--font-dm)' }}>
              {total} candidate{total !== 1 ? 's' : ''} across all stages
            </div>
          </div>

          {/* Stage summary strip */}
          <div style={{
            display: 'flex', gap: 10, flexWrap: 'wrap',
            animation: 'fadeSlideUp 0.4s ease both', animationDelay: '70ms',
          }}>
            {COLUMNS.map(col => {
              const count = (columns[col.key] ?? []).length;
              return (
                <div key={col.key} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 18px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.07)',
                  border: `1px solid ${col.color}30`,
                  backdropFilter: 'blur(8px)',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{
                    fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'var(--font-dm)',
                  }}>
                    {col.label}
                  </span>
                  <span style={{
                    fontSize: 14, fontWeight: 900, color: col.color,
                    fontFamily: 'var(--font-display)',
                  }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <style>{`
        .pipeline-board {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .pipeline-board {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
        @media (max-width: 480px) {
          .pipeline-board {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
      `}</style>
      <div style={{ padding:'clamp(20px,3vw,28px) clamp(16px,4vw,48px) 80px' }}>
        <div className="pipeline-board">
          {COLUMNS.map((col, colIdx) => {
            const apps = columns[col.key] ?? [];
            return (
              <div key={col.key}
                style={{
                  animation: 'colFade 0.5s ease both',
                  animationDelay: `${colIdx * 80}ms`,
                }}>

                {/* Column header */}
                <div style={{
                  borderRadius: 18, overflow: 'hidden', marginBottom: 12,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                }}>
                  <div style={{ height: 4, background: col.gradient }} />
                  <div style={{
                    background: 'white',
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: col.bg, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                        stroke={col.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d={col.emptyIcon} />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900,
                        color: '#0F172A', marginBottom: 2,
                      }}>
                        {col.label}
                      </div>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: col.color,
                        fontFamily: 'var(--font-dm)',
                      }}>
                        {apps.length} candidate{apps.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{
                      minWidth: 32, height: 32, borderRadius: 10, padding: '0 8px',
                      background: col.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 900, color: col.color,
                      fontFamily: 'var(--font-display)',
                    }}>
                      {apps.length}
                    </div>
                  </div>
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {apps.map((app, i) => {
                    const name = app.candidates?.users?.full_name ?? 'Candidate';
                    return (
                      <div key={app.id}
                        onClick={() => router.push(`/recruiter/candidates/${app.candidate_id}`)}
                        style={{
                          background: 'white', borderRadius: 16,
                          padding: '18px 20px',
                          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                          border: '1px solid #F1F5F9',
                          cursor: 'pointer',
                          transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease',
                          animation: 'cardPop 0.4s ease both',
                          animationDelay: `${colIdx * 80 + i * 50}ms`,
                          borderLeft: `3px solid ${col.color}`,
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                        }}>

                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                          <Avatar name={name} size={40} src={app.candidates?.users?.avatar_url} />
                          <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                            <div style={{
                              fontSize: 14, fontWeight: 800, color: '#0F172A',
                              fontFamily: 'var(--font-display)',
                              whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: 1.25,
                            }}>
                              {name}
                            </div>
                            <div style={{
                              fontSize: 12, color: '#64748B', fontFamily: 'var(--font-dm)',
                              whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: 1.35,
                              marginTop: 2,
                            }}>
                              {app.candidates?.headline ?? 'Candidate'}
                            </div>
                          </div>
                        </div>

                        {app.jobs?.title && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 12, color: '#94A3B8', fontFamily: 'var(--font-dm)',
                            marginBottom: 12, flexWrap: 'wrap',
                            padding: '6px 10px', borderRadius: 8,
                            background: '#F8FAFC',
                          }}>
                            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="7" width="20" height="14" rx="2"/>
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                            </svg>
                            <span style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                              {app.jobs.title}
                            </span>
                          </div>
                        )}

                        {app.match_score != null && (
                          <div>
                            <div style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              marginBottom: 6,
                            }}>
                              <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm)' }}>
                                Match score
                              </span>
                              <span style={{
                                fontSize: 12, fontWeight: 800, color: scoreColor(app.match_score),
                                fontFamily: 'var(--font-display)',
                              }}>
                                {app.match_score}%
                              </span>
                            </div>
                            <div style={{ height: 5, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', borderRadius: 999,
                                width: `${app.match_score}%`,
                                background: `linear-gradient(90deg, ${scoreColor(app.match_score)}, ${scoreColor(app.match_score)}88)`,
                                transition: 'width 1s ease',
                              }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Empty state */}
                  {apps.length === 0 && (
                    <div style={{
                      textAlign: 'center', padding: '40px 20px',
                      background: 'white', borderRadius: 16,
                      border: `2px dashed ${col.color}25`,
                      animation: 'fadeSlideUp 0.5s ease both',
                      animationDelay: `${colIdx * 80 + 100}ms`,
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: col.bg, margin: '0 auto 12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
                          stroke={col.color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                          <path d={col.emptyIcon} />
                        </svg>
                      </div>
                      <div style={{
                        fontSize: 14, fontWeight: 700, color: '#0F172A',
                        fontFamily: 'var(--font-display)', marginBottom: 4,
                      }}>
                        No candidates yet
                      </div>
                      <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'var(--font-dm)' }}>
                        {col.key === 'submitted' ? 'Candidates who apply will appear here' :
                         col.key === 'under_review' ? 'Move candidates here to review them' :
                         col.key === 'shortlisted' ? 'Shortlisted candidates will appear here' :
                         'Rejected candidates will appear here'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
