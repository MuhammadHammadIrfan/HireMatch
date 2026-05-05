import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ResumePreviewClient from './ResumePreviewClient';

export default async function ResumePreviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: candidate } = await supabase.from('candidates').select('*').eq('id', user.id).single();
  return <ResumePreviewClient candidate={candidate} />;
}
