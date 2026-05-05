import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CandidateProfileViewClient from '@/app/(recruiter)/recruiter/candidates/[id]/CandidateProfileViewClient';

export default async function CandidateProfileViewPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ jobId?: string; appId?: string }>;
}) {
  const { id } = await params;
  const { jobId, appId } = await searchParams;
  const supabase = await createClient();

  const [{ data: candidate }, { data: user }, { data: application }, { data: skillGaps }] = await Promise.all([
    supabase.from('candidates').select('*').eq('id', id).single(),
    supabase.from('users').select('*').eq('id', id).single(),
    appId ? supabase.from('applications').select('*').eq('id', appId).single() : Promise.resolve({ data: null }),
    appId ? supabase.from('skill_gaps').select('*').eq('application_id', appId) : Promise.resolve({ data: [] }),
  ]);

  if (!candidate || !user) return notFound();

  return (
    <CandidateProfileViewClient
      candidate={candidate}
      user={user}
      application={application}
      skillGaps={skillGaps ?? []}
      jobId={jobId}
    />
  );
}
