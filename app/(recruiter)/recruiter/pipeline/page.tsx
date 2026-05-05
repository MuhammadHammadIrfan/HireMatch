import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PipelineClient from '@/app/(recruiter)/recruiter/pipeline/PipelineClient';

const STATUSES = ['submitted', 'under_review', 'shortlisted', 'rejected'] as const;

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: applications } = await supabase
    .from('applications')
    .select('*, jobs!inner(title, recruiter_id), users!candidates(full_name), candidates(skills, headline, profile_strength)')
    .eq('jobs.recruiter_id', user.id)
    .order('submitted_at', { ascending: false });

  const columns = STATUSES.reduce((acc, s) => {
    acc[s] = (applications ?? []).filter(a => a.status === s);
    return acc;
  }, {} as Record<string, any[]>);

  return <PipelineClient columns={columns} />;
}
