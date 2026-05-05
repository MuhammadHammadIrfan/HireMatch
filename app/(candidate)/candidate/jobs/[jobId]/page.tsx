import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import JobDetailClient from './JobDetailClient';

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: job }, { data: candidate }] = await Promise.all([
    supabase.from('jobs').select('*, recruiters(company_name, logo_url)').eq('id', jobId).single(),
    user ? supabase.from('candidates').select('skills, resume_embedding').eq('id', user.id).single() : Promise.resolve({ data: null }),
  ]);

  if (!job) return notFound();

  // Compute match score if candidate has embedding
  let matchScore = 0;
  let matchedSkills: string[] = [];
  let skillGaps: Array<{ name: string; importance: string; suggestion: string }> = [];

  if (candidate?.resume_embedding) {
    const { data: scores } = await supabase
      .rpc('match_jobs_for_candidate', { p_candidate_id: user!.id, p_threshold: 0.0, p_limit: 200 });
    const sc = (scores ?? []).find((s: { job_id: string }) => s.job_id === jobId);
    matchScore = sc?.score_int ?? 0;

    const jobSkills = Array.isArray(job.skills) ? job.skills.map((s: { name: string }) => s.name) : [];
    const cSkills = candidate.skills ?? [];
    matchedSkills = jobSkills.filter((js: string) => cSkills.some((cs: string) => cs.toLowerCase() === js.toLowerCase()));
    skillGaps = jobSkills
      .filter((js: string) => !matchedSkills.includes(js))
      .map((name: string) => ({
        name,
        importance: job.skills.find((s: { name: string }) => s.name === name)?.importance ?? 'medium',
        suggestion: `Search for "${name}" on freeCodeCamp or official documentation.`,
      }));
  }

  return (
    <JobDetailClient
      job={{ ...job, match_score: matchScore, matched_skills: matchedSkills, missing_skills: skillGaps }}
      userId={user?.id ?? null}
    />
  );
}
