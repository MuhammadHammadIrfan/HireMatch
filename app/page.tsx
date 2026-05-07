import Link from 'next/link';

function HireMatchLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="8" height="32" rx="3" fill="url(#land-grad)" />
      <rect x="34" y="8" width="8" height="32" rx="3" fill="url(#land-grad)" />
      <rect x="6" y="20" width="36" height="8" rx="3" fill="url(#land-grad)" />
      <circle cx="10" cy="36" r="5" fill="#06B6D4" />
      <circle cx="38" cy="12" r="5" fill="#3B82F6" />
      <line x1="14" y1="34" x2="33" y2="14" stroke="url(#land-line-grad)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 4" />
      <defs>
        <linearGradient id="land-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="land-line-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        :root {
          --blue:   #3B82F6;
          --blue-dim: rgba(59,130,246,0.15);
          --purple: #8B5CF6;
          --cyan:   #06B6D4;
          --green:  #10B981;
          --amber:  #F59E0B;
          --bg:     #0F172A;
          --card:   rgba(255,255,255,0.05);
          --border: rgba(255,255,255,0.08);
          --text:   #F0F4FF;
          --muted:  rgba(240,244,255,0.52);
        }

        .land-root {
          font-family: var(--font-jakarta, 'Plus Jakarta Sans', system-ui, sans-serif);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
        }

        /* Orbs */
        .orb-wrap { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .orb { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.22; }
        .orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, #3B82F6 0%, transparent 70%);
          top: -200px; left: -150px;
          animation: orbFloat1 18s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #8B5CF6 0%, transparent 70%);
          top: 30%; right: -150px;
          animation: orbFloat2 22s ease-in-out infinite alternate;
        }
        .orb-3 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #06B6D4 0%, transparent 70%);
          bottom: -100px; left: 30%;
          animation: orbFloat3 25s ease-in-out infinite alternate;
        }
        @keyframes orbFloat1 { from { transform: translate(0,0) scale(1); } to { transform: translate(80px,60px) scale(1.1); } }
        @keyframes orbFloat2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-60px,80px) scale(0.95); } }
        @keyframes orbFloat3 { from { transform: translate(0,0) scale(1); } to { transform: translate(-80px,-40px) scale(1.05); } }

        /* Nav */
        .nav {
          position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px;
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .nav-logo {
          display: flex; align-items: center; gap: 14px;
          font-size: 22px; font-weight: 900; color: var(--text); text-decoration: none;
          letter-spacing: -0.4px;
        }
        .nav-cta {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 28px; border-radius: 12px;
          background: linear-gradient(135deg, #3B82F6, #06B6D4);
          color: #fff; font-size: 15px; font-weight: 800;
          text-decoration: none; transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 6px 24px rgba(59,130,246,0.40);
        }
        .nav-cta:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 10px 36px rgba(59,130,246,0.55); }

        /* Hero */
        .hero {
          position: relative; z-index: 5;
          text-align: center;
          padding: 120px 24px 100px;
          max-width: 1040px; margin: 0 auto;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid rgba(59,130,246,0.4);
          background: rgba(59,130,246,0.08);
          color: var(--blue); font-size: 12px; font-weight: 700;
          padding: 8px 18px; border-radius: 999px; margin-bottom: 36px;
          letter-spacing: 1.5px; text-transform: uppercase;
        }
        .hero-badge-dot {
          width: 7px; height: 7px; border-radius: 50%; background: var(--cyan);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } }

        .hero-h1 {
          font-size: clamp(52px, 9vw, 96px);
          font-weight: 900; line-height: 1.02;
          letter-spacing: -3px;
          margin-bottom: 32px;
        }
        .hero-h1 .grad {
          background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #06B6D4 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: clamp(17px, 2.5vw, 22px);
          color: var(--muted); max-width: 660px; margin: 0 auto 56px;
          line-height: 1.75; font-weight: 400;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .hero-actions {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 16px;
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 12px;
          padding: 20px 40px; border-radius: 14px;
          background: linear-gradient(135deg, #3B82F6, #06B6D4);
          color: #fff; font-size: 18px; font-weight: 800;
          text-decoration: none;
          box-shadow: 0 8px 32px rgba(59,130,246,0.40);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 16px 56px rgba(59,130,246,0.60); }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 20px 32px; border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--card); backdrop-filter: blur(12px);
          color: var(--text); font-size: 16px; font-weight: 600;
          text-decoration: none; transition: border-color 0.2s, background 0.2s;
        }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); }

        /* Stats */
        .stats {
          position: relative; z-index: 5;
          display: flex; flex-wrap: wrap; justify-content: center;
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          max-width: 1040px; margin: 0 auto;
        }
        .stat-item {
          flex: 1; min-width: 160px; padding: 36px 24px; text-align: center;
          border-right: 1px solid var(--border);
        }
        .stat-item:last-child { border-right: none; }
        .stat-num { font-size: 36px; font-weight: 900; letter-spacing: -0.5px; }
        .stat-label { font-size: 13px; color: var(--muted); margin-top: 6px; font-family: 'DM Sans', system-ui, sans-serif; }

        /* Features */
        .features {
          position: relative; z-index: 5;
          max-width: 1200px; margin: 0 auto; padding: 120px 24px;
        }
        .section-label {
          text-align: center; font-size: 12px; font-weight: 800; letter-spacing: 3px;
          text-transform: uppercase; color: var(--cyan); margin-bottom: 18px;
        }
        .section-h2 {
          text-align: center; font-size: clamp(32px, 4.5vw, 54px);
          font-weight: 900; margin-bottom: 14px; letter-spacing: -1.5px;
        }
        .section-sub {
          text-align: center; color: var(--muted); font-size: 18px; margin-bottom: 64px;
          font-family: 'DM Sans', system-ui, sans-serif; max-width: 560px; margin-left: auto; margin-right: auto;
        }
        .features-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;
        }
        .feat-card {
          border: 1px solid var(--border);
          background: var(--card); backdrop-filter: blur(12px);
          border-radius: 22px; padding: 36px;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .feat-card:hover {
          border-color: rgba(59,130,246,0.4); transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.50);
        }
        .feat-icon {
          width: 60px; height: 60px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 30px; margin-bottom: 22px;
        }
        .feat-h3 { font-size: 20px; font-weight: 900; margin-bottom: 12px; }
        .feat-p { font-size: 15px; color: var(--muted); line-height: 1.8; font-family: 'DM Sans', system-ui, sans-serif; }

        /* How it works */
        .how {
          position: relative; z-index: 5;
          max-width: 1040px; margin: 0 auto; padding: 0 24px 120px;
        }
        .how-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
        @media (max-width: 640px) { .how-grid { grid-template-columns: 1fr; } }
        .how-col {
          border: 1px solid var(--border); background: var(--card);
          border-radius: 24px; padding: 40px;
        }
        .how-col-title {
          font-size: 13px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: 28px; padding-bottom: 16px; border-bottom: 1px solid var(--border);
        }
        .how-step { display: flex; gap: 16px; margin-bottom: 24px; }
        .how-step-num {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #06B6D4);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 900; flex-shrink: 0; color: white;
        }
        .how-step-text { font-size: 15px; color: var(--muted); line-height: 1.7; font-family: 'DM Sans', system-ui, sans-serif; padding-top: 4px; }
        .how-step-text strong { color: var(--text); font-size: 16px; display: block; margin-bottom: 2px; }

        /* CTA */
        .cta-section {
          position: relative; z-index: 5;
          max-width: 800px; margin: 0 auto;
          padding: 0 24px 140px; text-align: center;
        }
        .cta-card {
          border: 1px solid rgba(59,130,246,0.35);
          background: linear-gradient(135deg, rgba(59,130,246,0.10), rgba(139,92,246,0.10));
          backdrop-filter: blur(20px); border-radius: 28px;
          padding: 72px 56px;
        }
        .cta-h2 { font-size: clamp(32px, 4.5vw, 50px); font-weight: 900; margin-bottom: 18px; letter-spacing: -1.5px; }
        .cta-sub { color: var(--muted); font-size: 18px; margin-bottom: 44px; line-height: 1.75; font-family: 'DM Sans', system-ui, sans-serif; max-width: 520px; margin-left: auto; margin-right: auto; }

        /* Footer */
        .footer {
          position: relative; z-index: 5;
          border-top: 1px solid var(--border);
          padding: 28px 40px;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .footer-text { font-size: 13px; color: var(--muted); font-family: 'DM Sans', system-ui, sans-serif; }

        /* Tech badge row */
        .tech-badge {
          display: inline-flex; align-items: center; gap: 6px;
          border: 1px solid var(--border); background: var(--card);
          padding: 5px 12px; border-radius: 999px; font-size: 12px; color: var(--muted);
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .tech-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 20px; }

        @media (max-width: 640px) {
          .nav { padding: 16px 20px; }
          .hero { padding: 80px 20px 68px; }
          .hero-h1 { letter-spacing: -1.5px; }
          .cta-card { padding: 44px 24px; }
          .footer { padding: 20px 20px; }
        }
      `}</style>

      <div className="land-root">
        {/* Orbs */}
        <div className="orb-wrap">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        {/* Nav */}
        <nav className="nav">
          <Link href="/" className="nav-logo">
            <HireMatchLogo size={36} />
            HireMatch
          </Link>
          <Link href="/login" className="nav-cta">Get Started →</Link>
        </nav>

        {/* Hero */}
        <section className="hero">
          <div className="hero-badge">
            <span className="hero-badge-dot" /> AI-Powered Recruitment Platform
          </div>
          <h1 className="hero-h1">
            Hire Smarter.<br />
            <span className="grad">Match Faster.</span>
          </h1>
          <p className="hero-sub">
            HireMatch uses Gemini AI to parse resumes, score candidates against job requirements,
            and surface the best matches instantly — for both recruiters and job seekers.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn-primary">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Continue with Google
            </Link>
            <Link href="#features" className="btn-secondary">
              Explore Features ↓
            </Link>
          </div>

          {/* Tech badges */}
          <div className="tech-badges">
            {['Gemini AI', 'pgvector', 'Next.js 16', 'Supabase', 'PWA'].map(t => (
              <span key={t} className="tech-badge">● {t}</span>
            ))}
          </div>
        </section>

        {/* Stats */}
        <div className="stats">
          <div className="stat-item">
            <div className="stat-num" style={{ color: '#3B82F6' }}>AI</div>
            <div className="stat-label">Powered Matching</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" style={{ color: '#8B5CF6' }}>pgvector</div>
            <div className="stat-label">Cosine Similarity</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" style={{ color: '#06B6D4' }}>Real-time</div>
            <div className="stat-label">Pipeline Kanban</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" style={{ color: '#10B981' }}>100%</div>
            <div className="stat-label">Serverless &amp; Secure</div>
          </div>
        </div>

        {/* Features */}
        <section className="features" id="features">
          <div className="section-label">What We Do</div>
          <h2 className="section-h2">Everything you need to hire well</h2>
          <p className="section-sub">From resume upload to shortlist — fully automated, fully intelligent.</p>

          <div className="features-grid">
            {[
              { icon: '🧠', bg: 'rgba(59,130,246,0.12)',   title: 'AI Resume Parsing',   desc: 'Gemini AI extracts skills, experience, and education from any resume PDF in seconds, building a rich structured candidate profile.' },
              { icon: '⚡', bg: 'rgba(139,92,246,0.12)',  title: 'Smart Job Matching',  desc: 'Vector embeddings power cosine similarity scoring between job descriptions and candidate profiles, delivering ranked match percentages.' },
              { icon: '📊', bg: 'rgba(6,182,212,0.12)',   title: 'Skill Gap Analysis',  desc: 'Candidates see exactly which required skills they\'re missing for each job, with actionable suggestions on how to close the gap.' },
              { icon: '🎯', bg: 'rgba(16,185,129,0.12)',  title: 'Recruiter Pipeline',  desc: 'A Kanban-style board lets recruiters move candidates through Applied → Reviewing → Shortlisted → Rejected with one tap.' },
              { icon: '🔒', bg: 'rgba(245,158,11,0.12)',  title: 'Row-Level Security',  desc: 'Every data access is governed by Supabase RLS policies. Candidates only see their own data; recruiters only see their own jobs.' },
              { icon: '📱', bg: 'rgba(59,130,246,0.12)',  title: 'Mobile-First PWA',    desc: 'A Progressive Web App experience works seamlessly on any device — install it on your home screen for a native-app feel.' },
            ].map(f => (
              <div key={f.title} className="feat-card">
                <div className="feat-icon" style={{ background: f.bg }}>{f.icon}</div>
                <h3 className="feat-h3">{f.title}</h3>
                <p className="feat-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="how">
          <div className="section-label">Workflows</div>
          <h2 className="section-h2" style={{ textAlign: 'center', marginBottom: '12px' }}>How it works</h2>
          <p className="section-sub" style={{ marginBottom: '44px' }}>Two roles, one seamless platform.</p>

          <div className="how-grid">
            <div className="how-col">
              <div className="how-col-title" style={{ color: '#3B82F6' }}>🧑‍💼 For Job Seekers</div>
              {[
                ['Sign in with Google', 'and select your role as Candidate.'],
                ['Upload your resume PDF.', 'Gemini parses it and fills your profile automatically.'],
                ['Browse matched jobs', 'ranked by AI similarity score with skill gap breakdowns.'],
                ['Apply in one tap', 'and track your application status in real time.'],
              ].map(([strong, rest], i) => (
                <div key={i} className="how-step">
                  <div className="how-step-num">{i + 1}</div>
                  <div className="how-step-text"><strong>{strong}</strong> {rest}</div>
                </div>
              ))}
            </div>
            <div className="how-col">
              <div className="how-col-title" style={{ color: '#06B6D4' }}>🏢 For Recruiters</div>
              {[
                ['Sign in with Google', 'and set up your company profile.'],
                ['Post a job', 'with required skills — AI generates a vector embedding for automatic matching.'],
                ['View ranked applicants', 'with match scores, skill tags, and full profile previews.'],
                ['Manage your pipeline', '— shortlist, reject, or review candidates with instant DB persistence.'],
              ].map(([strong, rest], i) => (
                <div key={i} className="how-step">
                  <div className="how-step-num">{i + 1}</div>
                  <div className="how-step-text"><strong>{strong}</strong> {rest}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-card">
            <h2 className="cta-h2">Ready to match smarter?</h2>
            <p className="cta-sub">
              Join HireMatch today. Sign in with Google and start discovering perfect-fit jobs or top talent — powered by AI.
            </p>
            <Link href="/login" className="btn-primary" style={{ display: 'inline-flex' }}>
              Get Started Free →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <span className="footer-text">© 2026 HireMatch. All rights reserved.</span>
          <span className="footer-text">Built with Next.js · Supabase · Gemini AI</span>
        </footer>
      </div>
    </>
  );
}
