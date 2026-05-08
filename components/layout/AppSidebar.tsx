'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/Avatar';

type Role = 'candidate' | 'recruiter';

// SVG Icon components
const IconHome = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconSearch = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconBriefcase = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconUser = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconPipeline = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="18" rx="1.5" />
    <rect x="10" y="3" width="5" height="12" rx="1.5" />
    <rect x="17" y="3" width="5" height="7" rx="1.5" />
  </svg>
);
const IconApps = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

// HireMatch logo — geometric H lettermark with match-connection nodes
function HireMatchLogo({ size = 32 }: { size?: number }) {
  const id = `hm-grad-${size}`;
  const lineId = `hm-line-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left vertical bar of H */}
      <rect x="6" y="8" width="8" height="32" rx="3" fill={`url(#${id})`} />
      {/* Right vertical bar of H */}
      <rect x="34" y="8" width="8" height="32" rx="3" fill={`url(#${id})`} />
      {/* Horizontal crossbar */}
      <rect x="6" y="20" width="36" height="8" rx="3" fill={`url(#${id})`} />
      {/* Candidate node — cyan dot, lower-left */}
      <circle cx="10" cy="36" r="5" fill="#06B6D4" />
      {/* Job node — blue dot, upper-right */}
      <circle cx="38" cy="12" r="5" fill="#3B82F6" />
      {/* Dashed diagonal — the "match" connection */}
      <line x1="14" y1="34" x2="33" y2="14" stroke={`url(#${lineId})`} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 4" />
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id={lineId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const CANDIDATE_TABS = [
  { href: '/candidate/dashboard',    label: 'Home',         icon: <IconHome /> },
  { href: '/candidate/jobs',         label: 'Find Jobs',    icon: <IconSearch /> },
  { href: '/candidate/applications', label: 'Applications', icon: <IconApps /> },
  { href: '/candidate/profile',      label: 'Profile',      icon: <IconUser /> },
];

const RECRUITER_TABS = [
  { href: '/recruiter/dashboard', label: 'Dashboard', icon: <IconHome /> },
  { href: '/recruiter/jobs',      label: 'My Jobs',   icon: <IconBriefcase /> },
  { href: '/recruiter/pipeline',  label: 'Pipeline',  icon: <IconPipeline /> },
  { href: '/recruiter/profile',   label: 'Profile',   icon: <IconUser /> },
];

export default function AppSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const tabs = role === 'recruiter' ? RECRUITER_TABS : CANDIDATE_TABS;
  const [user, setUser] = useState<{ name: string; avatarUrl: string | null } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) return;
      supabase.from('users').select('full_name, avatar_url').eq('id', u.id).single()
        .then(({ data }) => {
          if (data) setUser({ name: data.full_name ?? u.email ?? 'User', avatarUrl: data.avatar_url });
        });
    });
  }, []);

  return (
    <>
      {/* ── Desktop Sidebar (≥ 768px) ── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 z-40"
        style={{ background: '#080E1A', boxShadow: '1px 0 0 rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <HireMatchLogo size={34} />
          <span className="font-display font-black text-white tracking-tight" style={{ fontSize: 17 }}>HireMatch</span>
        </div>

        {/* Role label */}
        <div className="px-5 pt-5 pb-2">
          <span className="text-[11px] font-bold tracking-[0.14em] uppercase"
            style={{ color: role === 'recruiter' ? '#06B6D4' : '#60A5FA', letterSpacing: '0.14em' }}>
            {role === 'recruiter' ? 'Recruiter Portal' : 'Candidate Portal'}
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 pb-4 overflow-y-auto space-y-0.5">
          {tabs.map(tab => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  'flex items-center gap-3.5 px-3.5 py-3 rounded-xl no-underline',
                  'transition-all duration-150',
                  isActive ? 'text-white' : 'hover:text-white',
                ].join(' ')}
                style={
                  isActive
                    ? { background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(6,182,212,0.15))', color: 'white', borderLeft: '3px solid #3B82F6' }
                    : { color: 'rgba(255,255,255,0.45)', borderLeft: '3px solid transparent' }
                }
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)';
                  }
                }}
              >
                <span className="flex-shrink-0 w-5 h-5">{tab.icon}</span>
                <span style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, fontFamily: 'var(--font-dm)' }}>{tab.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#3B82F6' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            href={role === 'recruiter' ? '/recruiter/profile' : '/candidate/profile'}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl no-underline transition-all"
            style={{ background: 'rgba(255,255,255,0.04)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          >
            <Avatar name={user?.name ?? 'HM'} size={34} src={user?.avatarUrl} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate" style={{ fontSize: 13 }}>{user?.name ?? 'HireMatch'}</div>
              <div className="capitalize" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-dm)' }}>
                {role} account
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav (< 768px) ── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 hm-glass"
        style={{
          height: 60,
          width: '100%',
          maxWidth: '100vw',
          paddingBottom: 'env(safe-area-inset-bottom)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        }}
      >
        <div className="flex items-center h-full max-w-lg mx-auto px-1">
          {tabs.map(tab => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  'flex-1 flex flex-col items-center justify-center gap-0.5 h-full no-underline relative',
                  'transition-all duration-150',
                  isActive ? 'text-hm-blue' : 'text-hm-textS',
                ].join(' ')}
              >
                <span className={`transition-transform duration-150 ${isActive ? 'scale-110' : 'scale-100'}`}>
                  {tab.icon}
                </span>
                <span className={`text-[9px] font-semibold leading-none ${isActive ? 'text-hm-blue' : 'text-hm-textS'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 w-8 h-0.5 rounded-full bg-hm-blue" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
