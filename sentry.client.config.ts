// sentry.client.config.ts
// Runs in the browser — initialises Sentry for client-side error and performance tracking
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Capture 100 % of transactions in dev, 20 % in prod (adjust as needed)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Session Replay: 10 % of all sessions, 100 % of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      // Mask PII — leaves most text readable, masks only inputs
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Don't track in dev unless you want to
  enabled: process.env.NODE_ENV === 'production',
});
