'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog } from '@/lib/posthog';
import posthog from 'posthog-js';

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialise once on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Capture pageview on every route change
  useEffect(() => {
    if (!pathname) return;
    const url = `${pathname}${searchParams?.toString() ? `?${searchParams}` : ''}`;
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return <>{children}</>;
}
