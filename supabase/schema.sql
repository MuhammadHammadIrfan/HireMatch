-- ============================================================
-- HireMatch — Complete Supabase SQL Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- Prerequisites: pgvector extension must be enabled
-- ============================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- ENUMS
-- ============================================================

-- Application status state machine: SUBMITTED → UNDER_REVIEW → SHORTLISTED | REJECTED
CREATE TYPE application_status AS ENUM (
  'submitted',
  'under_review',
  'shortlisted',
  'rejected'
);

-- Job status
CREATE TYPE job_status AS ENUM (
  'draft',
  'active',
  'closed'
);

-- Skill importance level
CREATE TYPE skill_importance AS ENUM (
  'high',
  'medium',
  'low'
);

-- User role
CREATE TYPE user_role AS ENUM (
  'candidate',
  'recruiter'
);

-- ============================================================
-- TABLES
-- ============================================================

-- users: mirrors auth.users, stores role + public profile
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  role          user_role,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- candidates: extended profile for job seekers
CREATE TABLE public.candidates (
  id                UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  headline          TEXT,
  profile_strength  INTEGER DEFAULT 0 CHECK (profile_strength BETWEEN 0 AND 100),
  skills            TEXT[] DEFAULT '{}',
  resume_url        TEXT,
  resume_filename   TEXT,
  resume_text       TEXT,
  resume_uploaded_at TIMESTAMPTZ,
  work_experience   JSONB DEFAULT '[]',  -- [{title, company, start_date, end_date, description}]
  education         JSONB DEFAULT '[]',  -- [{degree, school, year, field}]
  resume_embedding  VECTOR(768),         -- Gemini text-embedding-004 (768 dims)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- recruiters: extended profile for hiring managers
CREATE TABLE public.recruiters (
  id            UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  company_name  TEXT,
  company_size  TEXT,
  industry      TEXT,
  website       TEXT,
  logo_url      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- jobs: job postings by recruiters
CREATE TABLE public.jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id    UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  department      TEXT,
  employment_type TEXT,
  location        TEXT,
  is_remote       BOOLEAN DEFAULT FALSE,
  description     TEXT,
  requirements    TEXT[] DEFAULT '{}',
  experience_level TEXT,
  salary_range    TEXT,
  status          job_status NOT NULL DEFAULT 'draft',
  skills          JSONB DEFAULT '[]',   -- [{name, importance: high|medium|low}]
  job_embedding   VECTOR(768),          -- Gemini embedding of job description
  applicant_count INTEGER DEFAULT 0,
  avg_match_score INTEGER DEFAULT 0,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- applications: candidate → job join table with state machine
CREATE TABLE public.applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id    UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_id          UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  status          application_status NOT NULL DEFAULT 'submitted',
  match_score     INTEGER CHECK (match_score BETWEEN 0 AND 100),
  cover_note      TEXT,
  reference_code  TEXT UNIQUE DEFAULT 'APP-' || UPPER(SUBSTR(gen_random_uuid()::TEXT, 1, 8)),
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ,
  shortlisted_at  TIMESTAMPTZ,
  rejected_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);

-- match_scores: cached per-application cosine similarity scores
CREATE TABLE public.match_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE UNIQUE,
  score           INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  score_raw       FLOAT,    -- raw cosine similarity 0.0–1.0
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- skill_gaps: per-application missing skills with importance
CREATE TABLE public.skill_gaps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  skill_name      TEXT NOT NULL,
  importance      skill_importance NOT NULL DEFAULT 'medium',
  suggestion      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- notifications: in-app notification queue
CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,  -- 'status_change' | 'new_match' | 'shortlisted' | 'rejected'
  title           TEXT NOT NULL,
  body            TEXT,
  data            JSONB DEFAULT '{}',
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- recruiter_notes: internal notes on candidates
CREATE TABLE public.recruiter_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id    UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
  candidate_id    UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  application_id  UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Vector similarity search indexes (IVFFlat for approximate nearest neighbor)
CREATE INDEX idx_candidates_resume_embedding ON public.candidates
  USING ivfflat (resume_embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_jobs_job_embedding ON public.jobs
  USING ivfflat (job_embedding vector_cosine_ops) WITH (lists = 100);

-- Performance indexes
CREATE INDEX idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_jobs_recruiter_id ON public.jobs(recruiter_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, is_read);
CREATE INDEX idx_skill_gaps_application_id ON public.skill_gaps(application_id);

-- ============================================================
-- STATE MACHINE TRIGGER
-- Enforces: submitted → under_review → shortlisted | rejected
-- Rejected and shortlisted are terminal states
-- ============================================================

CREATE OR REPLACE FUNCTION validate_application_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  valid_transitions JSONB := '{
    "submitted":    ["under_review", "rejected"],
    "under_review": ["shortlisted", "rejected"],
    "shortlisted":  [],
    "rejected":     []
  }';
BEGIN
  -- Allow same-status updates (no-op transitions)
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  -- Check if the new status is in the allowed transitions
  IF NOT (valid_transitions->OLD.status::TEXT) @> to_jsonb(NEW.status::TEXT) THEN
    RAISE EXCEPTION 'Invalid status transition: % → %. Allowed: %',
      OLD.status, NEW.status, valid_transitions->OLD.status::TEXT;
  END IF;

  -- Set timestamps for status changes
  CASE NEW.status
    WHEN 'under_review' THEN NEW.reviewed_at = NOW();
    WHEN 'shortlisted'  THEN NEW.shortlisted_at = NOW();
    WHEN 'rejected'     THEN NEW.rejected_at = NOW();
    ELSE NULL;
  END CASE;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_application_status_machine
  BEFORE UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE FUNCTION validate_application_status_transition();

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at       BEFORE UPDATE ON public.users       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at  BEFORE UPDATE ON public.candidates  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recruiters_updated_at  BEFORE UPDATE ON public.recruiters  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at        BEFORE UPDATE ON public.jobs        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- HANDLE NEW USER TRIGGER
-- Automatically creates a users row on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEMANTIC MATCHING FUNCTION
-- Returns ranked candidates for a job using cosine similarity
-- ============================================================

CREATE OR REPLACE FUNCTION match_candidates_for_job(
  p_job_id    UUID,
  p_threshold FLOAT DEFAULT 0.4,
  p_limit     INTEGER DEFAULT 50
)
RETURNS TABLE (
  candidate_id  UUID,
  score_int     INTEGER,
  score_raw     FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS candidate_id,
    ROUND((1 - (c.resume_embedding <=> j.job_embedding)) * 100)::INTEGER AS score_int,
    (1 - (c.resume_embedding <=> j.job_embedding)) AS score_raw
  FROM public.candidates c
  CROSS JOIN public.jobs j
  WHERE j.id = p_job_id
    AND c.resume_embedding IS NOT NULL
    AND j.job_embedding IS NOT NULL
    AND (1 - (c.resume_embedding <=> j.job_embedding)) >= p_threshold
  ORDER BY score_raw DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Find similar jobs for a candidate
CREATE OR REPLACE FUNCTION match_jobs_for_candidate(
  p_candidate_id  UUID,
  p_threshold     FLOAT DEFAULT 0.4,
  p_limit         INTEGER DEFAULT 20
)
RETURNS TABLE (
  job_id      UUID,
  score_int   INTEGER,
  score_raw   FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id AS job_id,
    ROUND((1 - (j.job_embedding <=> c.resume_embedding)) * 100)::INTEGER AS score_int,
    (1 - (j.job_embedding <=> c.resume_embedding)) AS score_raw
  FROM public.jobs j
  CROSS JOIN public.candidates c
  WHERE c.id = p_candidate_id
    AND c.resume_embedding IS NOT NULL
    AND j.job_embedding IS NOT NULL
    AND j.status = 'active'
    AND (1 - (j.job_embedding <=> c.resume_embedding)) >= p_threshold
  ORDER BY score_raw DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Update avg match score on jobs table after match_scores insert/update
CREATE OR REPLACE FUNCTION update_job_avg_match()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.jobs SET
    avg_match_score = (
      SELECT ROUND(AVG(ms.score))
      FROM public.match_scores ms
      JOIN public.applications a ON a.id = ms.application_id
      WHERE a.job_id = (SELECT job_id FROM public.applications WHERE id = NEW.application_id)
    ),
    applicant_count = (
      SELECT COUNT(*)
      FROM public.applications a
      WHERE a.job_id = (SELECT job_id FROM public.applications WHERE id = NEW.application_id)
    )
  WHERE id = (SELECT job_id FROM public.applications WHERE id = NEW.application_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_stats_on_match
  AFTER INSERT OR UPDATE ON public.match_scores
  FOR EACH ROW EXECUTE FUNCTION update_job_avg_match();

-- ============================================================
-- NOTIFICATION TRIGGER (status changes)
-- ============================================================

CREATE OR REPLACE FUNCTION notify_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_job_title TEXT;
  v_msg       TEXT;
BEGIN
  SELECT title INTO v_job_title FROM public.jobs WHERE id = NEW.job_id;

  CASE NEW.status
    WHEN 'under_review' THEN v_msg := 'Your application for ' || v_job_title || ' is now under review.';
    WHEN 'shortlisted'  THEN v_msg := '🎉 You have been shortlisted for ' || v_job_title || '!';
    WHEN 'rejected'     THEN v_msg := 'Your application for ' || v_job_title || ' was not selected.';
    ELSE v_msg := NULL;
  END CASE;

  IF v_msg IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      NEW.candidate_id,
      'status_change',
      'Application Update',
      v_msg,
      jsonb_build_object('application_id', NEW.id, 'job_id', NEW.job_id, 'status', NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER send_status_notification
  AFTER UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE FUNCTION notify_on_status_change();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiters       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_scores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_gaps       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_notes  ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "Users can read own record"  ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- CANDIDATES
CREATE POLICY "Candidates read own profile"      ON public.candidates FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Candidates update own profile"    ON public.candidates FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Candidates insert own profile"    ON public.candidates FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Recruiters read candidate profiles" ON public.candidates FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.recruiters WHERE id = auth.uid()));

-- RECRUITERS
CREATE POLICY "Recruiters read own profile"      ON public.recruiters FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Recruiters update own profile"    ON public.recruiters FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Recruiters insert own profile"    ON public.recruiters FOR INSERT WITH CHECK (auth.uid() = id);

-- JOBS
CREATE POLICY "Anyone reads active jobs"         ON public.jobs FOR SELECT USING (status = 'active');
CREATE POLICY "Recruiters read own jobs"         ON public.jobs FOR SELECT USING (recruiter_id = auth.uid());
CREATE POLICY "Recruiters insert jobs"           ON public.jobs FOR INSERT WITH CHECK (recruiter_id = auth.uid());
CREATE POLICY "Recruiters update own jobs"       ON public.jobs FOR UPDATE USING (recruiter_id = auth.uid());
CREATE POLICY "Recruiters delete own jobs"       ON public.jobs FOR DELETE USING (recruiter_id = auth.uid());

-- APPLICATIONS
CREATE POLICY "Candidates read own applications" ON public.applications FOR SELECT USING (candidate_id = auth.uid());
CREATE POLICY "Candidates insert applications"   ON public.applications FOR INSERT WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "Recruiters read their job apps"   ON public.applications FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND recruiter_id = auth.uid()));
CREATE POLICY "Recruiters update application status" ON public.applications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND recruiter_id = auth.uid()));

-- MATCH SCORES
CREATE POLICY "Candidates read own match scores"  ON public.match_scores FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.applications WHERE id = application_id AND candidate_id = auth.uid()));
CREATE POLICY "Recruiters read match scores"      ON public.match_scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = application_id AND j.recruiter_id = auth.uid()
  ));

