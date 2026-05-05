import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import PostHogProvider from '@/components/providers/PostHogProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'HireMatch — Smart Jobs. Real Matches.',
  description: 'AI-powered job matching that connects top candidates with the right opportunities using semantic resume analysis and NLP scoring.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HireMatch',
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: 'HireMatch',
    description: 'Smart Jobs. Real Matches.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#1565C0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="font-sans bg-hm-surface antialiased">
        {/* Max-width mobile shell */}
        <div className="relative min-h-screen max-w-[430px] mx-auto bg-hm-surface shadow-2xl overflow-hidden">
          {/* PostHog: Suspense required because PostHogProvider uses useSearchParams */}
          <Suspense fallback={null}>
            <PostHogProvider>
              {children}
            </PostHogProvider>
          </Suspense>
        </div>
      </body>
    </html>
  );
}
