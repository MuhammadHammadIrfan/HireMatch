import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ActiveJobsClient from './ActiveJobsClient';

export default async function ActiveJobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: jobs } = await supabase.from('jobs').select('*').eq('recruiter_id', user.id).order('created_at', { ascending: false });
  return <ActiveJobsClient jobs={jobs ?? []} />;
}
