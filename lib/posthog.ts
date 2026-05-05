// lib/posthog.ts
// PostHog client singleton for browser usage
import posthog from 'posthog-js';

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    person_profiles: 'identified_only',

    // Session recordings
    session_recording: {
      maskAllInputs: true,       // mask input fields by default (passwords etc.)
      maskInputFn: (text, element) => {
        // Unmask non-sensitive fields
        if (element?.dataset?.phNoMask) return text;
        return text;
      },
    },

    // Autocapture clicks, forms, pageviews
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,

    // Don't track in dev
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') ph.opt_out_capturing();
    },
  });

  initialized = true;
}

export default posthog;
