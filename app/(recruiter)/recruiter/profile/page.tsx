import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RecruiterProfileClient from './RecruiterProfileClient';

export default async function RecruiterProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: recruiter }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('recruiters').select('*').eq('id', user.id).single(),
  ]);

  return <RecruiterProfileClient profile={profile} recruiter={recruiter} />;
}
