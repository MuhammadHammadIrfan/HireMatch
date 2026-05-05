import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CandidateProfileClient from './CandidateProfileClient';

export default async function CandidateProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const [{ data: profile }, { data: candidate }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('candidates').select('*').eq('id', user.id).single(),
  ]);
  return <CandidateProfileClient profile={profile} candidate={candidate} />;
}
