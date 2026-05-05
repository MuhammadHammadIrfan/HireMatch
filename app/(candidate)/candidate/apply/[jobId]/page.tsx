import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ApplyConfirmationClient from './ApplyConfirmationClient';

export default async function ApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: job } = await supabase.from('jobs').select('*, recruiters(company_name)').eq('id', jobId).single();
  if (!job) return notFound();

  // Check existing application
  const { data: existing } = await supabase
    .from('applications').select('*').eq('candidate_id', user.id).eq('job_id', jobId).single();

  if (existing) {
    return <ApplyConfirmationClient job={job} application={existing} userId={user.id} />;
  }

  // Create new application
  const { data: newApp } = await supabase.from('applications').insert({
    candidate_id: user.id,
    job_id: jobId,
    status: 'submitted',
  }).select().single();

  // Compute match score in background
  if (newApp) {
    const { data: scores } = await supabase
      .rpc('match_jobs_for_candidate', { p_candidate_id: user.id, p_threshold: 0.0, p_limit: 200 });
    const sc = (scores ?? []).find((s: { job_id: string }) => s.job_id === jobId);
    const score = sc?.score_int ?? 0;

    const adminClient = createAdminClient();
    await adminClient.from('applications').update({ match_score: score }).eq('id', newApp.id);
    await adminClient.from('match_scores').upsert({
      application_id: newApp.id,
      score,
      score_raw: sc?.score_raw ?? 0,
    });

    // Trigger skill gap analysis in background
    fetch(`/api/match/${jobId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId: user.id, applicationId: newApp.id }),
    }).catch(() => {});

    return <ApplyConfirmationClient job={job} application={{ ...newApp, match_score: score }} userId={user.id} />;
  }

  redirect('/candidate/dashboard');
}
