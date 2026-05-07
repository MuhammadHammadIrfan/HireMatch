'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HMButton from '@/components/ui/HMButton';
import StatusTimeline from '@/components/features/StatusTimeline';
import { scoreColor, STATUS_META } from '@/lib/types';
import type { ApplicationStatus } from '@/lib/types';

const TABS = ['All', 'Submitted', 'Under Review', 'Shortlisted', 'Rejected'] as const;
const TAB_STATUS: Record<string, ApplicationStatus> = {
  'Submitted': 'submitted', 'Under Review': 'under_review',
  'Shortlisted': 'shortlisted', 'Rejected': 'rejected',
};
const STATUS_LEFT: Record<ApplicationStatus, string> = {
  submitted: '#3B82F6', under_review: '#F59E0B', shortlisted: '#10B981', rejected: '#F43F5E',
};
const IMPORTANCE_META = {
  high:   { color: '#F43F5E', bg: 'rgba(244,63,94,0.10)',   dot: '🔴' },
  medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  dot: '🟡' },
  low:    { color: '#10B981', bg: 'rgba(16,185,129,0.10)',  dot: '🟢' },
};

function CompanyInitial({ name }: { name: string }) {
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#F59E0B', '#F43F5E'];
  const color = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-black text-sm flex-shrink-0"
      style={{ background: color }}>
      {(name ?? '?')[0].toUpperCase()}
    </div>
  );
}

const EMPTY_STATES: Record<string, { emoji: string; title: string; body: string }> = {
  All: { emoji: '📋', title: 'No applications yet', body: "You haven't applied to any jobs yet. Start exploring!" },
  Submitted: { emoji: '📤', title: 'No pending applications', body: 'Start applying to jobs to see them here!' },
  'Under Review': { emoji: '🔍', title: 'Nothing under review', body: 'Applications being reviewed will appear here.' },
  Shortlisted: { emoji: '⭐', title: 'Not shortlisted yet', body: 'Keep applying — your match score improves your chances!' },
  Rejected: { emoji: '💪', title: 'No rejections', body: 'Keep going — each application is a learning experience.' },
};

