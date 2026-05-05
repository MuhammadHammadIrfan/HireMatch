import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CandidateRankingClient from './CandidateRankingClient';

export default async function CandidateRankingPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createClient();
  const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single();
  if (!job) return notFound();

  const adminClient = createAdminClient();

  // Get all applications for this job with candidate details and match scores
  const { data: applications } = await adminClient
    .from('applications')
    .select('*, candidates(id, skills, headline, work_experience, education, profile_strength, resume_url, users(full_name, avatar_url, email)), match_scores(score, score_raw), skill_gaps(skill_name, importance)')
    .eq('job_id', jobId)
    .order('match_score', { ascending: false });

  return <CandidateRankingClient job={job} applications={applications ?? []} />;
}
