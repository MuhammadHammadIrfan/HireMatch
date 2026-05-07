# HireMatch — System Architecture & Workflow Report

> Generated 2026-05-05 | Stack: **Next.js 16 · Supabase · Gemini AI · pgvector · Vercel**

---

## 1. Executive Summary

HireMatch is an **AI-powered recruitment platform** built as a full-stack, mobile-first Progressive Web App. It connects **Job Seekers (Candidates)** and **Recruiters** through a seamless workflow where:

- Candidates upload a resume PDF → Gemini AI parses it → a vector embedding is stored.
- Recruiters post jobs with required skills → Gemini AI embeds the job description.
- The platform runs **cosine similarity** (via Supabase `pgvector`) between resume and job embeddings to produce a **match score (0–100%)** and a **skill gap analysis**.
- Recruiters manage candidates through a **Kanban pipeline** (Applied → Reviewing → Shortlisted / Rejected) backed by a Postgres state-machine trigger.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 16 (App Router, React 19) |
| Styling | Tailwind CSS v4 |
| Database & Auth | Supabase (Postgres + GoTrue) |
| AI / LLM | Google Gemini (`gemini-2.0-flash`, `text-embedding-004`) |
| Vector Search | pgvector (Supabase extension) |
| Deployment | Vercel (Edge Functions + Serverless) |
| Monitoring | Sentry (error tracking) |
| Analytics | PostHog |
| PWA | `next-pwa` |

---

## 3. Database Schema

### 3.1 Core Tables

```
users           — Base auth identity (synced from Supabase Auth via trigger)
candidates      — Extended profile for job seekers (skills, resume, embedding)
recruiters      — Extended profile for hiring companies
jobs            — Job postings (skills, embedding, stats)
applications    — Junction: candidate ↔ job (status state machine)
match_scores    — Per-application AI score computed at apply time
skill_gaps      — Per-application missing skills with suggestions
notifications   — In-app notification log
recruiter_notes — Private recruiter notes on candidates
```

### 3.2 Key Columns

**`candidates`**
- `resume_url` — Supabase Storage path to uploaded PDF
- `resume_text` — Full extracted text (for AI)
- `resume_embedding` — 768-dim vector (pgvector `vector(768)`)
- `skills`, `work_experience`, `education` — Structured JSON parsed by Gemini

**`jobs`**
- `job_embedding` — 768-dim vector generated at job creation
- `applicant_count`, `avg_match_score` — Denormalized stats updated by trigger

**`applications`**
- `status` — `submitted | under_review | shortlisted | rejected`
- `match_score` — Cached percentage from `match_scores`
- `submitted_at`, `reviewed_at`, `shortlisted_at`, `rejected_at` — Audit timestamps

### 3.3 Automated Triggers

| Trigger | Event | Action |
|---|---|---|
| `on_auth_user_created` | INSERT on `auth.users` | Creates a corresponding row in `public.users` |
| `update_application_timestamps` | UPDATE on `applications` | Sets `reviewed_at`, `shortlisted_at`, or `rejected_at` when status changes |
| `update_job_stats_on_match` | INSERT on `match_scores` | Recomputes `applicant_count` and `avg_match_score` on the parent job |

---

## 4. Authentication & Role System

```mermaid
graph TD
    A[Visit App] --> B{Authenticated?}
    B -- No --> C[Landing Page / Login]
    C --> D[Google OAuth via Supabase]
    D --> E[/auth/callback]
    E --> F{Role set?}
    F -- No --> G[/register — Choose Role]
    G --> H1[Candidate Setup]
    G --> H2[Recruiter Setup + Company Details]
    H1 --> I1[/candidate/dashboard]
    H2 --> I2[/recruiter/dashboard]
    F -- Candidate --> I1
    F -- Recruiter --> I2
    B -- Yes --> J{Role?}
    J -- Candidate --> I1
    J -- Recruiter --> I2
```

