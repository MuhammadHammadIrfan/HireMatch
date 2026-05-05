import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue: #4F8EF7;
          --blue-dim: rgba(79,142,247,0.15);
          --purple: #9B6FF5;
          --green: #34D399;
          --amber: #FBBF24;
          --bg: #0B0F1A;
          --card: rgba(255,255,255,0.05);
          --border: rgba(255,255,255,0.08);
          --text: #F0F4FF;
          --muted: rgba(240,244,255,0.5);
        }

        .land-root {
          font-family: 'Inter', system-ui, sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* === Animated gradient orbs === */
        .orb-wrap {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }
        .orb {
          position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.25;
        }
        .orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, #4F8EF7 0%, transparent 70%);
          top: -200px; left: -150px;
          animation: orbFloat1 18s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #9B6FF5 0%, transparent 70%);
          top: 30%; right: -150px;
          animation: orbFloat2 22s ease-in-out infinite alternate;
        }
        .orb-3 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #34D399 0%, transparent 70%);
          bottom: -100px; left: 30%;
          animation: orbFloat3 25s ease-in-out infinite alternate;
        }
        @keyframes orbFloat1 { from { transform: translate(0,0) scale(1); } to { transform: translate(80px, 60px) scale(1.1); } }
        @keyframes orbFloat2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-60px, 80px) scale(0.95); } }
        @keyframes orbFloat3 { from { transform: translate(0,0) scale(1); } to { transform: translate(-80px, -40px) scale(1.05); } }

        /* === Nav === */
        .nav {
          position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 32px;
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(20px);
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-size: 20px; font-weight: 900; color: var(--text); text-decoration: none;
        }
        .logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #4F8EF7, #9B6FF5);
          display: flex; align-items: center; justify-content: center;
        }
        .nav-cta {
          display: inline-flex; align-items: center; gap-8px;
          padding: 9px 20px; border-radius: 8px;
          background: linear-gradient(135deg, #4F8EF7, #9B6FF5);
          color: #fff; font-size: 14px; font-weight: 700;
          text-decoration: none; transition: opacity 0.2s, transform 0.2s;
        }
        .nav-cta:hover { opacity: 0.9; transform: translateY(-1px); }

        /* === Hero === */
        .hero {
          position: relative; z-index: 5;
          text-align: center;
          padding: 100px 24px 80px;
          max-width: 900px; margin: 0 auto;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid rgba(79,142,247,0.4);
          background: rgba(79,142,247,0.08);
          color: var(--blue); font-size: 12px; font-weight: 600;
          padding: 6px 14px; border-radius: 999px; margin-bottom: 28px;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--blue);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
        .hero-h1 {
          font-size: clamp(42px, 8vw, 80px);
          font-weight: 900; line-height: 1.05;
          letter-spacing: -2px;
          margin-bottom: 24px;
        }
        .hero-h1 .grad {
          background: linear-gradient(135deg, #4F8EF7 0%, #9B6FF5 50%, #34D399 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: clamp(16px, 2.5vw, 20px);
          color: var(--muted); max-width: 600px; margin: 0 auto 44px;
          line-height: 1.7;
        }
        .hero-actions {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 16px;
        }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 32px; border-radius: 12px;
          background: linear-gradient(135deg, #4F8EF7, #9B6FF5);
          color: #fff; font-size: 16px; font-weight: 800;
          text-decoration: none;
          box-shadow: 0 8px 32px rgba(79,142,247,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 48px rgba(79,142,247,0.5); }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 16px 28px; border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--card); backdrop-filter: blur(12px);
          color: var(--text); font-size: 15px; font-weight: 600;
          text-decoration: none; transition: border-color 0.2s, background 0.2s;
        }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); }

        /* === Stats bar === */
        .stats {
          position: relative; z-index: 5;
          display: flex; flex-wrap: wrap; justify-content: center; gap: 0;
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          max-width: 800px; margin: 0 auto;
        }
        .stat-item {
          flex: 1; min-width: 150px; padding: 24px 20px; text-align: center;
          border-right: 1px solid var(--border);
        }
        .stat-item:last-child { border-right: none; }
        .stat-num { font-size: 28px; font-weight: 900; }
        .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; }

        /* === Features === */
        .features {
          position: relative; z-index: 5;
          max-width: 1100px; margin: 0 auto; padding: 100px 24px;
        }
        .section-label {
          text-align: center; font-size: 12px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: var(--blue); margin-bottom: 16px;
        }
        .section-h2 {
          text-align: center; font-size: clamp(28px, 4vw, 44px);
          font-weight: 900; margin-bottom: 12px; letter-spacing: -1px;
        }
        .section-sub {
          text-align: center; color: var(--muted); font-size: 16px; margin-bottom: 56px;
        }
        .features-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;
        }
        .feat-card {
          border: 1px solid var(--border);
          background: var(--card); backdrop-filter: blur(12px);
          border-radius: 16px; padding: 28px;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .feat-card:hover {
          border-color: rgba(79,142,247,0.4); transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .feat-icon {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; margin-bottom: 16px;
        }
        .feat-h3 { font-size: 17px; font-weight: 800; margin-bottom: 8px; }
        .feat-p { font-size: 14px; color: var(--muted); line-height: 1.7; }

        /* === How it works === */
        .how {
          position: relative; z-index: 5;
          max-width: 900px; margin: 0 auto; padding: 0 24px 100px;
        }
        .how-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 32px;
        }
        @media (max-width: 640px) { .how-grid { grid-template-columns: 1fr; } }
        .how-col { border: 1px solid var(--border); background: var(--card); border-radius: 20px; padding: 32px; }
        .how-col-title {
          font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border);
        }
        .how-step { display: flex; gap: 14px; margin-bottom: 20px; }
        .how-step-num {
          width: 26px; height: 26px; border-radius: 50%;
          background: linear-gradient(135deg, #4F8EF7, #9B6FF5);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 900; flex-shrink: 0;
        }
        .how-step-text { font-size: 14px; color: var(--muted); line-height: 1.6; }
        .how-step-text strong { color: var(--text); }

        /* === CTA === */
        .cta-section {
          position: relative; z-index: 5;
          max-width: 700px; margin: 0 auto;
          padding: 0 24px 120px; text-align: center;
        }
        .cta-card {
          border: 1px solid rgba(79,142,247,0.3);
          background: linear-gradient(135deg, rgba(79,142,247,0.08), rgba(155,111,245,0.08));
          backdrop-filter: blur(20px); border-radius: 24px;
          padding: 60px 40px;
        }
        .cta-h2 { font-size: 36px; font-weight: 900; margin-bottom: 12px; letter-spacing: -1px; }
        .cta-sub { color: var(--muted); font-size: 16px; margin-bottom: 36px; line-height: 1.6; }

        /* === Footer === */
        .footer {
          position: relative; z-index: 5;
          border-top: 1px solid var(--border);
          padding: 24px 32px;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .footer-text { font-size: 13px; color: var(--muted); }

        @media (max-width: 480px) {
          .nav { padding: 16px 20px; }
          .hero { padding: 72px 20px 60px; }
          .hero-h1 { letter-spacing: -1px; }
          .cta-card { padding: 40px 24px; }
        }
      `}</style>

      <div className="land-root">
        {/* Background orbs */}
        <div className="orb-wrap">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        {/* Nav */}
        <nav className="nav">
          <Link href="/" className="nav-logo">
            <div className="logo-icon">
              <svg width={20} height={20} viewBox="0 0 48 48" fill="none">
                <rect x="6" y="16" width="36" height="26" rx="5" fill="white" fillOpacity="0.9"/>
                <rect x="16" y="10" width="16" height="10" rx="3" fill="white"/>
                <circle cx="36" cy="12" r="8" fill="#FBBF24"/>
                <path d="M33 12l2 2 4-4" stroke="#0B0F1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
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
              <svg width={20} height={20} viewBox="0 0 48 48">
                <path fill="#fff" fillOpacity=".7" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              </svg>
              Continue with Google
            </Link>
            <Link href="#features" className="btn-secondary">
              Explore Features ↓
            </Link>
          </div>
        </section>

        {/* Stats */}
        <div className="stats">
          <div className="stat-item">
            <div className="stat-num" style={{ color: '#4F8EF7' }}>AI</div>
            <div className="stat-label">Powered Matching</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" style={{ color: '#9B6FF5' }}>pgvector</div>
            <div className="stat-label">Cosine Similarity</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" style={{ color: '#34D399' }}>Real-time</div>
            <div className="stat-label">Pipeline Kanban</div>
          </div>
          <div className="stat-item">
            <div className="stat-num" style={{ color: '#FBBF24' }}>100%</div>
            <div className="stat-label">Serverless & Secure</div>
          </div>
        </div>

        {/* Features */}
        <section className="features" id="features">
          <div className="section-label">What We Do</div>
          <h2 className="section-h2">Everything you need to hire well</h2>
          <p className="section-sub">From resume upload to shortlist — fully automated, fully intelligent.</p>

          <div className="features-grid">
            <div className="feat-card">
              <div className="feat-icon" style={{ background: 'rgba(79,142,247,0.12)' }}>🧠</div>
              <h3 className="feat-h3">AI Resume Parsing</h3>
              <p className="feat-p">Gemini AI extracts skills, experience, and education from any resume PDF in seconds, building a rich structured candidate profile.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon" style={{ background: 'rgba(155,111,245,0.12)' }}>⚡</div>
              <h3 className="feat-h3">Smart Job Matching</h3>
              <p className="feat-p">Vector embeddings power cosine similarity scoring between job descriptions and candidate profiles, delivering ranked match percentages.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon" style={{ background: 'rgba(52,211,153,0.12)' }}>📊</div>
              <h3 className="feat-h3">Skill Gap Analysis</h3>
              <p className="feat-p">Candidates see exactly which required skills they're missing for each job, with actionable suggestions on how to close the gap.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon" style={{ background: 'rgba(251,191,36,0.12)' }}>🎯</div>
              <h3 className="feat-h3">Recruiter Pipeline</h3>
              <p className="feat-p">A Kanban-style board lets recruiters move candidates through Applied → Reviewing → Shortlisted → Rejected with one tap.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>🔒</div>
              <h3 className="feat-h3">Row-Level Security</h3>
              <p className="feat-p">Every data access is governed by Supabase RLS policies. Candidates only see their own data; recruiters only see their own jobs.</p>
            </div>
            <div className="feat-card">
              <div className="feat-icon" style={{ background: 'rgba(79,142,247,0.12)' }}>📱</div>
              <h3 className="feat-h3">Mobile-First PWA</h3>
              <p className="feat-p">A Progressive Web App experience works seamlessly on any device — install it on your home screen for a native-app feel.</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="how">
          <div className="section-label">Workflows</div>
          <h2 className="section-h2" style={{ textAlign: 'center', marginBottom: '12px' }}>How it works</h2>
          <p className="section-sub" style={{ marginBottom: '40px' }}>Two roles, one seamless platform.</p>

          <div className="how-grid">
            <div className="how-col">
              <div className="how-col-title" style={{ color: '#4F8EF7' }}>🧑‍💼 For Job Seekers</div>
              <div className="how-step">
                <div className="how-step-num">1</div>
                <div className="how-step-text"><strong>Sign in with Google</strong> and select your role as Candidate.</div>
              </div>
              <div className="how-step">
                <div className="how-step-num">2</div>
                <div className="how-step-text"><strong>Upload your resume PDF.</strong> Gemini parses it and fills your profile automatically.</div>
              </div>
              <div className="how-step">
                <div className="how-step-num">3</div>
                <div className="how-step-text"><strong>Browse matched jobs</strong> ranked by AI similarity score with skill gap breakdowns.</div>
              </div>
              <div className="how-step">
                <div className="how-step-num">4</div>
                <div className="how-step-text"><strong>Apply in one tap</strong> and track your application status in real time.</div>
              </div>
            </div>
            <div className="how-col">
              <div className="how-col-title" style={{ color: '#9B6FF5' }}>🏢 For Recruiters</div>
              <div className="how-step">
                <div className="how-step-num">1</div>
                <div className="how-step-text"><strong>Sign in with Google</strong> and set up your company profile.</div>
              </div>
              <div className="how-step">
                <div className="how-step-num">2</div>
                <div className="how-step-text"><strong>Post a job</strong> with required skills — AI generates a vector embedding for automatic matching.</div>
              </div>
              <div className="how-step">
                <div className="how-step-num">3</div>
                <div className="how-step-text"><strong>View ranked applicants</strong> with match scores, skill tags, and full profile previews.</div>
              </div>
              <div className="how-step">
                <div className="how-step-num">4</div>
                <div className="how-step-text"><strong>Manage your pipeline</strong> — shortlist, reject, or review candidates with instant DB persistence.</div>
              </div>
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
