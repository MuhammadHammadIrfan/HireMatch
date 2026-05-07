'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HMButton from '@/components/ui/HMButton';
import { completeCandidateSetup } from '@/app/actions/auth';

function HireMatchLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="8" height="32" rx="3" fill="url(#reg-grad)" />
      <rect x="34" y="8" width="8" height="32" rx="3" fill="url(#reg-grad)" />
      <rect x="6" y="20" width="36" height="8" rx="3" fill="url(#reg-grad)" />
      <circle cx="10" cy="36" r="5" fill="#06B6D4" />
      <circle cx="38" cy="12" r="5" fill="#3B82F6" />
      <line x1="14" y1="34" x2="33" y2="14" stroke="url(#reg-line)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 4" />
      <defs>
        <linearGradient id="reg-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="reg-line" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.9" /><stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function RegisterRolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<'candidate' | 'recruiter' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const OPTIONS = [
    {
      key: 'candidate' as const,
      gradient: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
      glowColor: 'rgba(59,130,246,0.25)',
      borderColor: '#3B82F6',
      icon: (
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      title: "I'm a Job Seeker",
      sub: 'Upload your resume, discover AI-matched roles, and track your applications.',
      bullets: ['Resume PDF parsing by Gemini AI', 'Ranked jobs by match score', 'Real-time skill gap analysis'],
    },
    {
      key: 'recruiter' as const,
      gradient: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
      glowColor: 'rgba(139,92,246,0.25)',
      borderColor: '#8B5CF6',
      icon: (
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
      title: "I'm a Recruiter",
      sub: 'Post jobs, rank applicants with AI, and manage your hiring pipeline.',
      bullets: ['Semantic job-candidate matching', 'Kanban pipeline management', 'Candidate skill insights'],
    },
  ];

  const handleContinue = async () => {
    if (!selected) return;
    if (selected === 'candidate') {
      try {
        setLoading(true);
        setError('');
        await completeCandidateSetup();
        router.push('/candidate/dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to complete setup');
        setLoading(false);
      }
    } else {
      router.push('/register/recruiter');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerBg {
          0%   { background-position: 0% 50%; }
          100% { background-position: -200% 50%; }
        }
      `}</style>

      {/* Top shimmer bar */}
      <div style={{
        height: 3, width: '100%',
        background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4, #10B981, #3B82F6)',
        backgroundSize: '200% 100%',
        animation: 'shimmerBg 4s linear infinite',
      }} />

      {/* Dark hero header */}
      <div style={{
        background: 'linear-gradient(160deg, #080E1C 0%, #0F172A 50%, #111827 100%)',
        position: 'relative', overflow: 'hidden',
        padding: '40px 24px 80px',
      }} className="md:px-10 md:pt-12">
        {/* Orbs */}
        <div style={{
          position: 'absolute', top: '-30%', right: '-5%',
          width: 480, height: 480, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle at 60% 40%, rgba(59,130,246,0.14), transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-5%',
          width: 360, height: 360, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle at 40% 60%, rgba(139,92,246,0.10), transparent 70%)',
        }} />

        {/* Fade bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          background: 'linear-gradient(to bottom, transparent, #F8FAFC)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', width: '100%' }}>
          {/* Logo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36,
            animation: 'fadeSlideUp 0.4s ease both',
          }}>
            <HireMatchLogo size={36} />
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 18, color: 'white', letterSpacing: '-0.2px',
            }}>HireMatch</span>
          </div>

          <div style={{ animation: 'fadeSlideUp 0.4s ease both', animationDelay: '60ms' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(30px, 5vw, 52px)', color: 'white',
              letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 12,
            }}>
              Join HireMatch
            </div>
            <div style={{
              fontSize: 17, color: 'rgba(148,163,184,0.85)',
              fontFamily: 'var(--font-dm)',
            }}>
              Choose how you want to use the platform
            </div>
          </div>
        </div>
      </div>

      {/* Role selection */}
      <div style={{ padding: '0 24px 60px', maxWidth: 900, margin: '-24px auto 0', width: '100%' }} className="md:px-10">
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            borderRadius: 14, padding: '14px 18px', marginBottom: 20,
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)',
            color: '#F43F5E', fontSize: 14, fontFamily: 'var(--font-dm)',
            animation: 'fadeSlideUp 0.3s ease both',
          }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* Role cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 28 }}
          className="md:grid-cols-2">
          {OPTIONS.map((opt, i) => {
            const isSelected = selected === opt.key;
            return (
              <div
                key={opt.key}
                onClick={() => setSelected(opt.key)}
                style={{
                  background: 'white', borderRadius: 22, overflow: 'hidden',
                  cursor: 'pointer',
                  border: `2px solid ${isSelected ? opt.borderColor : '#E2E8F0'}`,
                  boxShadow: isSelected
                    ? `0 0 0 4px ${opt.glowColor}, 0 8px 32px rgba(0,0,0,0.10)`
                    : '0 4px 20px rgba(0,0,0,0.06)',
                  transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  animation: 'fadeSlideUp 0.5s ease both',
                  animationDelay: `${i * 80}ms`,
                }}
              >
                {/* Top accent */}
                <div style={{
                  height: 4,
                  background: isSelected ? opt.gradient : '#E2E8F0',
                  transition: 'background 0.3s ease',
                }} />

                <div style={{ padding: '28px 28px 24px' }}>
                  {/* Icon + title row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 18 }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: 16, flexShrink: 0,
                      background: isSelected ? opt.gradient : '#F1F5F9',
                      color: isSelected ? 'white' : '#64748B',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      boxShadow: isSelected ? `0 8px 24px ${opt.glowColor}` : 'none',
                    }}>
                      {opt.icon}
                    </div>
                    <div style={{ flex: 1, paddingTop: 4 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900,
                        color: '#0F172A', marginBottom: 6,
                      }}>{opt.title}</div>
                      <div style={{
                        fontSize: 14, color: '#64748B', fontFamily: 'var(--font-dm)', lineHeight: 1.6,
                      }}>{opt.sub}</div>
                    </div>
                  </div>

                  {/* Bullet points */}
                  <div style={{
                    borderTop: '1px solid #F1F5F9', paddingTop: 18,
                    display: 'flex', flexDirection: 'column', gap: 10,
                  }}>
                    {opt.bullets.map(b => (
                      <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          background: isSelected ? opt.gradient : '#F1F5F9',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 0.3s ease',
                        }}>
                          <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                            stroke={isSelected ? 'white' : '#94A3B8'} strokeWidth={3} strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                        <span style={{
                          fontSize: 13, fontFamily: 'var(--font-dm)', fontWeight: 600,
                          color: isSelected ? '#0F172A' : '#64748B',
                          transition: 'color 0.2s ease',
                        }}>{b}</span>
                      </div>
                    ))}
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div style={{
                      marginTop: 18, display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: 13, fontWeight: 800, color: opt.borderColor,
                      fontFamily: 'var(--font-display)',
                    }}>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Selected — ready to continue
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <HMButton
          disabled={!selected || loading}
          loading={loading}
          onClick={handleContinue}
        >
          {selected === 'recruiter' ? 'Set Up Company Profile →' : 'Continue to Dashboard →'}
        </HMButton>

        <p style={{
          textAlign: 'center', fontSize: 13, color: '#94A3B8',
          fontFamily: 'var(--font-dm)', marginTop: 20,
        }}>
          You can change your preferences from your profile at any time.
        </p>
      </div>
    </div>
  );
}
