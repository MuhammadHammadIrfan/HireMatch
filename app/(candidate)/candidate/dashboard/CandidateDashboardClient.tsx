'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import HMJobCard from '@/components/ui/HMJobCard';
import { calcProfileStrength, scoreColor } from '@/lib/types';
import type { DBUser, DBCandidate, JobWithRecruiter, DBNotification } from '@/lib/types';

interface Stats { total: number; underReview: number; shortlisted: number; avgScore: number; }
interface Props { profile: DBUser | null; candidate: DBCandidate | null; matchedJobs: JobWithRecruiter[]; stats: Stats; notifications: DBNotification[]; }

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const steps = 40; const inc = target / steps; let cur = 0;
    const timer = setInterval(() => { cur = Math.min(cur + inc, target); setCount(Math.round(cur)); if (cur >= target) clearInterval(timer); }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({ value, label, color, icon, suffix = '', delay = 0 }: { value: number; label: string; color: string; icon: React.ReactNode; suffix?: string; delay?: number; }) {
  const count = useCountUp(value);
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: 'rgba(255,255,255,0.97)', borderRadius: 20,
      border: '1px solid rgba(226,232,240,0.8)',
      boxShadow: hovered ? `0 20px 48px rgba(0,0,0,0.14), 0 0 0 1px ${color}22` : '0 4px 24px rgba(0,0,0,0.08)',
      padding: '28px 24px 24px', position: 'relative', overflow: 'hidden',
      transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      transform: hovered ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
      animation: 'fadeSlideUp 0.55s ease both', animationDelay: `${delay}ms`,
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ position:'absolute', bottom:-8, right:-8, width:88, height:88, color, opacity:0.05, pointerEvents:'none' }}>{icon}</div>
      <div style={{ width:44, height:44, borderRadius:12, marginBottom:18, background:`${color}14`, color, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:22, height:22 }}>{icon}</div>
      </div>
      <div style={{ fontFamily:'var(--font-display)', fontWeight:900, lineHeight:1, fontSize:'clamp(36px,4vw,50px)', color, marginBottom:8 }}>{count}{suffix}</div>
      <div style={{ fontSize:13, fontWeight:600, color:'#64748B', fontFamily:'var(--font-dm)', letterSpacing:'0.01em' }}>{label}</div>
    </div>
  );
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'shortlisted') return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  if (type === 'new_match') return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`;
}

function notifBg(type: string) {
  if (type === 'shortlisted') return 'rgba(16,185,129,0.10)';
  if (type === 'new_match') return 'rgba(59,130,246,0.10)';
  return 'rgba(245,158,11,0.10)';
}

export default function CandidateDashboardClient({ profile, candidate, matchedJobs, stats, notifications }: Props) {
  const router = useRouter();
  const name = profile?.full_name?.split(' ')[0] ?? 'There';
  const profileStrength = calcProfileStrength({ hasResume: !!candidate?.resume_url, skillCount: candidate?.skills?.length ?? 0, workExpCount: candidate?.work_experience?.length ?? 0, educationCount: candidate?.education?.length ?? 0, hasHeadline: !!candidate?.headline });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const strengthLabel = profileStrength < 40 ? 'Just getting started' : profileStrength < 70 ? 'Good progress — keep adding details' : profileStrength < 90 ? 'Almost there!' : 'Looking great!';
  const [readNotifs, setReadNotifs] = useState<Set<string>>(new Set());
  const unreadCount = notifications.filter(n => !n.is_read && !readNotifs.has(n.id)).length;
  const profileItems = [
    { label: 'Resume uploaded', done: !!candidate?.resume_url },
    { label: 'Skills added', done: (candidate?.skills?.length ?? 0) > 0 },
    { label: 'Work experience', done: (candidate?.work_experience?.length ?? 0) > 0 },
    { label: 'Education', done: (candidate?.education?.length ?? 0) > 0 },
    { label: 'Headline written', done: !!candidate?.headline },
  ];
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setBarWidth(profileStrength), 300); return () => clearTimeout(t); }, [profileStrength]);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmerBg { 0% { background-position:0% 50%; } 100% { background-position:-200% 50%; } }
        @keyframes badgePulse { 0%,100% { box-shadow:0 0 0 0 rgba(16,185,129,0); } 50% { box-shadow:0 0 0 7px rgba(16,185,129,0.13); } }
        @keyframes dotPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(0.85); } }
      `}</style>

      {/* Shimmer bar */}
      <div style={{ height:3, width:'100%', background:'linear-gradient(90deg,#3B82F6,#8B5CF6,#06B6D4,#10B981,#3B82F6)', backgroundSize:'200% 100%', animation:'shimmerBg 4s linear infinite' }} />

      {/* Dark hero header */}
      <div style={{ position:'relative', overflow:'hidden', width:'100%', boxSizing:'border-box', background:'linear-gradient(160deg,#080E1C 0%,#0F172A 45%,#111827 100%)', padding:`clamp(24px,5vw,40px) clamp(16px,4vw,40px) 140px` }}>
        {/* Orbs */}
        <div style={{ position:'absolute', top:'-20%', right:'-10%', width:560, height:560, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle at 60% 40%,rgba(59,130,246,0.14),transparent 65%)' }} />
        <div style={{ position:'absolute', bottom:'-10%', left:'-5%', width:400, height:400, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle at 40% 60%,rgba(16,185,129,0.09),transparent 70%)' }} />
        {/* Ghost initial */}
        <div style={{ position:'absolute', right:20, bottom:60, fontFamily:'var(--font-display)', fontWeight:900, fontSize:'clamp(140px,20vw,220px)', color:'white', opacity:0.03, lineHeight:1, pointerEvents:'none', userSelect:'none', letterSpacing:'-0.05em' }}>{(name[0] ?? 'H').toUpperCase()}</div>
        {/* Fade to page */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:100, background:'linear-gradient(to bottom,transparent 0%,#F8FAFC 100%)', pointerEvents:'none' }} />

        {/* Header row */}
        <div style={{ position:'relative', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, maxWidth:1280, margin:'0 auto', width:'100%' }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:16, fontWeight:500, color:'rgba(148,163,184,0.85)', fontFamily:'var(--font-dm)', marginBottom:12, animation:'fadeSlideUp 0.5s ease both' }}>{greeting} —</div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:900, color:'white', fontSize:'clamp(40px,5.5vw,60px)', lineHeight:1.0, marginBottom:16, letterSpacing:'-0.03em', animation:'fadeSlideUp 0.5s ease both', animationDelay:'60ms' }}>{name} 👋</div>
            <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', animation:'fadeSlideUp 0.5s ease both', animationDelay:'120ms' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:999, background:'rgba(16,185,129,0.11)', border:'1px solid rgba(16,185,129,0.2)', animation:'badgePulse 2.5s ease-in-out infinite' }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#22D3EE', flexShrink:0, animation:'dotPulse 1.8s ease-in-out infinite' }} />
                <span style={{ fontSize:13, fontWeight:600, color:'#6EE7B7', fontFamily:'var(--font-dm)' }}>{matchedJobs.length} AI-matched jobs</span>
              </div>
              {unreadCount > 0 && (
                <button onClick={() => router.push('/candidate/dashboard')} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:999, background:'rgba(244,63,94,0.11)', border:'1px solid rgba(244,63,94,0.2)', cursor:'pointer', fontSize:13, fontWeight:600, color:'#FDA4AF', fontFamily:'var(--font-dm)' }}>
                  🔔 {unreadCount} new
                </button>
              )}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
            <Avatar name={profile?.full_name ?? 'U'} size={52} src={profile?.avatar_url} />
          </div>
        </div>

        {/* Stat grid */}
        <div style={{ position:'relative', zIndex:2, display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20, marginTop:48, width:'100%', maxWidth:1280, marginLeft:'auto', marginRight:'auto' }} className="md:grid-cols-4">
          <StatCard delay={180} value={stats.total} label="Applications" color="#3B82F6" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} />
          <StatCard delay={250} value={stats.underReview} label="Under Review" color="#F59E0B" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
          <StatCard delay={320} value={stats.shortlisted} label="Shortlisted" color="#10B981" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} />
          <StatCard delay={390} value={stats.avgScore} label="Avg Match Score" color="#8B5CF6" suffix="%" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'0 clamp(16px,4vw,48px) 80px', margin:'-20px auto 0', width:'100%', maxWidth:'100%', boxSizing:'border-box' }}>

        {/* Profile + Activity row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:20, marginBottom:28 }} className="lg:grid-cols-3">

          {/* Profile Strength */}
          <div style={{ background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', animation:'fadeSlideUp 0.55s ease both', animationDelay:'440ms' }}>
            <div style={{ height:3, background:'linear-gradient(90deg,#3B82F6,#06B6D4)' }} />
            <div style={{ padding:'24px 28px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'#94A3B8', fontFamily:'var(--font-dm)', marginBottom:8 }}>Profile Strength</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(34px,4vw,46px)', fontWeight:900, lineHeight:1, color: profileStrength >= 80 ? '#10B981' : profileStrength >= 50 ? '#F59E0B' : '#3B82F6' }}>{profileStrength}%</div>
                  <div style={{ fontSize:13, color:'#64748B', marginTop:6, fontFamily:'var(--font-dm)' }}>{strengthLabel}</div>
                </div>
                <svg width={80} height={80} viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#E2E8F0" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke={profileStrength >= 80 ? '#10B981' : profileStrength >= 50 ? '#F59E0B' : '#3B82F6'} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2*Math.PI*34}`} strokeDashoffset={`${2*Math.PI*34*(1-barWidth/100)}`} transform="rotate(-90 40 40)" style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
                  <text x="40" y="38" textAnchor="middle" fontSize="13" fontWeight="900" fill="#0F172A" fontFamily="Plus Jakarta Sans,sans-serif">{profileStrength}%</text>
                  <text x="40" y="52" textAnchor="middle" fontSize="9" fill="#94A3B8" fontFamily="DM Sans,sans-serif">complete</text>
                </svg>
              </div>
              <div style={{ height:6, background:'#F1F5F9', borderRadius:999, overflow:'hidden', marginBottom:20 }}>
                <div style={{ height:'100%', borderRadius:999, width:`${barWidth}%`, background:'linear-gradient(90deg,#3B82F6,#06B6D4)', transition:'width 1.2s ease' }} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
                {profileItems.map(item => (
                  <div key={item.label} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', flexShrink:0, background: item.done ? '#10B981' : '#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={item.done ? 'white' : '#94A3B8'} strokeWidth={3} strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{ fontSize:13, fontFamily:'var(--font-dm)', fontWeight:600, color: item.done ? '#0F172A' : '#94A3B8' }}>{item.label}</span>
                  </div>
                ))}
              </div>
              {profileStrength < 100 && (
                <button onClick={() => router.push('/candidate/profile')} style={{ width:'100%', padding:'12px 0', borderRadius:12, border:'1.5px solid #3B82F6', background:'transparent', color:'#3B82F6', fontSize:14, fontWeight:800, fontFamily:'var(--font-display)', cursor:'pointer', transition:'all 0.15s ease' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.06)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  Improve Profile →
                </button>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', animation:'fadeSlideUp 0.55s ease both', animationDelay:'500ms' }} className="lg:col-span-2">
            <div style={{ height:3, background:'linear-gradient(90deg,#8B5CF6,#06B6D4)' }} />
            <div style={{ padding:'24px 28px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:4, height:24, borderRadius:4, background:'linear-gradient(180deg,#8B5CF6,#06B6D4)', flexShrink:0 }} />
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:900, color:'#0F172A', fontSize:'clamp(16px,2vw,20px)' }}>Recent Activity</div>
                </div>
              </div>
              {notifications.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 20px' }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:'rgba(245,158,11,0.10)', margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  </div>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'#0F172A', fontSize:16, marginBottom:6 }}>No activity yet</div>
                  <div style={{ fontSize:14, color:'#64748B', fontFamily:'var(--font-dm)' }}>Apply to jobs to see your activity here</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {notifications.slice(0, 6).map(notif => {
                    const isRead = notif.is_read || readNotifs.has(notif.id);
                    return (
                      <div key={notif.id} onClick={() => setReadNotifs(s => new Set([...s, notif.id]))} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 14px', borderRadius:14, cursor:'pointer', opacity: isRead ? 0.5 : 1, background: isRead ? 'transparent' : '#FAFBFF', border:`1px solid ${isRead ? 'transparent' : '#E8EEFF'}`, transition:'all 0.15s ease' }}>
                        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background: notifBg(notif.type), display:'flex', alignItems:'center', justifyContent:'center' }}><NotifIcon type={notif.type} /></div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, fontWeight:700, color:'#0F172A', fontFamily:'var(--font-display)' }}>{notif.title}</div>
                          {notif.body && <div style={{ fontSize:13, color:'#64748B', fontFamily:'var(--font-dm)', marginTop:2 }}>{notif.body}</div>}
                        </div>
                        <div style={{ fontSize:12, color:'#94A3B8', flexShrink:0, fontFamily:'var(--font-dm)' }}>{timeAgo(notif.created_at)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Best Matches section */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:14, paddingBottom:20, marginBottom:24, borderBottom:'1px solid #E2E8F0', animation:'fadeSlideUp 0.55s ease both', animationDelay:'560ms' }} className="flex-col sm:flex-row sm:items-center sm:justify-between">
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:4, height:28, borderRadius:4, background:'linear-gradient(180deg,#3B82F6,#06B6D4)', flexShrink:0 }} />
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:900, color:'#0F172A', fontSize:'clamp(20px,2.5vw,26px)', margin:0 }}>Best Matches</h2>
          </div>
          <button onClick={() => router.push('/candidate/jobs')} style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7, color:'white', fontSize:14, fontWeight:700, background:'linear-gradient(135deg,#3B82F6,#06B6D4)', border:'none', cursor:'pointer', padding:'10px 18px', borderRadius:12, fontFamily:'var(--font-dm)', boxShadow:'0 4px 14px rgba(59,130,246,0.35)', transition:'transform 0.15s ease,box-shadow 0.15s ease' }} className="w-full sm:w-auto sm:px-5" onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
            View All
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {matchedJobs.length === 0 && !candidate?.resume_url ? (
          <div style={{ background:'white', borderRadius:20, padding:'56px 32px', textAlign:'center', border:'2px dashed #E2E8F0', animation:'fadeSlideUp 0.55s ease both', animationDelay:'600ms' }}>
            <div style={{ width:60, height:60, borderRadius:16, margin:'0 auto 20px', background:'rgba(59,130,246,0.07)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:800, color:'#0F172A', marginBottom:8 }}>Upload your resume first</div>
            <div style={{ fontSize:15, color:'#64748B', marginBottom:28, fontFamily:'var(--font-dm)' }}>We&apos;ll match you with the best jobs using Gemini AI</div>
            <button onClick={() => router.push('/candidate/resume/upload')} style={{ display:'inline-flex', alignItems:'center', gap:10, color:'white', padding:'14px 32px', borderRadius:14, fontSize:16, fontWeight:800, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#3B82F6,#06B6D4)', boxShadow:'0 8px 24px rgba(59,130,246,0.35)', fontFamily:'var(--font-display)', transition:'transform 0.15s ease' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
              Upload Resume
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:20 }} className="md:grid-cols-2 xl:grid-cols-3">
            {matchedJobs.map(job => (
              <HMJobCard key={job.id} job={job} onPress={() => router.push(`/candidate/jobs/${job.id}`)} onApply={() => router.push(`/candidate/apply/${job.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
