'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HMJobCard from '@/components/ui/HMJobCard';
import HMButton from '@/components/ui/HMButton';
import { createClient } from '@/lib/supabase/client';
import type { JobWithRecruiter } from '@/lib/types';

const FILTERS = ['All', 'Remote', 'Full-time', 'Part-time', 'Internship', 'Entry Level'];

export default function JobSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [jobs, setJobs] = useState<JobWithRecruiter[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [query, filter]);

  return (
    <div className="min-h-screen bg-hm-surface">
      <div className="bg-white pt-14 px-4 pb-4 border-b border-hm-border">
        <h1 className="text-xl font-black text-hm-textP mb-3.5">Find Jobs</h1>
        <div className="flex items-center bg-hm-surface rounded-xl px-3.5 py-2.5 gap-2.5 border-[1.5px] border-hm-border">
          <span className="text-hm-textS">🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search jobs, companies, skills…"
            className="flex-1 border-none outline-none bg-transparent font-sans text-sm text-hm-textP placeholder:text-hm-textS/60" />
          {query && <button onClick={() => setQuery('')} className="bg-transparent border-none text-hm-textS cursor-pointer text-lg">×</button>}
        </div>
        <div className="flex gap-2 overflow-x-auto mt-3 pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3.5 py-1.5 rounded-full border-none whitespace-nowrap text-[13px] cursor-pointer font-sans flex-shrink-0 transition-all duration-150"
              style={{
                background: filter === f ? '#1565C0' : '#F5F7FA',
                color: filter === f ? 'white' : '#5A6A7A',
                fontWeight: filter === f ? 700 : 500,
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex justify-between items-center mb-3.5">
          <div className="text-[13px] text-hm-textS">{loading ? 'Loading…' : `${jobs.length} jobs found`}</div>
          <div className="text-xs text-hm-primary font-semibold">Sorted by: Best Match ▾</div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-hm-textS">Finding your matches…</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔎</div>
            <div className="text-[16px] font-bold text-hm-textP mb-2">No jobs found</div>
            <div className="text-[13px] text-hm-textS mb-5">No jobs found for your search</div>
            <HMButton onClick={() => { setQuery(''); setFilter('All'); }} fullWidth={false} className="px-6">Clear Filters</HMButton>
          </div>
        ) : (
          jobs.map(job => (
            <HMJobCard key={job.id} job={job}
              onPress={() => router.push(`/candidate/jobs/${job.id}`)}
              onApply={() => router.push(`/candidate/apply/${job.id}`)} />
          ))
        )}
      </div>
    </div>
  );
}
