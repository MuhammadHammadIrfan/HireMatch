'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import HMToast from '@/components/ui/HMToast';
import { createClient } from '@/lib/supabase/client';
import { calcProfileStrength } from '@/lib/types';
import type { DBUser, DBCandidate } from '@/lib/types';

const SKILL_COLORS: Record<string, { bg: string; text: string }> = {
  // Languages
  'Python': { bg: 'rgba(59,130,246,0.12)', text: '#2563EB' },
  'Java': { bg: 'rgba(59,130,246,0.12)', text: '#2563EB' },
  'JavaScript': { bg: 'rgba(59,130,246,0.12)', text: '#2563EB' },
  'TypeScript': { bg: 'rgba(59,130,246,0.12)', text: '#2563EB' },
  'C/C++': { bg: 'rgba(59,130,246,0.12)', text: '#2563EB' },
  'Go': { bg: 'rgba(59,130,246,0.12)', text: '#2563EB' },
  'Rust': { bg: 'rgba(59,130,246,0.12)', text: '#2563EB' },
  // ML/AI
  'PyTorch': { bg: 'rgba(139,92,246,0.12)', text: '#7C3AED' },
  'TensorFlow': { bg: 'rgba(139,92,246,0.12)', text: '#7C3AED' },
  'PyTorch Lightning': { bg: 'rgba(139,92,246,0.12)', text: '#7C3AED' },
  'Scikit-learn': { bg: 'rgba(139,92,246,0.12)', text: '#7C3AED' },
  'MERN': { bg: 'rgba(139,92,246,0.12)', text: '#7C3AED' },
  // Data
  'Pandas': { bg: 'rgba(16,185,129,0.12)', text: '#059669' },
  'NumPy': { bg: 'rgba(16,185,129,0.12)', text: '#059669' },
  'SciPy': { bg: 'rgba(16,185,129,0.12)', text: '#059669' },
  'SQL': { bg: 'rgba(16,185,129,0.12)', text: '#059669' },
  // Default fallback handled below
};

function skillStyle(s: string) {
  return SKILL_COLORS[s] ?? { bg: '#F1F5F9', text: '#475569' };
}

function CompanyInitial({ name, size = 36 }: { name: string; size?: number }) {
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#F59E0B', '#F43F5E'];
  const color = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
  return (
    <div className="rounded-xl flex items-center justify-center text-white font-display font-black flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}>
      {(name ?? '?')[0].toUpperCase()}
    </div>
  );
}

