import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  turbopack: undefined, // force webpack mode for next-pwa
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

// Wrap with PWA first, then Sentry
const pwaConfig = withPWA(nextConfig);

module.exports = withSentryConfig(pwaConfig, {
  // Sentry organisation and project (matches your sentry.io settings)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT ?? 'hirematch',

  // Auth token for source-map upload (set in CI/env)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Silent in dev, verbose in CI
  silent: process.env.NODE_ENV !== 'production',

  // Upload source maps to Sentry so stack traces are readable
  widenClientFileUpload: true,
  
  sourcemaps: {
    disable: process.env.NODE_ENV !== 'production',
  },
});
