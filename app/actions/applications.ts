'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { ApplicationStatus } from '@/lib/types';

export async function updateApplicationStatus(appId: string, newStatus: ApplicationStatus) {
  const adminClient = createAdminClient();
  
  const { error } = await adminClient
    .from('applications')
    .update({ status: newStatus })
    .eq('id', appId);
    
  if (error) {
    throw new Error('Failed to update status: ' + error.message);
  }

  return { success: true };
}
