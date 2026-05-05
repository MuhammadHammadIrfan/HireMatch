import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { computeSkillGap } from '@/lib/matching';
import { generateSkillSuggestions } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const { candidateId, applicationId } = await request.json() as {
      candidateId: string;
      applicationId: string;
    };

    const supabase = createAdminClient();

    // Get candidate and job
    const [{ data: candidate }, { data: job }] = await Promise.all([
      supabase.from('candidates').select('skills').eq('id', candidateId).single(),
      supabase.from('jobs').select('skills').eq('id', jobId).single(),
    ]);

    if (!candidate || !job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Compute skill gap
    const jobSkills = Array.isArray(job.skills) ? job.skills : [];
    const missingSkillNames = jobSkills
      .filter((js: { name: string }) => !candidate.skills.some((cs: string) =>
        cs.toLowerCase() === js.name.toLowerCase()))
      .map((js: { name: string }) => js.name);

    // Generate suggestions for missing skills
    const suggestions = await generateSkillSuggestions(missingSkillNames);
    const { missingSkills } = computeSkillGap(candidate.skills, jobSkills, suggestions);

    // Store skill gaps
    if (missingSkills.length > 0) {
      await supabase.from('skill_gaps').delete().eq('application_id', applicationId);
      await supabase.from('skill_gaps').insert(
        missingSkills.map(sk => ({
          application_id: applicationId,
          skill_name: sk.name,
          importance: sk.importance,
          suggestion: sk.suggestion,
        }))
      );
    }

    return NextResponse.json({ success: true, missingSkills });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
