import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ApplicationsClient from './ApplicationsClient';

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      jobs(id, title, department, employment_type, location, is_remote, salary_range, skills, recruiters(company_name)),
      skill_gaps(skill_name, importance, suggestion)
    `)
    .eq('candidate_id', user.id)
    .order('submitted_at', { ascending: false });

  return <ApplicationsClient applications={applications ?? []} />;
}