export default function CandidateProfileClient({ profile, candidate }: { profile: DBUser | null; candidate: DBCandidate | null }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const headlineRef = useRef<HTMLInputElement>(null);

  const [skills, setSkills] = useState<string[]>(candidate?.skills ?? []);
  const [newSkill, setNewSkill] = useState('');
  const [headline, setHeadline] = useState(candidate?.headline ?? '');
  const [editingHeadline, setEditingHeadline] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [isDirty, setIsDirty] = useState(false);

  const name = profile?.full_name ?? 'User';
  const profileStrength = calcProfileStrength({
    hasResume: !!candidate?.resume_url,
    skillCount: skills.length,
    workExpCount: candidate?.work_experience?.length ?? 0,
    educationCount: candidate?.education?.length ?? 0,
    hasHeadline: !!headline,
  });

  // Animated ring
  const [ringFill, setRingFill] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setRingFill(profileStrength), 400);
    return () => clearTimeout(t);
  }, [profileStrength]);

  // Track dirty state
  useEffect(() => {
    const origSkills = JSON.stringify(candidate?.skills ?? []);
    const curSkills = JSON.stringify(skills);
    setIsDirty(curSkills !== origSkills || headline !== (candidate?.headline ?? ''));
  }, [skills, headline, candidate]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(s => [...s, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploadingPhoto(false); return; }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('userId', user.id);
    const res = await fetch('/api/avatar/upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) { setToast('Failed to upload photo'); setUploadingPhoto(false); return; }
    setAvatarUrl(json.publicUrl + '?t=' + Date.now());
    setToast('Photo updated');
    setUploadingPhoto(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('candidates').update({ skills, headline, profile_strength: profileStrength }).eq('id', user.id);
    }
    setSaving(false);
    setIsDirty(false);
    setToast('Changes saved successfully');
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const workExp = Array.isArray(candidate?.work_experience) ? candidate.work_experience : [];
  const education = Array.isArray(candidate?.education) ? candidate.education : [];
  const circumference = 2 * Math.PI * 34;

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC', display:'flex', flexDirection:'column', width:'100%', maxWidth:'100%', overflowX:'hidden' }}>
      {toast && <HMToast message={toast} onClose={() => setToast(null)} />}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
      <style>{`
        @keyframes shimmerBg { 0% { background-position:0% 50%; } 100% { background-position:-200% 50%; } }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Shimmer bar */}
      <div style={{ height:3, width:'100%', background:'linear-gradient(90deg,#3B82F6,#8B5CF6,#06B6D4,#10B981,#3B82F6)', backgroundSize:'200% 100%', animation:'shimmerBg 4s linear infinite' }} />

      {/* Dark hero header */}
      <div style={{ background:'linear-gradient(160deg,#080E1C 0%,#0F172A 50%,#111827 100%)', position:'relative', overflow:'hidden', width:'100%', boxSizing:'border-box', padding:'clamp(24px,5vw,48px) clamp(16px,4vw,48px) 120px' }}>
        <div style={{ position:'absolute', top:'-20%', right:'-5%', width:600, height:600, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle at 60% 40%,rgba(59,130,246,0.15),transparent 65%)' }} />
        <div style={{ position:'absolute', bottom:'-10%', left:'-5%', width:400, height:400, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle at 40% 60%,rgba(139,92,246,0.10),transparent 70%)' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:80, background:'linear-gradient(to bottom,transparent,#F8FAFC)', pointerEvents:'none' }} />

        <div style={{ position:'relative', width:'100%' }}>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', gap:24, animation:'fadeSlideUp 0.45s ease both' }}>
            {/* Avatar with upload */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <Avatar name={name} size={96} src={avatarUrl} />
              <button onClick={() => fileRef.current?.click()} disabled={uploadingPhoto} style={{ position:'absolute', bottom:-4, right:-4, width:30, height:30, borderRadius:'50%', border:'3px solid transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', background:'linear-gradient(135deg,#3B82F6,#06B6D4)', transition:'transform 0.15s ease' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform='scale(1.12)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform='scale(1)'}>
                {uploadingPhoto ? <svg className="animate-spin" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg> : <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>}
              </button>
            </div>

            <div style={{ flex:'1 1 240px', minWidth:0 }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:900, color:'white', fontSize:'clamp(28px,4vw,48px)', lineHeight:1.02, marginBottom:8, letterSpacing:'-0.03em', whiteSpace:'normal', overflowWrap:'anywhere' }}>{name}</div>
              <div style={{ fontSize:15, color:'rgba(148,163,184,0.85)', fontFamily:'var(--font-dm)', marginBottom:10, whiteSpace:'normal', overflowWrap:'anywhere' }}>{profile?.email}</div>
              {editingHeadline ? (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <input ref={headlineRef} value={headline} onChange={e => setHeadline(e.target.value)} onBlur={() => setEditingHeadline(false)} onKeyDown={e => e.key==='Enter' && setEditingHeadline(false)} autoFocus style={{ flex:1, fontSize:14, borderBottom:'2px solid #3B82F6', background:'transparent', outline:'none', color:'white', padding:'4px 0', fontFamily:'var(--font-dm)' }} placeholder="Your professional headline…" />
                </div>
              ) : (
                <button onClick={() => setEditingHeadline(true)} style={{ fontSize:14, color:'rgba(148,163,184,0.75)', background:'transparent', border:'none', cursor:'pointer', display:'inline-flex', alignItems:'flex-start', gap:6, padding:0, fontFamily:'var(--font-dm)', transition:'color 0.15s ease', textAlign:'left', flexWrap:'wrap' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='#3B82F6'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='rgba(148,163,184,0.75)'}>
                  <span style={{ whiteSpace:'normal', overflowWrap:'anywhere' }}>{headline || 'Add a headline…'}</span>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              )}
            </div>

            {/* Completion ring */}
            <div style={{ flexShrink:0, textAlign:'center' }} className="hidden sm:block">
              <svg width={100} height={100} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="7" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={profileStrength>=80?'#10B981':profileStrength>=50?'#F59E0B':'#3B82F6'} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${2*Math.PI*42}`} strokeDashoffset={`${2*Math.PI*42*(1-ringFill/100)}`} transform="rotate(-90 50 50)" style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
                <text x="50" y="47" textAnchor="middle" fontSize="16" fontWeight="900" fill="white" fontFamily="Plus Jakarta Sans,sans-serif">{profileStrength}%</text>
                <text x="50" y="63" textAnchor="middle" fontSize="10" fill="rgba(148,163,184,0.8)" fontFamily="DM Sans,sans-serif">complete</text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div style={{ flex:1, padding:'0 clamp(16px,4vw,48px) 60px', margin:'-32px auto 0', width:'100%', maxWidth:'100%', boxSizing:'border-box' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:24 }} className="lg:grid-cols-5">

          {/* LEFT COLUMN */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }} className="lg:col-span-2">
            {/* Resume */}
            <div style={{ background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', animation:'fadeSlideUp 0.5s ease both', animationDelay:'80ms' }}>
              <div style={{ height:3, background:'linear-gradient(90deg,#3B82F6,#06B6D4)' }} />
              <div style={{ padding:'clamp(16px,4vw,28px) clamp(16px,4vw,28px)' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, color:'#0F172A', marginBottom:20 }}>My Resume</div>
              {candidate?.resume_url ? (
                <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', gap:16, background:'#F8FAFC', borderRadius:16, padding:'16px 20px' }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:'rgba(59,130,246,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>📄</div>
                  <div style={{ flex:'1 1 180px', minWidth:0 }}>
                    <div style={{ fontSize:16, fontWeight:700, color:'#0F172A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{candidate.resume_filename}</div>
                    <div style={{ fontSize:13, color:'#64748B', marginTop:4, fontFamily:'var(--font-dm)' }}>
                      Uploaded {candidate.resume_uploaded_at ? new Date(candidate.resume_uploaded_at).toLocaleDateString() : ''}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'#06B6D4' }} />
                      <span style={{ fontSize:12, fontWeight:600, color:'#06B6D4' }}>AI-parsed by Gemini</span>
                    </div>
                  </div>
                  <button onClick={() => router.push('/candidate/resume/upload')} style={{ background:'transparent', border:'1.5px solid #3B82F6', color:'#3B82F6', padding:'10px 18px', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', flexShrink:0, transition:'background 0.15s ease', marginLeft:'auto' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(59,130,246,0.06)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}>
                    Replace
                  </button>
                </div>
              ) : (
                <div style={{ border:'2px dashed #E2E8F0', borderRadius:16, padding:'32px 24px', textAlign:'center', cursor:'pointer', transition:'border-color 0.15s ease' }} onClick={() => router.push('/candidate/resume/upload')} onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor='#3B82F6'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor='#E2E8F0'}>
                  <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ margin:'0 auto 12px', display:'block' }}>
                    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                  <div style={{ fontSize:16, fontWeight:700, color:'#0F172A', marginBottom:6 }}>Upload your resume</div>
                  <div style={{ fontSize:14, color:'#64748B', marginBottom:20, fontFamily:'var(--font-dm)' }}>PDF or DOCX, max 5MB</div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px', borderRadius:12, background:'linear-gradient(135deg,#3B82F6,#06B6D4)', color:'white', fontSize:14, fontWeight:700 }}>Browse Files</div>
                </div>
              )}
              </div>
            </div>

            {/* Work Experience */}
            <div style={{ background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', animation:'fadeSlideUp 0.5s ease both', animationDelay:'140ms' }}>
              <div style={{ height:3, background:'linear-gradient(90deg,#8B5CF6,#3B82F6)' }} />
              <div style={{ padding:'clamp(16px,4vw,28px) clamp(16px,4vw,28px)' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, color:'#0F172A', marginBottom:20 }}>Work Experience</div>
              {workExp.length === 0 ? (
                <div style={{ textAlign:'center', padding:'24px 0' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>🏢</div>
                  <div style={{ fontSize:15, color:'#64748B', fontFamily:'var(--font-dm)' }}>No experience added yet</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                  {workExp.map((w, i) => (
                    <div key={i} style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', gap:16, paddingBottom: i < workExp.length-1 ? 24 : 0, borderBottom: i < workExp.length-1 ? '1px solid #F1F5F9' : 'none' }}>
                      <CompanyInitial name={w.company} size={44} />
                      <div style={{ flex:'1 1 180px', minWidth:0 }}>
                        <div style={{ fontSize:17, fontWeight:800, color:'#0F172A', fontFamily:'var(--font-display)', marginBottom:4 }}>{w.title}</div>
                        <div style={{ fontSize:15, color:'#475569', fontFamily:'var(--font-dm)', marginBottom:4 }}>{w.company}</div>
                        <div style={{ fontSize:13, color:'#94A3B8', fontFamily:'var(--font-dm)', marginBottom: w.description ? 10 : 0 }}>{w.start_date} – {w.end_date ?? 'Present'}</div>
                        {w.description && (
                          <div style={{ fontSize:14, color:'#64748B', fontFamily:'var(--font-dm)', lineHeight:1.65, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{w.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>

            {/* Education */}
            {education.length > 0 && (
              <div style={{ background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', animation:'fadeSlideUp 0.5s ease both', animationDelay:'200ms' }}>
                <div style={{ height:3, background:'linear-gradient(90deg,#10B981,#06B6D4)' }} />
                <div style={{ padding:'clamp(16px,4vw,28px) clamp(16px,4vw,28px)' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, color:'#0F172A', marginBottom:20 }}>Education</div>
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  {education.map((e, i) => (
                    <div key={i} style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', gap:16, paddingBottom: i < education.length-1 ? 20 : 0, borderBottom: i < education.length-1 ? '1px solid #F1F5F9' : 'none' }}>
                      <div style={{ width:48, height:48, borderRadius:14, background:'rgba(139,92,246,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>🎓</div>
                      <div style={{ flex:'1 1 180px', minWidth:0 }}>
                        <div style={{ fontSize:17, fontWeight:800, color:'#0F172A', fontFamily:'var(--font-display)', marginBottom:4 }}>{e.degree}{e.field ? `, ${e.field}` : ''}</div>
                        <div style={{ fontSize:15, color:'#475569', fontFamily:'var(--font-dm)', marginBottom:4 }}>{e.school}</div>
                        {e.year && <div style={{ fontSize:13, color:'#94A3B8', fontFamily:'var(--font-dm)' }}>Class of {e.year}</div>}
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN — Skills */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }} className="lg:col-span-3">
            <div style={{ background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', animation:'fadeSlideUp 0.5s ease both', animationDelay:'100ms' }}>
              <div style={{ height:3, background:'linear-gradient(90deg,#3B82F6,#8B5CF6)' }} />
              <div style={{ padding:'clamp(16px,4vw,28px) clamp(16px,4vw,28px)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, color:'#0F172A' }}>Skills</div>
                  <span style={{ fontSize:13, fontWeight:800, padding:'5px 14px', borderRadius:999, background:'rgba(59,130,246,0.08)', color:'#3B82F6' }}>{skills.length}</span>
                </div>

              <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                {skills.map(s => {
                  const style = skillStyle(s);
                  return (
                    <div key={s} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 hover:scale-105"
                      style={{ background: style.bg, color: style.text }}>
                      {s}
                      <button onClick={() => setSkills(sk => sk.filter(x => x !== s))}
                        className="bg-transparent border-none cursor-pointer text-current opacity-60 hover:opacity-100 ml-0.5 leading-none p-0 text-base transition-opacity">
                        ×
                      </button>
                    </div>
                  );
                })}
                {skills.length === 0 && (
                  <div className="text-[13px] text-hm-textS italic">No skills added yet</div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill… (press Enter)"
                  className="flex-1 min-w-[180px] h-10 border border-hm-border rounded-xl px-3 text-[13px] outline-none focus:border-hm-blue focus:ring-2 focus:ring-hm-blueBg transition-all"
                  style={{ fontFamily: 'var(--font-dm)' }} />
                <button onClick={addSkill}
                  className="h-10 px-4 rounded-xl text-white border-none font-semibold text-[13px] cursor-pointer hover:-translate-y-0.5 transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
                  + Add
                </button>
              </div>

              {/* Color legend */}
              <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-hm-border">
                {[
                  { label: 'Languages', bg: 'rgba(59,130,246,0.12)', text: '#2563EB' },
                  { label: 'ML/AI', bg: 'rgba(139,92,246,0.12)', text: '#7C3AED' },
                  { label: 'Data', bg: 'rgba(16,185,129,0.12)', text: '#059669' },
                  { label: 'Other', bg: '#F1F5F9', text: '#475569' },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.text }} />
                    <span className="text-[11px] text-hm-textS">{c.label}</span>
                  </div>
                ))}
              </div> {/* end color legend */}
              </div> {/* end padding */}
            </div> {/* end skills card */}

            {/* Sign out */}
            <div style={{ background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', animation:'fadeSlideUp 0.5s ease both', animationDelay:'160ms' }}>
              <div style={{ height:3, background:'linear-gradient(90deg,#F43F5E,#F97316)' }} />
              <div style={{ padding:'24px clamp(16px,4vw,28px)' }}>
                <button onClick={handleLogout} style={{ width:'100%', display:'flex', flexWrap:'wrap', alignItems:'center', gap:16, padding:'16px 20px', borderRadius:16, border:'1.5px solid rgba(244,63,94,0.15)', background:'transparent', cursor:'pointer', transition:'all 0.15s ease' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(244,63,94,0.05)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='transparent'; }}>
                  <div style={{ width:44, height:44, borderRadius:12, flexShrink:0, background:'rgba(244,63,94,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  </div>
                  <div style={{ textAlign:'left', flex:'1 1 180px', minWidth:0 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:800, color:'#F43F5E' }}>Sign Out</div>
                    <div style={{ fontSize:12, color:'#94A3B8', fontFamily:'var(--font-dm)', marginTop:2 }}>You can sign back in anytime</div>
                  </div>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>

            {/* Profile completeness tips */}
            {profileStrength < 100 && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <div className="text-[13px] font-bold text-hm-blue">Improve your profile</div>
                </div>
                <div className="space-y-2">
                  {!candidate?.resume_url && (
                    <div className="text-[12px] text-hm-textS flex items-center gap-2">
                      <span className="text-hm-rose font-bold">+40pts</span> Upload your resume for AI-powered matching
                    </div>
                  )}
                  {(candidate?.skills?.length ?? 0) < 3 && (
                    <div className="text-[12px] text-hm-textS flex items-center gap-2">
                      <span className="text-hm-amber font-bold">+20pts</span> Add at least 3 skills
                    </div>
                  )}
                  {!candidate?.headline && (
                    <div className="text-[12px] text-hm-textS flex items-center gap-2">
                      <span className="text-hm-blue font-bold">+5pts</span> Write a professional headline
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div style={{ position:'sticky', bottom:0, padding:'16px clamp(16px,4vw,48px)', borderTop:'1px solid #E2E8F0', background:'rgba(255,255,255,0.95)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div className="text-[13px] text-hm-textS" style={{ fontFamily: 'var(--font-dm)' }}>
            {isDirty ? '● Unsaved changes' : 'All changes saved'}
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="px-6 py-2.5 rounded-xl text-white text-[13px] font-bold border-none cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{ background: isDirty ? 'linear-gradient(135deg, #3B82F6, #06B6D4)' : '#94A3B8' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