export default function ApplicationsClient({ applications }: { applications: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = applications.filter(a =>
    activeTab === 'All' || a.status === TAB_STATUS[activeTab]
  );

  const counts: Record<string, number> = { All: applications.length };
  for (const t of TABS.slice(1)) {
    counts[t] = applications.filter(a => a.status === TAB_STATUS[t]).length;
  }

  const avgScore = applications.length > 0
    ? Math.round(applications.reduce((s, a) => s + (a.match_score ?? 0), 0) / applications.length)
    : 0;
  const shortlistRate = applications.length > 0
    ? Math.round((counts.Shortlisted / applications.length) * 100)
    : 0;

  const empty = EMPTY_STATES[activeTab];

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC' }}>
      <style>{`
        @keyframes shimmerBg { 0% { background-position:0% 50%; } 100% { background-position:-200% 50%; } }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Shimmer bar */}
      <div style={{ height:3, width:'100%', background:'linear-gradient(90deg,#3B82F6,#8B5CF6,#06B6D4,#10B981,#3B82F6)', backgroundSize:'200% 100%', animation:'shimmerBg 4s linear infinite' }} />

      {/* Dark hero header */}
      <div style={{ background:'linear-gradient(160deg,#080E1C 0%,#0F172A 50%,#111827 100%)', position:'relative', overflow:'hidden', padding:'48px 48px 80px' }}>
        <div style={{ position:'absolute', top:'-30%', right:'-5%', width:540, height:540, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle at 60% 40%,rgba(59,130,246,0.13),transparent 65%)' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:50, background:'linear-gradient(to bottom,transparent,#F8FAFC)', pointerEvents:'none' }} />

        <div style={{ position:'relative', width:'100%' }}>
          <div style={{ animation:'fadeSlideUp 0.4s ease both', marginBottom:28 }}>
            <div style={{ fontSize:15, fontWeight:500, color:'rgba(148,163,184,0.85)', fontFamily:'var(--font-dm)', marginBottom:8 }}>Track your journey</div>
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'clamp(32px,5vw,56px)', color:'white', letterSpacing:'-0.03em', lineHeight:1.02, margin:0 }}>My Applications</h1>
          </div>

          {/* Mini stats */}
          {applications.length > 0 && (
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', animation:'fadeSlideUp 0.4s ease both', animationDelay:'70ms' }}>
              {[
                { label:'Total', value:applications.length, color:'#3B82F6' },
                { label:'Avg Match', value:`${avgScore}%`, color:'#8B5CF6' },
                { label:'Shortlist Rate', value:`${shortlistRate}%`, color:'#10B981' },
              ].map(s => (
                <div key={s.label} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 18px', borderRadius:999, background:'rgba(255,255,255,0.07)', border:`1px solid ${s.color}30` }}>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:900, color:s.color }}>{s.value}</span>
                  <span style={{ fontSize:13, color:'rgba(148,163,184,0.85)', fontFamily:'var(--font-dm)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs bar */}
      <div style={{ background:'white', borderBottom:'1px solid #E2E8F0', position:'sticky', top:0, zIndex:20 }}>
        <div style={{ padding:'0 48px' }}>
          <div style={{ display:'flex', overflowX:'auto', gap:0 }}>
            {TABS.map(t => {
              const isActive = activeTab === t;
              return (
                <button key={t} onClick={() => setActiveTab(t)} style={{ display:'flex', alignItems:'center', gap:7, padding:'16px 14px', border:'none', background:'transparent', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, fontFamily:'var(--font-dm)', fontWeight:isActive ? 800 : 500, color: isActive ? '#3B82F6' : '#64748B', fontSize:14, borderBottom:`2.5px solid ${isActive ? '#3B82F6' : 'transparent'}`, transition:'all 0.15s ease' }}>
                  {t}
                  {counts[t] > 0 && <span style={{ fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:999, background: isActive ? 'rgba(59,130,246,0.12)' : '#F1F5F9', color: isActive ? '#3B82F6' : '#64748B' }}>{counts[t]}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding:'28px 48px 60px', width:'100%' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>{empty.emoji}</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'#0F172A', marginBottom:10 }}>{empty.title}</div>
            <div style={{ fontSize:15, color:'#64748B', marginBottom:28, fontFamily:'var(--font-dm)' }}>{empty.body}</div>
            <HMButton onClick={() => router.push('/candidate/jobs')} fullWidth={false} className="px-6">Browse Jobs</HMButton>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {filtered.map(app => {
              const meta = STATUS_META[app.status as ApplicationStatus];
              const isExpanded = expanded === app.id;
              const skillGaps = app.skill_gaps ?? [];
              const company = app.jobs?.recruiters?.company_name ?? 'Company';
              return (
                <div key={app.id} style={{ background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', borderLeft:`4px solid ${STATUS_LEFT[app.status as ApplicationStatus] ?? '#E2E8F0'}` }}>

                  {/* Main row */}
                  <div style={{ padding:'20px 24px', cursor:'pointer' }} onClick={() => setExpanded(isExpanded ? null : app.id)}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                      <CompanyInitial name={company} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                          <div>
                            <div style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:800, color:'#0F172A' }}>{app.jobs?.title ?? 'Unknown Job'}</div>
                            <div style={{ fontSize:14, color:'#64748B', marginTop:2, fontFamily:'var(--font-dm)' }}>{company}</div>
                          </div>
                          <span style={{ fontSize:12, fontWeight:700, padding:'5px 12px', borderRadius:999, background:meta.bg, color:meta.text, flexShrink:0 }}>{meta.label}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:10, flexWrap:'wrap' }}>
                          <span style={{ fontSize:12, color:'#94A3B8', fontFamily:'var(--font-dm)' }}>Applied {new Date(app.submitted_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</span>
                          {app.reference_code && <span style={{ fontSize:12, fontFamily:'monospace', fontWeight:700, color:'#64748B', background:'#F1F5F9', padding:'2px 8px', borderRadius:6 }}>{app.reference_code}</span>}
                          {app.match_score != null && <span style={{ fontSize:12, fontWeight:700, color:scoreColor(app.match_score) }}>● {app.match_score}% match</span>}
                        </div>
                      </div>
                      <span style={{ color:'#94A3B8', flexShrink:0, fontSize:18, transition:'transform 0.2s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>⌃</span>
                    </div>

                    {/* Timeline (always visible) */}
                    <div className="mt-3">
                      <StatusTimeline
                        status={app.status}
                        submittedAt={app.submitted_at}
                        reviewedAt={app.reviewed_at}
                        shortlistedAt={app.shortlisted_at}
                      />
                    </div>
                  </div>

                  {/* Expanded section */}
                  {isExpanded && (
                    <div className="border-t border-hm-border px-4 py-4 bg-slate-50">
                      {/* Skill gaps */}
                      {skillGaps.length > 0 && (
                        <div className="mb-4">
                          <div className="text-[12px] font-semibold uppercase tracking-wide text-hm-textS mb-2">Skill Gaps</div>
                          <div className="space-y-2">
                            {skillGaps.map((gap: any, i: number) => {
                              const imp = IMPORTANCE_META[gap.importance as keyof typeof IMPORTANCE_META] ?? IMPORTANCE_META.low;
                              return (
                                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl"
                                  style={{ background: imp.bg }}>
                                  <span className="text-sm flex-shrink-0">{imp.dot}</span>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[13px] font-semibold text-hm-textP">{gap.skill_name}</span>
                                    {gap.suggestion && (
                                      <span className="text-[12px] text-hm-textS" style={{ fontFamily: 'var(--font-dm)' }}>
                                        {' '}— {gap.suggestion}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Cover note */}
                      {app.cover_note && (
                        <div className="mb-4">
                          <div className="text-[12px] font-semibold uppercase tracking-wide text-hm-textS mb-2">Cover Note</div>
                          <div className="text-[13px] text-hm-textP bg-white rounded-xl p-3 border border-hm-border"
                            style={{ fontFamily: 'var(--font-dm)' }}>
                            {app.cover_note}
                          </div>
                        </div>
                      )}

                      <HMButton variant="secondary" size="sm"
                        onClick={() => router.push(`/candidate/jobs/${app.job_id}`)}>
                        View Job Posting →
                      </HMButton>
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
