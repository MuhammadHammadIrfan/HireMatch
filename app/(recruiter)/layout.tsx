import AppSidebar from '@/components/layout/AppSidebar';

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-hm-surface">
      <AppSidebar role="recruiter" />
      {/* On mobile: bottom padding for tab bar. On desktop: left margin for sidebar. */}
      <main className="md:ml-60 pb-[60px] md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
