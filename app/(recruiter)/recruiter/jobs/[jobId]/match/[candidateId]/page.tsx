import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import BackHeader from '@/components/layout/BackHeader';
import SkillGapContent from '@/components/features/SkillGapContent';

export default async function MatchExplanationPage({ params }: { params: Promise<{ jobId: string; candidateId: string }> }) {
  const { jobId, candidateId } = await params;
  const supabase = await createClient();
  const [{ data: job }, { data: candidate }, { data: user }] = await Promise.all([
    supabase.from('jobs').select('title, skills').eq('id', jobId).single(),
    supabase.from('candidates').select('skills').eq('id', candidateId).single(),
    supabase.from('users').select('full_name').eq('id', candidateId).single(),
  ]);
  if (!job || !candidate) return notFound();

  const { data: app } = await supabase.from('applications').select('id, match_score').eq('job_id', jobId).eq('candidate_id', candidateId).single();
  const { data: gaps } = app ? await supabase.from('skill_gaps').select('*').eq('application_id', app.id) : { data: [] };

  const jobSkills = Array.isArray(job.skills) ? job.skills.map((s: { name: string }) => s.name) : [];
  const matched = jobSkills.filter((s: string) => candidate.skills?.includes(s));

  return (
    <div className="min-h-screen bg-hm-surface">
      <BackHeader title={`Match: ${user?.full_name ?? 'Candidate'}`} />
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 mb-4 border border-hm-border">
          <div className="text-[13px] text-hm-textS mb-0.5">Role</div>
          <div className="text-[15px] font-bold text-hm-textP">{job.title}</div>
        </div>
        <SkillGapContent
          matchScore={app?.match_score ?? 0}
          matchedSkills={matched}
          missingSkills={(gaps ?? []).map((g: any) => ({
            name: g.skill_name, importance: g.importance, suggestion: g.suggestion ?? '',
          }))}
        />
      </div>
    </div>
  );
}
