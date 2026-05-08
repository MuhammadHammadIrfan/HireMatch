import AppSidebar from '@/components/layout/AppSidebar';

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-hm-surface overflow-x-hidden">
      <AppSidebar role="candidate" />
      {/* On mobile: bottom padding for tab bar. On desktop: left margin for sidebar. */}
      <main className="md:ml-60 pb-[60px] md:pb-0 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
