'use client';
import AppSidebar from './AppSidebar';

export default function BottomNav({ role }: { role: 'candidate' | 'recruiter' }) {
  return <AppSidebar role={role} />;
}
