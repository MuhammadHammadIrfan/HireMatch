import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CandidateDashboardClient from './CandidateDashboardClient';

export default async function CandidateDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: candidate }, { data: matchedJobs }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('candidates').select('*').eq('id', user.id).single(),
    supabase.rpc('match_jobs_for_candidate', { p_candidate_id: user.id, p_threshold: 0.3, p_limit: 5 })
      .then(async ({ data: scores }) => {
        if (!scores || scores.length === 0) return { data: [] };
        const jobIds = scores.map((s: { job_id: string }) => s.job_id);
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*, recruiters(company_name, logo_url)')
          .in('id', jobIds)
          .eq('status', 'active');
        const jobsWithScores = (jobs ?? []).map(j => ({
          ...j,
          match_score: scores.find((s: { job_id: string; score_int: number }) => s.job_id === j.id)?.score_int ?? 0,
        }));
        return { data: jobsWithScores.sort((a, b) => b.match_score - a.match_score) };
      }),
  ]);

  return (
    <CandidateDashboardClient
      profile={profile}
      candidate={candidate}
      matchedJobs={matchedJobs ?? []}
    />
  );
}
