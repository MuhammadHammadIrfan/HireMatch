import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RecruiterDashboardClient from './RecruiterDashboardClient';

export default async function RecruiterDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const [{ data: profile }, { data: recruiter }, { data: activeJobs }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('recruiters').select('*').eq('id', user.id).single(),
    supabase.from('jobs').select('*').eq('recruiter_id', user.id).eq('status', 'active').order('created_at', { ascending: false }).limit(5),
  ]);
  return <RecruiterDashboardClient profile={profile} recruiter={recruiter} activeJobs={activeJobs ?? []} />;
}