### Middleware (`middleware.ts` → `proxy.ts`)
The `proxy.ts` file contains the Next.js middleware logic, exported as `middleware` via `middleware.ts`. It:
1. Refreshes the Supabase session on every request.
2. Blocks unauthenticated users from accessing protected routes.
3. Prevents cross-role access (e.g., candidates cannot visit `/recruiter/*`).
4. Redirects role-less authenticated users to `/register`.

### Row Level Security (RLS)
Every table has RLS enabled. Key policies:

| Table | Who can read | Who can write |
|---|---|---|
| `users` | Own record only, Recruiters (all, via admin client) | Own record only |
| `candidates` | Own record + Recruiters | Own record only |
| `jobs` | Anyone (active), Recruiter (own) | Recruiter (own) |
| `applications` | Candidate (own), Recruiter (via admin) | Candidate (insert own), Admin (status updates) |
| `match_scores` | Candidate (own), Admin | Admin only |

> **Note:** Status updates use `createAdminClient()` (service role key) server-side to bypass RLS, since the state machine is recruiter-driven but requires updating candidate-owned rows.

---

## 5. Candidate Workflow

### 5.1 Resume Upload & Profile Build

```
POST /api/resume/upload
    ↓
1. Receive PDF (multipart form)
2. Upload to Supabase Storage → get public URL
3. Extract raw text from PDF using pdf-parse
4. Send text to Gemini: "Parse this resume into JSON (skills, experience, education, summary)"
5. Parse Gemini response → structured ParsedResume object
6. Generate resume vector embedding: Gemini text-embedding-004(resume_text) → 768-dim vector
7. UPSERT candidates row: skills, work_experience, education, resume_embedding
8. Compute profile_strength score (0–100) based on completeness
9. Return success + parsed data to client
```

### 5.2 Job Discovery & Match Scoring

```
GET /candidate/jobs
    ↓
1. Fetch candidate's resume_embedding from candidates table
2. Call Supabase RPC: match_jobs_for_candidate(embedding, threshold=0.3, count=20)
   - This runs: SELECT *, 1 - (job_embedding <=> candidate_embedding) AS similarity FROM jobs
3. Return ranked list sorted by similarity score (converted to 0–100%)
```

### 5.3 Applying to a Job

```
POST /candidate/apply/[jobId]
    ↓
1. Verify user is authenticated (candidate)
2. Generate job-specific match data:
   a. Fetch job requirements + candidate profile
   b. Call Gemini: analyse skill gaps between job and candidate
   c. Parse skill_gaps array (name, importance, suggestion)
3. INSERT into applications (candidate_id, job_id, status='submitted')
4. INSERT into match_scores (application_id, score, score_raw)
   → Triggers: update_job_stats_on_match fires → updates jobs.applicant_count + avg_match_score
5. INSERT skill_gaps records
6. UPDATE applications.match_score = score (denormalized cache)
7. Redirect to application confirmation
```

> ⚠️ Steps 4–6 use `createAdminClient()` to bypass RLS because the candidate's own row must be written by a system process.

### 5.4 Application Status Tracking

Candidates can view their applications at `/candidate/applications` and see:
- Current status badge (Submitted / Under Review / Shortlisted / Rejected)
- Match score percentage
- Skill gap list

---

## 6. Recruiter Workflow

### 6.1 Job Posting

```
POST /recruiter/jobs/new
    ↓
1. Collect: title, description, department, location, employment_type, skills[], salary_range
2. Build job description text: title + description + skills list
3. Generate job_embedding: Gemini text-embedding-004(job_description_text) → 768-dim vector
4. INSERT into jobs (recruiter_id, ...fields, job_embedding, status='active')
```

> This embedding is what candidates are later matched against.

### 6.2 Viewing Applicants (Candidate Ranking)

```
GET /recruiter/jobs/[jobId]/candidates
    ↓
1. Fetch job record (with createClient, own job)
2. Fetch applications using createAdminClient():
   SELECT *, candidates(id, skills, headline, work_experience, education,
            profile_strength, resume_url, users(full_name, avatar_url, email)),
            match_scores(score, score_raw),
            skill_gaps(skill_name, importance)
   WHERE job_id = jobId
   ORDER BY match_score DESC
3. Render CandidateRankingClient — sortable by Match % or Name
```

