'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import HMStatusBadge from '@/components/ui/HMStatusBadge';
import HMButton from '@/components/ui/HMButton';
import { scoreColor } from '@/lib/types';
import type { DBUser, DBRecruiter, DBJob } from '@/lib/types';

interface Props { profile: DBUser | null; recruiter: DBRecruiter | null; activeJobs: DBJob[]; }

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const steps = 40;
    const inc = target / steps;
    let cur = 0;
    const timer = setInterval(() => {
      cur = Math.min(cur + inc, target);
      setCount(Math.round(cur));
      if (cur >= target) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({ value, label, color, icon, suffix = '', delay = 0 }: {
  value: number; label: string; color: string; icon: React.ReactNode; suffix?: string; delay?: number;
}) {
  const count = useCountUp(value);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 20,
        border: '1px solid rgba(226,232,240,0.8)',
        boxShadow: hovered
          ? `0 20px 48px rgba(0,0,0,0.14), 0 1px 0 rgba(255,255,255,1), 0 0 0 1px ${color}22`
          : '0 4px 24px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9)',
        padding: '28px 24px 24px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: hovered ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
        animation: `fadeSlideUp 0.55s ease both`,
        animationDelay: `${delay}ms`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      {/* Shine glint top-left */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 72, height: 72, borderBottomRightRadius: 40,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Ghost large icon */}
      <div style={{
        position: 'absolute', bottom: -8, right: -8,
        width: 88, height: 88, color, opacity: 0.05,
        pointerEvents: 'none',
      }}>
        {icon}
      </div>

      {/* Icon badge */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, marginBottom: 18,
        background: `${color}14`, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 22, height: 22 }}>{icon}</div>
      </div>

      {/* Number */}
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 900, lineHeight: 1,
        fontSize: 'clamp(38px, 4.5vw, 52px)', color, marginBottom: 8,
      }}>
        {count}{suffix}
      </div>

      {/* Label */}
      <div style={{
        fontSize: 13, fontWeight: 600, color: '#64748B',
        fontFamily: 'var(--font-dm)', letterSpacing: '0.01em',
      }}>
        {label}
      </div>
    </div>
  );
}

