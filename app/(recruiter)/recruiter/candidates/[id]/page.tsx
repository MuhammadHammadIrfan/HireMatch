import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CandidateProfileViewClient from '@/app/(recruiter)/recruiter/candidates/[id]/CandidateProfileViewClient';

function getResumeStoragePath(resumeUrl: string | null): string | null {
  if (!resumeUrl) return null;

  try {
    const parsed = new URL(resumeUrl);
    const marker = '/storage/v1/object/public/resumes/';
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex >= 0) {
      return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
    }
  } catch {
    // Fall through and treat the value as a raw storage path.
  }

  const cleaned = resumeUrl.replace(/^\/+/, '');
  return cleaned.startsWith('resumes/') ? cleaned.slice('resumes/'.length) : cleaned;
}

export default async function CandidateProfileViewPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ jobId?: string; appId?: string }>;
}) {
  const { id } = await params;
  const { jobId, appId } = await searchParams;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const [{ data: candidate }, { data: user }, { data: application }, { data: skillGaps }] = await Promise.all([
    supabase.from('candidates').select('*').eq('id', id).single(),
    adminClient.from('users').select('*').eq('id', id).single(),
    appId ? supabase.from('applications').select('*').eq('id', appId).single() : Promise.resolve({ data: null }),
    appId ? supabase.from('skill_gaps').select('*').eq('application_id', appId) : Promise.resolve({ data: [] }),
  ]);

  if (!candidate || !user) return notFound();

  let resumeViewUrl: string | null = candidate.resume_url ?? null;
  const resumePath = getResumeStoragePath(candidate.resume_url);

  if (resumePath) {
    const { data } = await adminClient.storage.from('resumes').createSignedUrl(resumePath, 60 * 10);
    if (data?.signedUrl) {
      resumeViewUrl = data.signedUrl;
    }
  }

  return (
    <CandidateProfileViewClient
      candidate={candidate}
      user={user}
      application={application}
      skillGaps={skillGaps ?? []}
      jobId={jobId}
      resumeViewUrl={resumeViewUrl}
    />
  );
}
