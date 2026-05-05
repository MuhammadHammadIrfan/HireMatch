# HireMatch 🚀

HireMatch is an AI-powered job matching Progressive Web App (PWA) built to connect top candidates with the right opportunities using semantic resume analysis and NLP scoring.

Built with **Next.js 14**, **Supabase (PostgreSQL + pgvector)**, **Gemini AI**, and **Tailwind CSS**.

---

## Features
- **Role-Based Architecture:** Dedicated dashboards and workflows for both Candidates and Recruiters.
- **AI Resume Parsing:** Automatically extracts skills, experience, and education from PDF/DOCX resumes using Gemini.
- **Semantic Job Matching:** Uses `pgvector` to compute cosine similarity between a candidate's resume and job requirements to generate a Match Score.
- **Skill Gap Analysis:** Highlights missing skills and uses AI to provide actionable learning suggestions.
- **Progressive Web App (PWA):** Installable on mobile devices with a native app-like experience.
- **Recruiter Pipeline:** Kanban-style candidate tracking and state machine status updates.

---

## Tech Stack
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Google OAuth)
- **AI/ML:** Google Gemini API (`gemini-2.0-flash` / `gemini-1.5-flash` for parsing/logic, `text-embedding-004` for vector embeddings)
- **Styling:** Tailwind CSS
- **Analytics & Monitoring:** PostHog (Analytics/Replay), Sentry (Error Tracking)

---

## Local Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/MuhammadHammadIrfan/HireMatch.git
cd hirematch-app
npm install
```

### 2. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** and execute the entire contents of `supabase/schema.sql`. This will:
   - Enable the `pgvector` extension.
   - Create all necessary tables, ENUMs, and triggers.
   - Setup Row Level Security (RLS) policies.
   - Create the `match_jobs_for_candidate` PostgreSQL function.
3. Go to **Authentication -> Providers** and enable **Google**. You will need a Google Client ID and Secret. 
   - Add `http://localhost:3000/auth/callback` as a redirect URI in your Google Cloud Console.

### 3. Environment Variables
Copy the `.env.local.example` file to `.env.local` and fill in the values:
```bash
cp .env.local.example .env.local
```

Required keys:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Deployment (Vercel)

This application is optimized for Vercel deployment.

1. Push your code to GitHub.
2. Import the project into Vercel.
3. Add all your environment variables in the Vercel project settings.
4. **Important:** Add your deployed Vercel URL (e.g., `https://your-app.vercel.app/auth/callback`) to your Google Cloud Console OAuth allowed redirect URIs and Supabase Authentication URL Configuration.

### Sentry & PostHog Configuration (Optional but Recommended)
The application includes integrations for Sentry and PostHog.
- **Missing Keys:** If you do not provide PostHog or Sentry keys in your `.env`, the application will **not** crash. The integrations will simply remain inactive.
- **Vercel + Sentry:** To upload source maps to Sentry during a Vercel build, go to the Vercel Marketplace, search for "Sentry", and install the integration. It will automatically inject the required `SENTRY_AUTH_TOKEN` into your Vercel build environment. No manual configuration needed!

---

## Project Structure
- `/app/(auth)`: Login, registration, and verification flows.
- `/app/(candidate)`: Protected routes for candidates (dashboard, resume, jobs).
- `/app/(recruiter)`: Protected routes for recruiters (dashboard, pipeline, job posting).
- `/app/api`: Serverless API routes for AI inference and webhooks.
- `/components`: Reusable UI components and feature-specific blocks.
- `/lib`: Supabase clients, Gemini API helpers, matching logic, and typed analytics.
- `/supabase`: Contains the master `schema.sql`.

---

## License
MIT License
