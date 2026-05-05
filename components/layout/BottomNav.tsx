'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Role = 'candidate' | 'recruiter';

const CANDIDATE_TABS = [
  { href: '/candidate/dashboard',    label: 'Home',    icon: '⌂' },
  { href: '/candidate/jobs',         label: 'Search',  icon: '🔍' },
  { href: '/candidate/applications', label: 'My Jobs', icon: '📋' },
  { href: '/candidate/profile',      label: 'Profile', icon: '◉' },
];

const RECRUITER_TABS = [
  { href: '/recruiter/dashboard', label: 'Home',     icon: '⌂' },
  { href: '/recruiter/jobs',      label: 'Jobs',     icon: '💼' },
  { href: '/recruiter/pipeline',  label: 'Pipeline', icon: '⚡' },
  { href: '/recruiter/dashboard', label: 'Profile',  icon: '◉' },
];

export default function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const tabs = role === 'recruiter' ? RECRUITER_TABS : CANDIDATE_TABS;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[74px] bg-white border-t border-hm-border flex items-start pt-2 z-50 max-w-[430px] mx-auto">
      {tabs.map((t, i) => {
        const isActive = pathname.startsWith(t.href) && !(i === 3 && role === 'recruiter');
        return (
          <Link
            key={i}
            href={t.href}
            className={[
              'flex-1 flex flex-col items-center gap-0.5 no-underline pt-1.5',
              isActive ? 'text-hm-primary' : 'text-hm-textS',
            ].join(' ')}
          >
            <span className="text-[22px] leading-none">{t.icon}</span>
            <span className={`text-[9.5px] ${isActive ? 'font-bold' : 'font-normal'}`}>{t.label}</span>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-hm-primary mt-0.5" />}
          </Link>
        );
      })}
    </div>
  );
}
