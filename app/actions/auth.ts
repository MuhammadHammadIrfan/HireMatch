'use server';

import { createClient } from '@/lib/supabase/server';

export async function completeCandidateSetup() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Set role to 'candidate' in public.users
  const { error: usersError } = await supabase
    .from('users')
    .update({ role: 'candidate' })
    .eq('id', user.id);
    
  if (usersError) throw new Error('Failed to update role: ' + usersError.message);

  // 2. Insert into candidates table
  const { error: candidateError } = await supabase
    .from('candidates')
    .upsert({ id: user.id });

  if (candidateError) throw new Error('Failed to create candidate profile: ' + candidateError.message);

  return { success: true };
}

export async function completeRecruiterSetup(data: { companyName: string, companySize: string, industry: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Set role to 'recruiter' in public.users
  const { error: usersError } = await supabase
    .from('users')
    .update({ role: 'recruiter' })
    .eq('id', user.id);
    
  if (usersError) throw new Error('Failed to update role: ' + usersError.message);

  // 2. Insert into recruiters table
  const { error: recruiterError } = await supabase
    .from('recruiters')
    .upsert({ 
      id: user.id,
      company_name: data.companyName,
      company_size: data.companySize,
      industry: data.industry
    });

  if (recruiterError) throw new Error('Failed to create recruiter profile: ' + recruiterError.message);

  return { success: true };
}
