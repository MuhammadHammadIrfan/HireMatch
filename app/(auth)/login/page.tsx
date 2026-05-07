'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Analytics } from '@/lib/analytics';

function HireMatchLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="8" height="32" rx="3" fill="url(#login-grad)" />
      <rect x="34" y="8" width="8" height="32" rx="3" fill="url(#login-grad)" />
      <rect x="6" y="20" width="36" height="8" rx="3" fill="url(#login-grad)" />
      <circle cx="10" cy="36" r="5" fill="#06B6D4" />
      <circle cx="38" cy="12" r="5" fill="#3B82F6" />
      <line x1="14" y1="34" x2="33" y2="14" stroke="url(#login-line)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 4" />
      <defs>
        <linearGradient id="login-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="login-line" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.9" /><stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const FEATURES = [
  {
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    color: '#3B82F6',
    title: 'AI Resume Parsing',
    text: 'Gemini AI extracts your skills, experience and education in seconds.',
  },
  {
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    color: '#8B5CF6',
    title: 'Semantic Job Matching',
    text: 'Vector similarity ranks jobs by how well they fit your profile.',
  },
  {
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    color: '#06B6D4',
    title: 'Real-time Skill Gap Analysis',
    text: 'Know exactly what skills to learn to land any role.',
  },
  {
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="18" rx="1.5"/><rect x="10" y="3" width="5" height="12" rx="1.5"/><rect x="17" y="3" width="5" height="7" rx="1.5"/>
      </svg>
    ),
    color: '#10B981',
    title: 'Kanban Recruiter Pipeline',
    text: 'Move candidates from applied to shortlisted with one click.',
  },
];

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [topError, setTopError] = useState('');

  const handleGoogle = async () => {
    setGoogleLoading(true);
    Analytics.login('google', 'candidate');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setTopError(error.message); setGoogleLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      <style>{`
        @keyframes shimmerBg {
          0%   { background-position: 0% 50%; }
          100% { background-position: -200% 50%; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%       { transform: translate(30px, 20px) scale(1.05); }
        }
        @keyframes badgePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.85); }
        }
        .login-feat-row { display: flex; align-items: flex-start; gap: 14px; animation: fadeSlideUp 0.5s ease both; }
        .login-google-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 12px 40px rgba(59,130,246,0.45) !important; }
        .login-google-btn:active { transform: translateY(0) !important; }
        @media (max-width: 767px) { .login-left { display: none !important; } .login-right { min-height: 100vh; } }
      `}</style>

      {/* ── Left Panel (desktop hero) ── */}
      <div className="login-left" style={{
        flex: 1,
        background: 'linear-gradient(160deg, #080E1C 0%, #0F172A 50%, #111827 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 64px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Shimmer top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4, #10B981, #3B82F6)',
          backgroundSize: '200% 100%',
          animation: 'shimmerBg 4s linear infinite',
        }} />

        {/* Ambient orbs */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 520, height: 520, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle at 60% 40%, rgba(59,130,246,0.18), transparent 65%)',
          animation: 'orbFloat 18s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-5%',
          width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle at 40% 60%, rgba(139,92,246,0.12), transparent 70%)',
          animation: 'orbFloat 24s ease-in-out infinite reverse',
        }} />

        {/* Ghost watermark */}
        <div style={{
          position: 'absolute', right: -20, bottom: 20,
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'clamp(100px, 16vw, 200px)', color: 'white',
          opacity: 0.025, lineHeight: 1, pointerEvents: 'none',
          userSelect: 'none', letterSpacing: '-0.04em',
        }}>H</div>

        <div style={{ position: 'relative', maxWidth: 440 }}>
          {/* Logo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52,
            animation: 'fadeSlideUp 0.4s ease both',
          }}>
            <HireMatchLogo size={44} />
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 22, color: 'white', letterSpacing: '-0.3px',
            }}>HireMatch</span>
          </div>

          {/* Headline */}
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(38px, 5vw, 58px)', color: 'white',
            lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 20,
            animation: 'fadeSlideUp 0.45s ease both', animationDelay: '60ms',
          }}>
            Smart Jobs.<br />
            <span style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Real Matches.</span>
          </div>

          <p style={{
            fontSize: 17, color: 'rgba(148,163,184,0.85)', lineHeight: 1.7,
            fontFamily: 'var(--font-dm)', marginBottom: 48,
            animation: 'fadeSlideUp 0.45s ease both', animationDelay: '120ms',
          }}>
            AI-powered recruitment that connects top candidates with the right opportunities using semantic vector analysis.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="login-feat-row" style={{ animationDelay: `${180 + i * 60}ms` }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                  background: `${f.color}18`, color: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: 15, fontWeight: 800, color: 'white',
                    fontFamily: 'var(--font-display)', marginBottom: 2,
                  }}>{f.title}</div>
                  <div style={{
                    fontSize: 13, color: 'rgba(148,163,184,0.75)',
                    fontFamily: 'var(--font-dm)', lineHeight: 1.5,
                  }}>{f.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel (auth form) ── */}
      <div className="login-right" style={{
        width: 'min(100%, 520px)', background: '#F8FAFC',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px', position: 'relative',
        borderLeft: '1px solid rgba(226,232,240,0.6)',
      }}>
        {/* Mobile logo */}
        <div style={{
          display: 'none', flexDirection: 'column', alignItems: 'center',
          marginBottom: 40,
        }} className="md:hidden">
          <HireMatchLogo size={56} />
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 24, color: '#0F172A', marginTop: 12, letterSpacing: '-0.3px',
          }}>HireMatch</div>
          <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Smart Jobs. Real Matches.</div>
        </div>

        <div style={{ width: '100%', maxWidth: 380, animation: 'fadeSlideUp 0.5s ease both' }}>
          {/* Brand mark (desktop) */}
          <div style={{ marginBottom: 48 }} className="hidden md:block">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <HireMatchLogo size={36} />
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 18, color: '#0F172A', letterSpacing: '-0.2px',
              }}>HireMatch</span>
            </div>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(28px, 4vw, 38px)', color: '#0F172A',
            letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 10,
          }}>
            Welcome back
          </h1>
          <p style={{
            fontSize: 16, color: '#64748B', marginBottom: 36,
            fontFamily: 'var(--font-dm)', lineHeight: 1.5,
          }}>
            Sign in to continue to HireMatch
          </p>

          {topError && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              borderRadius: 14, padding: '14px 16px', marginBottom: 24,
              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)',
              color: '#F43F5E', fontSize: 14,
            }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-dm)' }}>{topError}</span>
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="login-google-btn"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
              height: 60, borderRadius: 16, border: '1.5px solid #E2E8F0',
              background: 'white', cursor: googleLoading ? 'not-allowed' : 'pointer',
              opacity: googleLoading ? 0.7 : 1,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 17, color: '#0F172A',
            }}
          >
            {googleLoading ? (
              <svg width={22} height={22} viewBox="0 0 24 24" style={{ color: '#3B82F6', animation: 'shimmerBg 0.8s linear infinite' }}>
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                <path d="M12 2A10 10 0 0 1 22 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                  style={{ transformOrigin: 'center', animation: 'spin 0.8s linear infinite' }} />
              </svg>
            ) : (
              <svg width={22} height={22} viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            <span style={{ fontSize: 13, color: '#94A3B8', fontFamily: 'var(--font-dm)' }}>
              Secure OAuth via Google
            </span>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          </div>

          {/* Trust badges */}
          <div style={{
            display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28,
          }}>
            {['🔒 Encrypted', '⚡ Instant', '🎯 AI-Matched'].map(b => (
              <span key={b} style={{
                fontSize: 12, color: '#64748B', fontFamily: 'var(--font-dm)', fontWeight: 600,
                padding: '5px 12px', borderRadius: 999,
                background: 'white', border: '1px solid #E2E8F0',
              }}>{b}</span>
            ))}
          </div>

          <p style={{
            fontSize: 12, textAlign: 'center', color: '#94A3B8',
            fontFamily: 'var(--font-dm)', lineHeight: 1.6,
          }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