-- SKILL GAPS
CREATE POLICY "Candidates read own skill gaps"   ON public.skill_gaps FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.applications WHERE id = application_id AND candidate_id = auth.uid()));
CREATE POLICY "Recruiters read skill gaps"        ON public.skill_gaps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = application_id AND j.recruiter_id = auth.uid()
  ));

-- NOTIFICATIONS
CREATE POLICY "Users read own notifications"     ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications"   ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- RECRUITER NOTES
CREATE POLICY "Recruiters read own notes"        ON public.recruiter_notes FOR SELECT USING (recruiter_id = auth.uid());
CREATE POLICY "Recruiters insert notes"          ON public.recruiter_notes FOR INSERT WITH CHECK (recruiter_id = auth.uid());
CREATE POLICY "Recruiters delete own notes"      ON public.recruiter_notes FOR DELETE USING (recruiter_id = auth.uid());

-- ============================================================
-- STORAGE BUCKET (run separately or via Supabase Dashboard)
-- ============================================================
-- Create a storage bucket named 'resumes' with:
--   public: false
--   file size limit: 5MB
--   allowed MIME: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  5242880,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS: candidates can upload/read their own resumes
CREATE POLICY "Candidates upload own resumes" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "Candidates read own resumes" ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

-- Service role can read all resumes (for parsing)
CREATE POLICY "Service role reads all resumes" ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes');
