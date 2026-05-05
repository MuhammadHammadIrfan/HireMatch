'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import HMButton from '@/components/ui/HMButton';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-hm-surface flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-5">⚠️</div>
      <h1 className="text-2xl font-black text-hm-textP mb-2">Something went wrong</h1>
      <p className="text-sm text-hm-textS mb-2 leading-relaxed">
        An unexpected error occurred. Our team has been notified automatically.
      </p>
      {error.digest && (
        <p className="text-xs text-hm-textS mb-6 font-mono bg-hm-surface px-2 py-1 rounded">
          Error ID: {error.digest}
        </p>
      )}
      <div className="w-full max-w-xs flex flex-col gap-2.5">
        <HMButton onClick={reset}>Try Again</HMButton>
        <HMButton variant="secondary" onClick={() => window.location.href = '/'}>Go Home</HMButton>
      </div>
    </div>
  );
}
