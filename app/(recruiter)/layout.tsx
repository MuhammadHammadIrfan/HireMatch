import BottomNav from '@/components/layout/BottomNav';

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-hm-surface pb-[74px]">
      {children}
      <BottomNav role="recruiter" />
    </div>
  );
}
