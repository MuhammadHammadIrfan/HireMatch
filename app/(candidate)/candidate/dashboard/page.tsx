import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CandidateDashboardClient from './CandidateDashboardClient';

export default async function CandidateDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [
    { data: profile },
    { data: candidate },
    { data: applications },
    { data: notifications },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('candidates').select('*').eq('id', user.id).single(),
    supabase.from('applications')
      .select('id, status, match_score, submitted_at, job_id, jobs(title, location, employment_type, recruiters(company_name))')
      .eq('candidate_id', user.id)
      .order('submitted_at', { ascending: false }),
    supabase.from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  // Fetch matched jobs via RPC
  const { data: scores } = await supabase.rpc('match_jobs_for_candidate', {
    p_candidate_id: user.id, p_threshold: 0.3, p_limit: 6,
  });

  let matchedJobs: any[] = [];
  if (scores && scores.length > 0) {
    const jobIds = scores.map((s: { job_id: string }) => s.job_id);
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*, recruiters(company_name, logo_url)')
      .in('id', jobIds)
      .eq('status', 'active');
    matchedJobs = (jobs ?? [])
      .map(j => ({
        ...j,
        match_score: scores.find((s: { job_id: string; score_int: number }) => s.job_id === j.id)?.score_int ?? 0,
      }))
      .sort((a, b) => b.match_score - a.match_score);
  }

  const apps = applications ?? [];
  const stats = {
    total: apps.length,
    underReview: apps.filter(a => a.status === 'under_review').length,
    shortlisted: apps.filter(a => a.status === 'shortlisted').length,
    avgScore: apps.length > 0
      ? Math.round(apps.reduce((s, a) => s + (a.match_score ?? 0), 0) / apps.length)
      : 0,
  };

  return (
    <CandidateDashboardClient
      profile={profile}
      candidate={candidate}
      matchedJobs={matchedJobs}
      stats={stats}
      notifications={notifications ?? []}
    />
  );
}
