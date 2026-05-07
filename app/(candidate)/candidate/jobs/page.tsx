'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HMJobCard from '@/components/ui/HMJobCard';
import HMButton from '@/components/ui/HMButton';
import { createClient } from '@/lib/supabase/client';
import type { JobWithRecruiter } from '@/lib/types';

const TYPE_FILTERS = ['All', 'Remote', 'Full-time', 'Part-time', 'Internship', 'Contract'];
const EXP_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead'];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-card">
      <div className="flex gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-slate-100 rounded-lg mb-2 w-3/4 animate-pulse" />
          <div className="h-3 bg-slate-100 rounded-lg w-1/2 animate-pulse" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
      </div>
      <div className="h-3 bg-slate-100 rounded-lg mb-2 w-full animate-pulse" />
      <div className="h-3 bg-slate-100 rounded-lg mb-4 w-2/3 animate-pulse" />
      <div className="h-10 bg-slate-100 rounded-xl w-full animate-pulse" />
    </div>
  );
}

export default function JobSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [expFilter, setExpFilter] = useState<string[]>([]);
  const [jobs, setJobs] = useState<JobWithRecruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      let q = supabase.from('jobs')
        .select('*, recruiters(company_name, logo_url)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (query) q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      if (filter === 'Remote') q = q.eq('is_remote', true);
      else if (filter !== 'All') q = q.eq('employment_type', filter);
      if (expFilter.length > 0) q = q.in('experience_level', expFilter);

      const { data } = await q;

      if (user && data) {
        const { data: scores } = await supabase
          .rpc('match_jobs_for_candidate', { p_candidate_id: user.id, p_threshold: 0.1, p_limit: 100 });
        const scoreMap = new Map(
          (scores ?? []).map((s: { job_id: string; score_int: number }) => [s.job_id, s.score_int])
        );
        const withScores = data.map(j => ({ ...j, match_score: scoreMap.get(j.id) ?? 0 }))
          .sort((a, b) => b.match_score - a.match_score);
        setJobs(withScores);
      } else {
        setJobs((data ?? []).map(j => ({ ...j, match_score: 0 })));
      }
      setLoading(false);
    };
    fetchJobs();
  }, [query, filter, expFilter]);

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC' }}>
      <style>{`
        @keyframes shimmerBg { 0% { background-position:0% 50%; } 100% { background-position:-200% 50%; } }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Shimmer bar */}
      <div style={{ height:3, width:'100%', background:'linear-gradient(90deg,#3B82F6,#8B5CF6,#06B6D4,#10B981,#3B82F6)', backgroundSize:'200% 100%', animation:'shimmerBg 4s linear infinite' }} />

      {/* Dark hero header + sticky search */}
      <div style={{ background:'linear-gradient(160deg,#080E1C 0%,#0F172A 50%,#111827 100%)', position:'relative', overflow:'hidden' }}>
        {/* Orbs */}
        <div style={{ position:'absolute', top:'-30%', right:'-5%', width:540, height:540, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle at 60% 40%,rgba(59,130,246,0.13),transparent 65%)' }} />
        <div style={{ position:'absolute', bottom:'-20%', left:'-5%', width:400, height:400, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle at 40% 60%,rgba(6,182,212,0.09),transparent 70%)' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:50, background:'linear-gradient(to bottom,transparent,#F8FAFC)', pointerEvents:'none' }} />

        {/* Title */}
        <div style={{ position:'relative', padding:'48px 48px 32px', width:'100%', animation:'fadeSlideUp 0.4s ease both' }}>
          <div style={{ fontSize:15, fontWeight:500, color:'rgba(148,163,184,0.85)', fontFamily:'var(--font-dm)', marginBottom:8 }}>AI-ranked opportunities</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'clamp(32px,5vw,56px)', color:'white', letterSpacing:'-0.03em', lineHeight:1.02, marginBottom:0 }}>Find Jobs</h1>
        </div>

        {/* Sticky search bar */}
        <div style={{ position:'sticky', top:0, zIndex:20, background:'rgba(8,14,28,0.92)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'14px 48px' }}>
          <div style={{ width:'100%' }}>
            <div style={{ display:'flex', alignItems:'center', background:'rgba(255,255,255,0.06)', borderRadius:14, padding:'0 16px', gap:12, border:'1px solid rgba(255,255,255,0.10)', marginBottom:12, height:50, transition:'border-color 0.15s ease' }} onFocus={e => (e.currentTarget.style.borderColor='rgba(59,130,246,0.5)')} onBlur={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.10)')}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.7)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search jobs, companies, skills…" style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:15, color:'white', fontFamily:'var(--font-dm)' }} />
              {query && <button onClick={() => setQuery('')} style={{ background:'transparent', border:'none', cursor:'pointer', color:'rgba(148,163,184,0.7)', display:'flex', alignItems:'center', justifyContent:'center', width:20, height:20, borderRadius:'50%' }}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
            </div>
            <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
              {TYPE_FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding:'7px 16px', borderRadius:999, border:'none', whiteSpace:'nowrap', fontSize:13, cursor:'pointer', flexShrink:0, fontWeight:700, fontFamily:'var(--font-dm)', transition:'all 0.15s ease', background: filter===f ? 'linear-gradient(135deg,#3B82F6,#06B6D4)' : 'rgba(255,255,255,0.07)', color: filter===f ? 'white' : 'rgba(148,163,184,0.85)' }}>{f}</button>
              ))}
              <button onClick={() => setShowFilters(!showFilters)} style={{ padding:'7px 16px', borderRadius:999, border:'none', fontSize:13, cursor:'pointer', flexShrink:0, fontWeight:700, fontFamily:'var(--font-dm)', display:'flex', alignItems:'center', gap:6, background: showFilters ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)', color:'rgba(148,163,184,0.85)' }} className="md:hidden">
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:'24px 48px 60px', display:'flex', gap:28, width:'100%' }}>
        {/* Desktop filter sidebar */}
        <aside style={{ width:240, flexShrink:0 }} className="hidden md:block">
          <div style={{ background:'white', borderRadius:18, padding:'24px', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', position:'sticky', top:120 }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:900, color:'#0F172A', marginBottom:16 }}>Filters</div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'#94A3B8', marginBottom:12, fontFamily:'var(--font-dm)' }}>Experience Level</div>
              {EXP_LEVELS.map(lvl => (
                <label key={lvl} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', cursor:'pointer' }}>
                  <input type="checkbox" checked={expFilter.includes(lvl)} onChange={e => setExpFilter(f => e.target.checked ? [...f,lvl] : f.filter(x=>x!==lvl))} style={{ width:16, height:16, borderRadius:4, accentColor:'#3B82F6', cursor:'pointer' }} />
                  <span style={{ fontSize:14, color:'#0F172A', fontFamily:'var(--font-dm)', fontWeight:500 }}>{lvl}</span>
                </label>
              ))}
            </div>
            {(expFilter.length>0||filter!=='All') && (
              <button onClick={() => { setFilter('All'); setExpFilter([]); }} style={{ width:'100%', padding:'10px 0', borderRadius:10, border:'1.5px solid #E2E8F0', fontSize:13, fontWeight:700, color:'#64748B', cursor:'pointer', background:'transparent', fontFamily:'var(--font-dm)' }}>Clear All Filters</button>
            )}
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="md:hidden bg-white rounded-2xl p-4 shadow-card mb-3 border border-hm-border w-full">
            <div className="font-display text-[13px] font-black text-hm-textP mb-3">Experience Level</div>
            <div className="flex flex-wrap gap-2">
              {EXP_LEVELS.map(lvl => (
                <button key={lvl}
                  onClick={() => setExpFilter(f => f.includes(lvl) ? f.filter(x => x !== lvl) : [...f, lvl])}
                  className="px-3 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer transition-all border"
                  style={{
                    background: expFilter.includes(lvl) ? 'rgba(59,130,246,0.1)' : 'white',
                    color: expFilter.includes(lvl) ? '#3B82F6' : '#64748B',
                    border: `1.5px solid ${expFilter.includes(lvl) ? '#3B82F6' : '#E2E8F0'}`,
                  }}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontSize:14, color:'#64748B', fontFamily:'var(--font-dm)' }}>{loading ? 'Searching…' : `${jobs.length} jobs found`}</div>
            <div style={{ fontSize:13, color:'#3B82F6', fontWeight:700, fontFamily:'var(--font-dm)' }}>Best Match ↓</div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              <div className="font-display text-[16px] font-bold text-hm-textP mb-2">No jobs found</div>
              <div className="text-[13px] text-hm-textS mb-5" style={{ fontFamily: 'var(--font-dm)' }}>
                Try different keywords or clear your filters
              </div>
              <HMButton onClick={() => { setQuery(''); setFilter('All'); setExpFilter([]); }} fullWidth={false} className="px-6">
                Clear Filters
              </HMButton>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(1,1fr)', gap:20 }} className="md:grid-cols-2 xl:grid-cols-3">
              {jobs.map(job => (
                <HMJobCard key={job.id} job={job}
                  onPress={() => router.push(`/candidate/jobs/${job.id}`)}
                  onApply={() => router.push(`/candidate/apply/${job.id}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
