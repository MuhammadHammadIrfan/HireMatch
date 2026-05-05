// sentry.server.config.ts
// Runs in Node.js — initialises Sentry for server-side errors and performance
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  enabled: process.env.NODE_ENV === 'production',

  // Log unhandled promise rejections in Server Actions and API routes
  integrations: [
    Sentry.captureConsoleIntegration({ levels: ['error'] }),
  ],
});