export default function RecruiterDashboardClient({ profile, recruiter, activeJobs }: Props) {
  const router = useRouter();
  const name = profile?.full_name?.split(' ')[0] ?? 'Recruiter';
  const company = recruiter?.company_name ?? 'Your Company';
  const totalApplicants = activeJobs.reduce((a, j) => a + (j.applicant_count ?? 0), 0);
  const avgMatch = activeJobs.length > 0
    ? Math.round(activeJobs.reduce((a, j) => a + (j.avg_match_score ?? 0), 0) / activeJobs.length)
    : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const companyInitial = (company[0] ?? 'H').toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerBg {
          0%   { background-position: 0% 50%; }
          100% { background-position: -200% 50%; }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(6,182,212,0); }
          50%       { box-shadow: 0 0 0 7px rgba(6,182,212,0.13); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>

      {/* ── Animated rainbow top bar ── */}
      <div style={{
        height: 3, width: '100%',
        background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4, #10B981, #3B82F6)',
        backgroundSize: '200% 100%',
        animation: 'shimmerBg 4s linear infinite',
      }} />

      {/* ── HERO HEADER — fades into page bg ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #080E1C 0%, #0F172A 45%, #111827 100%)',
        paddingLeft: 24, paddingRight: 24, paddingTop: 40, paddingBottom: 140,
      }}
        className="md:px-10 md:pt-10 md:pb-40">

        {/* Noise overlay */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <filter id="dash-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="overlay" />
          </filter>
        </svg>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          filter: 'url(#dash-noise)', background: 'white', pointerEvents: 'none',
        }} />

        {/* Ambient orbs */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 560, height: 560, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle at 60% 40%, rgba(59,130,246,0.14), transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-5%',
          width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle at 40% 60%, rgba(6,182,212,0.09), transparent 70%)',
        }} />

        {/* Ghost company initial */}
        <div style={{
          position: 'absolute', right: 20, bottom: 60,
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'clamp(140px, 20vw, 220px)', color: 'white',
          opacity: 0.03, lineHeight: 1, pointerEvents: 'none',
          userSelect: 'none', letterSpacing: '-0.05em',
        }}>
          {companyInitial}
        </div>

        {/* Header content */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Greeting */}
            <div style={{
              fontSize: 15, fontWeight: 500, color: 'rgba(148,163,184,0.85)',
              fontFamily: 'var(--font-dm)', marginBottom: 10,
              animation: 'fadeSlideUp 0.5s ease both', animationDelay: '0ms',
            }}>
              {greeting} —
            </div>

            {/* Name */}
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 900, color: 'white',
              fontSize: 'clamp(38px, 5.5vw, 58px)', lineHeight: 1.02,
              marginBottom: 14, letterSpacing: '-0.02em',
              animation: 'fadeSlideUp 0.5s ease both', animationDelay: '60ms',
            }}>
              {name}
            </div>

            {/* Company pill + active badge row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              animation: 'fadeSlideUp 0.5s ease both', animationDelay: '120ms',
            }}>
              <span style={{
                fontSize: 13, fontWeight: 600, padding: '5px 14px', borderRadius: 999,
                background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-dm)',
              }}>
                {company}
              </span>

              {/* Cyan pulse badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 14px', borderRadius: 999,
                background: 'rgba(6,182,212,0.11)', border: '1px solid rgba(6,182,212,0.2)',
                animation: 'badgePulse 2.5s ease-in-out infinite',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#22D3EE', flexShrink: 0,
                  animation: 'dotPulse 1.8s ease-in-out infinite',
                }} />
                <span style={{
                  fontSize: 13, fontWeight: 600, color: '#67E8F9', fontFamily: 'var(--font-dm)',
                }}>
                  {activeJobs.length} active posting{activeJobs.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <Avatar name={profile?.full_name ?? 'R'} size={52} src={profile?.avatar_url} />
        </div>

        {/* Stat grid — lives inside header, floats over fade */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16,
          marginTop: 40, maxWidth: 1280, margin: '40px auto 0', width: '100%',
        }}
          className="md:grid-cols-4">
          <StatCard delay={180} value={activeJobs.length} label="Active Jobs" color="#3B82F6" icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          } />
          <StatCard delay={250} value={avgMatch} label="Avg Match Score" color="#8B5CF6" suffix="%" icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>
          } />
          <StatCard delay={320} value={totalApplicants} label="Total Applicants" color="#10B981" icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          } />
          <StatCard delay={390} value={activeJobs.filter(j => (j.applicant_count ?? 0) > 0).length} label="Jobs w/ Applicants" color="#F59E0B" icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          } />
        </div>

        {/* Gradient fade — header melts into page */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
          background: 'linear-gradient(to bottom, transparent 0%, #F8FAFC 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── BODY CONTENT ── */}
      <div style={{ padding: '0 24px 80px', maxWidth: 1280, margin: '-20px auto 0', width: '100%' }}
        className="md:px-10">

        {/* Active Jobs section header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: 20, marginBottom: 24,
          borderBottom: '1px solid #E2E8F0',
          animation: 'fadeSlideUp 0.55s ease both', animationDelay: '440ms',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Accent bar */}
            <div style={{ width: 4, height: 28, borderRadius: 4, background: 'linear-gradient(180deg, #3B82F6, #06B6D4)', flexShrink: 0 }} />
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900, color: '#0F172A',
              fontSize: 'clamp(20px, 2.5vw, 26px)', margin: 0,
            }}>
              Active Jobs
            </h2>
            {activeJobs.length > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: '50%', fontSize: 12, fontWeight: 900,
                color: 'white', background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
              }}>
                {activeJobs.length}
              </span>
            )}
          </div>
          <button onClick={() => router.push('/recruiter/jobs')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              color: 'white', fontSize: 14, fontWeight: 700,
              background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
              border: 'none', cursor: 'pointer',
              padding: '10px 20px', borderRadius: 12,
              fontFamily: 'var(--font-dm)',
              boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.35)'; }}>
            View All
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {activeJobs.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 20, padding: '56px 32px',
            textAlign: 'center', border: '2px dashed #E2E8F0',
            animation: 'fadeSlideUp 0.55s ease both', animationDelay: '480ms',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16, margin: '0 auto 20px',
              background: 'rgba(59,130,246,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
              No active jobs yet
            </div>
            <div style={{ fontSize: 15, color: '#64748B', marginBottom: 28, fontFamily: 'var(--font-dm)' }}>
              Post your first job to start receiving applications
            </div>
            <HMButton onClick={() => router.push('/recruiter/jobs/new')} fullWidth={false} className="px-8 h-11">
              Post a Job
            </HMButton>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}
            className="lg:grid-cols-2">
            {activeJobs.map((job, i) => {
              const [cardHovered, setCardHovered] = useState(false);
              return (
                <div key={job.id}
                  onMouseEnter={() => setCardHovered(true)}
                  onMouseLeave={() => setCardHovered(false)}
                  onClick={() => router.push(`/recruiter/jobs/${job.id}/candidates`)}
                  style={{
                    background: 'white', borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                    border: '1px solid #F1F5F9',
                    boxShadow: cardHovered ? '0 20px 48px rgba(0,0,0,0.11)' : '0 2px 12px rgba(0,0,0,0.05)',
                    transform: cardHovered ? 'translateY(-4px)' : 'translateY(0)',
                    transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    animation: 'fadeSlideUp 0.55s ease both',
                    animationDelay: `${480 + i * 60}ms`,
                  }}>
                  {/* Gradient top accent */}
                  <div style={{ height: 3, background: 'linear-gradient(90deg, #3B82F6, #06B6D4)' }} />

                  <div style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800,
                          color: '#0F172A', marginBottom: 5,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {job.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B', fontFamily: 'var(--font-dm)' }}>
                          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {job.location} · {job.employment_type}
                        </div>
                      </div>
                      <HMStatusBadge status={job.status} small />
                    </div>

                    {(job.avg_match_score ?? 0) > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'var(--font-dm)' }}>Avg match quality</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(job.avg_match_score ?? 0) }}>
                            {job.avg_match_score}%
                          </span>
                        </div>
                        <div style={{ height: 6, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 999,
                            width: `${job.avg_match_score ?? 0}%`,
                            background: `linear-gradient(90deg, ${scoreColor(job.avg_match_score ?? 0)}, ${scoreColor(job.avg_match_score ?? 0)}88)`,
                            transition: 'width 1s ease',
                          }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, color: '#64748B', fontFamily: 'var(--font-dm)' }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        </svg>
                        <strong style={{ color: '#0F172A' }}>{job.applicant_count}</strong> applicants
                      </div>
                      <HMButton size="sm" fullWidth={false}
                        onClick={e => { e.stopPropagation(); router.push(`/recruiter/jobs/${job.id}/candidates`); }}
                        className="h-10 text-sm px-5">
                        View Candidates
                      </HMButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* FAB */}
      <button onClick={() => router.push('/recruiter/jobs/new')}
        className="fixed bottom-20 right-5 md:bottom-8 w-14 h-14 rounded-2xl border-none cursor-pointer text-white flex items-center justify-center z-[60] transition-all duration-150 hover:-translate-y-1 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', boxShadow: '0 8px 32px rgba(59,130,246,0.45)' }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  );
}
