import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        hm: {
          primary:    '#1565C0',
          primaryL:   '#1976D2',
          primaryBg:  'rgba(21,101,192,0.09)',
          green:      '#2E7D32',
          greenBg:    'rgba(46,125,50,0.1)',
          amber:      '#F57F17',
          amberBg:    'rgba(245,127,23,0.1)',
          red:        '#C62828',
          redBg:      'rgba(198,40,40,0.1)',
          yellow:     '#F9A825',
          surface:    '#F5F7FA',
          textP:      '#1A1A2E',
          textS:      '#5A6A7A',
          border:     '#E0E7EF',
        },
      },
      keyframes: {
        hmSlideRight: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        hmSlideLeft:  { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        hmFadeScale:  { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        hmSpin:       { to: { transform: 'rotate(360deg)' } },
        hmPulse:      { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.08)' } },
        hmFadeIn:     { from: { opacity: '0', transform: 'translateY(-6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        hmToastIn:    { from: { transform: 'translateY(-100%)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: {
        'hm-slide-right': 'hmSlideRight 0.28s cubic-bezier(0.25,0.46,0.45,0.94) both',
        'hm-slide-left':  'hmSlideLeft 0.28s cubic-bezier(0.25,0.46,0.45,0.94) both',
        'hm-fade-scale':  'hmFadeScale 0.22s ease-out both',
        'hm-spin':        'hmSpin 0.8s linear infinite',
        'hm-pulse':       'hmPulse 2s ease-in-out infinite',
        'hm-fade-in':     'hmFadeIn 0.2s ease-out',
        'hm-toast-in':    'hmToastIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
