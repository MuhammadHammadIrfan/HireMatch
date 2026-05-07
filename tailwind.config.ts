import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-dm)', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        hm: {
          // New primary palette
          blue:       '#3B82F6',
          blueLight:  '#60A5FA',
          blueBg:     'rgba(59,130,246,0.08)',
          cyan:       '#06B6D4',
          cyanBg:     'rgba(6,182,212,0.08)',
          navy:       '#0F172A',
          navyLight:  '#1E293B',
          green:      '#10B981',
          greenBg:    'rgba(16,185,129,0.10)',
          amber:      '#F59E0B',
          amberBg:    'rgba(245,158,11,0.10)',
          rose:       '#F43F5E',
          roseBg:     'rgba(244,63,94,0.10)',
          surface:    '#F8FAFC',
          card:       '#FFFFFF',
          textP:      '#0F172A',
          textS:      '#64748B',
          border:     '#E2E8F0',
          sidebar:    '#0F172A',
          sidebarHover: '#1E293B',
          // Backward-compat aliases (keep existing classes working)
          primary:    '#3B82F6',
          primaryL:   '#60A5FA',
          primaryBg:  'rgba(59,130,246,0.08)',
          red:        '#F43F5E',
          redBg:      'rgba(244,63,94,0.10)',
          yellow:     '#F59E0B',
        },
      },
      boxShadow: {
        card:         '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)',
        'card-hover': '0 8px 24px 0 rgba(0,0,0,0.12)',
        'card-lg':    '0 4px 16px 0 rgba(0,0,0,0.10)',
        'blue-glow':  '0 8px 32px rgba(59,130,246,0.35)',
        sidebar:      '4px 0 24px rgba(0,0,0,0.12)',
      },
      keyframes: {
        hmSlideRight:  { from: { transform: 'translateX(100%)' },            to: { transform: 'translateX(0)' } },
        hmSlideLeft:   { from: { transform: 'translateX(-100%)' },           to: { transform: 'translateX(0)' } },
        hmFadeScale:   { from: { opacity: '0', transform: 'scale(0.96)' },   to: { opacity: '1', transform: 'scale(1)' } },
        hmSpin:        { to:   { transform: 'rotate(360deg)' } },
        hmPulse:       { '0%,100%': { transform: 'scale(1)' },               '50%': { transform: 'scale(1.08)' } },
        hmFadeIn:      { from: { opacity: '0', transform: 'translateY(-6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        hmToastIn:     { from: { transform: 'translateY(-100%)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        hmSlideUp:     { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        hmShimmer:     { from: { backgroundPosition: '-200% 0' },            to: { backgroundPosition: '200% 0' } },
        hmGlow:        { '0%,100%': { boxShadow: '0 0 0 0 rgba(59,130,246,0)' }, '50%': { boxShadow: '0 0 16px 4px rgba(59,130,246,0.3)' } },
        hmCheckDraw:   { from: { strokeDashoffset: '40' },                   to:   { strokeDashoffset: '0' } },
      },
      animation: {
        'hm-slide-right': 'hmSlideRight 0.28s cubic-bezier(0.25,0.46,0.45,0.94) both',
        'hm-slide-left':  'hmSlideLeft 0.28s cubic-bezier(0.25,0.46,0.45,0.94) both',
        'hm-fade-scale':  'hmFadeScale 0.22s ease-out both',
        'hm-spin':        'hmSpin 0.8s linear infinite',
        'hm-pulse':       'hmPulse 2s ease-in-out infinite',
        'hm-fade-in':     'hmFadeIn 0.2s ease-out',
        'hm-toast-in':    'hmToastIn 0.3s ease-out',
        'hm-slide-up':    'hmSlideUp 0.22s ease-out both',
        'hm-shimmer':     'hmShimmer 1.6s linear infinite',
        'hm-glow':        'hmGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