### 6.3 Updating Application Status

```
Recruiter clicks status button (e.g. "Move to Review")
    ↓
1. Client calls Server Action: updateApplicationStatus(appId, newStatus)
2. Server Action uses createAdminClient():
   UPDATE applications SET status = newStatus WHERE id = appId
3. Postgres trigger fires automatically:
   - status → 'under_review': sets reviewed_at = NOW()
   - status → 'shortlisted': sets shortlisted_at = NOW()
   - status → 'rejected':    sets rejected_at = NOW()
4. Server Action returns success
5. React state updated → UI reflects new status badge instantly
```

**Valid state transitions:**
```
submitted → under_review | rejected
under_review → shortlisted | rejected
shortlisted → (terminal)
rejected → (terminal)
```

### 6.4 Pipeline (Kanban View)

```
GET /recruiter/pipeline
    ↓
1. Fetch all applications for recruiter's jobs using createAdminClient() with join to users
2. Group by status into 4 columns: Applied | Reviewing | Shortlisted | Rejected
3. Render PipelineClient — horizontal scrollable Kanban board
4. Each card shows: Avatar, Name, Headline, Job Title, Match Score badge
5. Click card → navigate to full candidate profile
```

### 6.5 Candidate Profile View

```
GET /recruiter/candidates/[id]?jobId=...&appId=...
    ↓
1. Fetch candidates record (with createClient — recruiter can read via RLS policy)
2. Fetch users record using createAdminClient() (bypasses users RLS restriction)
3. Fetch application record (optional, if appId provided)
4. Fetch skill_gaps for this application
5. Render CandidateProfileViewClient with:
   - Name, avatar, headline, profile strength
   - Skills tags
   - Work experience timeline
   - Education
   - Match score + skill gap breakdown
   - Application status + timestamps
```

---

## 7. AI Integration Details

### 7.1 Gemini Models Used

| Purpose | Model |
|---|---|
| Resume parsing (JSON extraction) | `gemini-2.0-flash` |
| Skill gap analysis | `gemini-2.0-flash` |
| Text embeddings (resume + job) | `text-embedding-004` |

### 7.2 Embedding Strategy

Both resumes and job descriptions are embedded into a **768-dimensional vector space** using Gemini's `text-embedding-004` model. The similarity between a candidate and a job is computed using **cosine distance** via pgvector:

```sql
1 - (job_embedding <=> candidate_embedding) AS similarity_score
```

A score of `1.0` = perfect match, `0.0` = completely unrelated.

### 7.3 Retry Logic

The `lib/gemini.ts` module implements:
- 3-attempt retry loop with exponential back-off for transient API errors.
- Automatic model fallback: `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash`.

---

## 8. API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/resume/upload` | POST | Upload PDF, parse with Gemini, store embedding |
| `/api/jobs/embed` | POST | Generate and store job embedding after creation |
| `/auth/callback` | GET | Supabase OAuth callback handler |

---

## 9. Deployment Architecture

```
Browser
  ↓ HTTPS
Vercel Edge Network
  ↓ middleware.ts (proxy.ts) — Auth check, role-based routing
  ↓
Next.js App Router (Serverless Functions on Vercel)
  ├── Server Components — Data fetching (Supabase SSR client)
  ├── Server Actions   — Mutations (Admin client for privileged writes)
  └── API Routes       — File uploads, AI calls
          ↓
  Supabase (Postgres + Storage + Auth + pgvector)
          ↓
  Google Gemini API   — LLM parsing + embeddings
```

### Environment Variables Required

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key (server-side only) |
| `GEMINI_API_KEY` | Google Gemini API access |
| `SENTRY_DSN` | Sentry error reporting |

---

## 10. Security Model Summary

- **Google OAuth only** — no password storage, no email/password attack surface.
- **RLS on all tables** — Supabase enforces row-level isolation by default.
- **Service Role Key server-side only** — Never exposed to client; only used in Server Actions and API Routes.
- **Middleware guards** — Every protected route is checked at the edge before rendering.
- **No sensitive data in client components** — All auth checks happen in Server Components.
