'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import HMToast from '@/components/ui/HMToast';
import { createClient } from '@/lib/supabase/client';
import type { DBUser, DBRecruiter } from '@/lib/types';

interface Props {
  profile: DBUser | null;
  recruiter: DBRecruiter | null;
}

export default function RecruiterProfileClient({ profile, recruiter }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);

  const name = profile?.full_name ?? 'Recruiter';
  const company = recruiter?.company_name ?? 'Your Company';
  const industry = recruiter?.industry ?? '';
  const companySize = recruiter?.company_size ?? '';

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploadingPhoto(false); return; }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('userId', user.id);

    const res = await fetch('/api/avatar/upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) { setToast('Failed to upload photo'); setUploadingPhoto(false); return; }

    setAvatarUrl(json.publicUrl + '?t=' + Date.now());
    setToast('Photo updated');
    setUploadingPhoto(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const infoRows = [
    { label: 'Company', value: company, icon: 'M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0H3m2 0h14' },
    ...(industry ? [{ label: 'Industry', value: industry, icon: 'M22 12h-4l-3 9L9 3l-3 9H2' }] : []),
    ...(companySize ? [{ label: 'Team Size', value: `${companySize} employees`, icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' }] : []),
    { label: 'Email', value: profile?.email ?? '—', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerBg {
          0%   { background-position: 0% 50%; }
          100% { background-position: -200% 50%; }
        }
      `}</style>

      {toast && <HMToast message={toast} onClose={() => setToast(null)} />}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

      {/* Shimmer rainbow bar */}
      <div style={{
        height: 3, width: '100%',
        background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4, #10B981, #3B82F6)',
        backgroundSize: '200% 100%',
        animation: 'shimmerBg 4s linear infinite',
      }} />

      {/* Dark hero header */}
      <div style={{
        background: 'linear-gradient(160deg, #080E1A 0%, #0F172A 60%, #1E293B 100%)',
        padding: '36px 32px 96px',
        paddingTop: 'max(36px, env(safe-area-inset-top, 36px))',
        position: 'relative', overflow: 'hidden',
      }} className="md:pt-10 md:px-10">

        {/* Ambient orbs */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 20, left: -40, width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Fade into page surface */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(to bottom, transparent, #F8FAFC)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative',
          display: 'flex', alignItems: 'flex-end', gap: 24,
          animation: 'fadeSlideUp 0.45s ease both',
          maxWidth: 1100, margin: '0 auto', width: '100%',
        }}>
          {/* Avatar with camera button */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              borderRadius: '50%', padding: 3,
              background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
              display: 'inline-block',
            }}>
              <div style={{ borderRadius: '50%', border: '3px solid #0F172A', overflow: 'hidden' }}>
                <Avatar name={name} size={88} src={avatarUrl} />
              </div>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 32, height: 32, borderRadius: '50%',
                border: '2.5px solid #0F172A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
              }}
              onMouseEnter={e => {
                (e.currentTarget.style.transform = 'scale(1.12)');
                (e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.6)');
              }}
              onMouseLeave={e => {
                (e.currentTarget.style.transform = 'scale(1)');
                (e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.4)');
              }}
              title="Change photo">
              {uploadingPhoto ? (
                <svg className="animate-spin" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              ) : (
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              )}
            </button>
          </div>

          <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(22px, 3vw, 30px)', color: 'white',
              marginBottom: 4, lineHeight: 1.1,
            }}>
              {name}
            </div>
            <div style={{
              fontSize: 16, color: 'rgba(255,255,255,0.50)',
              fontFamily: 'var(--font-dm)', marginBottom: 14,
            }}>
              {company}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 999,
              background: 'rgba(6,182,212,0.15)',
              border: '1px solid rgba(6,182,212,0.25)',
              color: '#06B6D4', fontSize: 13, fontWeight: 800,
              fontFamily: 'var(--font-dm)',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#06B6D4' }} />
              Recruiter Account
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 32px 40px', maxWidth: 1100, margin: '0 auto', width: '100%' }} className="md:px-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-6" style={{ alignItems: 'start' }}>

        {/* Company details card */}
        <div style={{
          background: 'white', borderRadius: 22,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          marginBottom: 16, overflow: 'hidden',
          animation: 'fadeSlideUp 0.45s ease both', animationDelay: '80ms',
        }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, #3B82F6, #06B6D4)' }} />
          <div style={{ padding: '24px 28px' }}>
            <div style={{
              fontSize: 12, fontWeight: 800, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#94A3B8',
              fontFamily: 'var(--font-dm)', marginBottom: 20,
            }}>
              Company Details
            </div>
            {infoRows.map((row, i) => (
              <div key={row.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                padding: i === 0 ? '0 0 16px' : '16px 0',
                borderTop: i > 0 ? '1px solid #F1F5F9' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: '#F8FAFC',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d={row.icon}/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 15, color: '#64748B', fontFamily: 'var(--font-dm)' }}>{row.label}</span>
                </div>
                <span style={{
                  fontSize: 15, fontWeight: 700, color: '#0F172A',
                  fontFamily: 'var(--font-dm)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: 220, textAlign: 'right',
                }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Account card */}
        <div style={{
          background: 'white', borderRadius: 22,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          marginBottom: 32, overflow: 'hidden',
          animation: 'fadeSlideUp 0.45s ease both', animationDelay: '160ms',
        }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, #F43F5E, #F59E0B)' }} />
          <div style={{ padding: '24px 28px' }}>
            <div style={{
              fontSize: 12, fontWeight: 800, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#94A3B8',
              fontFamily: 'var(--font-dm)', marginBottom: 20,
            }}>
              Account
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                borderRadius: 16, padding: '16px 18px',
                border: '1.5px solid rgba(244,63,94,0.18)',
                background: 'rgba(244,63,94,0.04)',
                cursor: 'pointer',
                transition: 'background 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget.style.background = 'rgba(244,63,94,0.10)');
                (e.currentTarget.style.borderColor = 'rgba(244,63,94,0.35)');
              }}
              onMouseLeave={e => {
                (e.currentTarget.style.background = 'rgba(244,63,94,0.04)');
                (e.currentTarget.style.borderColor = 'rgba(244,63,94,0.18)');
              }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: 'rgba(244,63,94,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{
                  fontSize: 17, fontWeight: 900, color: '#F43F5E',
                  fontFamily: 'var(--font-display)', marginBottom: 3,
                }}>
                  Sign Out
                </div>
                <div style={{ fontSize: 14, color: '#94A3B8', fontFamily: 'var(--font-dm)' }}>
                  Log out of your account
                </div>
              </div>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        </div> {/* end two-col grid */}

        <div style={{
          textAlign: 'center',
          animation: 'fadeSlideUp 0.45s ease both', animationDelay: '240ms',
        }}>
          <span style={{ fontSize: 13, color: '#CBD5E1', fontFamily: 'var(--font-dm)' }}>
            HireMatch · Built with Next.js &amp; Gemini AI
          </span>
        </div>
      </div>
    </div>
  );
}
