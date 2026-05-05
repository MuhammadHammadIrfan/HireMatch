import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import BackHeader from '@/components/layout/BackHeader';
import SkillGapContent from '@/components/features/SkillGapContent';

export default async function SkillGapPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: job } = await supabase.from('jobs').select('title, skills').eq('id', jobId).single();
  if (!job) return notFound();

  const { data: candidate } = await supabase.from('candidates').select('skills').eq('id', user.id).single();
  const { data: app } = await supabase.from('applications').select('id, match_score').eq('job_id', jobId).eq('candidate_id', user.id).maybeSingle();
  const { data: gaps } = app ? await supabase.from('skill_gaps').select('*').eq('application_id', app.id) : { data: [] };

  const jobSkills = Array.isArray(job.skills) ? job.skills.map((s: any) => s.name) : [];
  const matched = jobSkills.filter((s: string) => candidate?.skills?.includes(s));

  return (
    <div className="min-h-screen bg-hm-surface">
      <BackHeader title="Skill Gap Analysis" />
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 mb-4 border border-hm-border">
          <div className="text-[13px] text-hm-textS mb-0.5">Analysing for</div>
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
