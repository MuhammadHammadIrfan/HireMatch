// ============================================================
// HireMatch TypeScript Types
// ============================================================

export type UserRole = 'candidate' | 'recruiter';

export type ApplicationStatus = 'submitted' | 'under_review' | 'shortlisted' | 'rejected';
export type JobStatus = 'draft' | 'active' | 'closed';
export type SkillImportance = 'high' | 'medium' | 'low';

// ── DB Row Types ──────────────────────────────────────────

export interface DBUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  created_at: string;
  updated_at: string;
}

export interface DBCandidate {
  id: string;
  headline: string | null;
  profile_strength: number;
  skills: string[];
  resume_url: string | null;
  resume_filename: string | null;
  resume_text: string | null;
  resume_uploaded_at: string | null;
  work_experience: WorkExperience[];
  education: Education[];
  resume_embedding: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface DBRecruiter {
  id: string;
  company_name: string | null;
  company_size: string | null;
  industry: string | null;
  website: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBJob {
  id: string;
  recruiter_id: string;
  title: string;
  department: string | null;
  employment_type: string | null;
  location: string | null;
  is_remote: boolean;
  description: string | null;
  requirements: string[];
  experience_level: string | null;
  salary_range: string | null;
  status: JobStatus;
  skills: JobSkill[];
  job_embedding: number[] | null;
  applicant_count: number;
  avg_match_score: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBApplication {
  id: string;
  candidate_id: string;
  job_id: string;
  status: ApplicationStatus;
  match_score: number | null;
  cover_note: string | null;
  reference_code: string;
  submitted_at: string;
  reviewed_at: string | null;
  shortlisted_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBMatchScore {
  id: string;
  application_id: string;
  score: number;
  score_raw: number;
  computed_at: string;
}

export interface DBSkillGap {
  id: string;
  application_id: string;
  skill_name: string;
  importance: SkillImportance;
  suggestion: string | null;
  created_at: string;
}

export interface DBNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

// ── Nested Types ─────────────────────────────────────────

export interface WorkExperience {
  title: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description?: string;
}

export interface Education {
  degree: string;
  school: string;
  year: string;
  field?: string;
}

export interface JobSkill {
  name: string;
  importance: SkillImportance;
}

// ── View/Composite Types ──────────────────────────────────

export interface CandidateProfile extends DBCandidate {
  user: DBUser;
}

export interface RecruiterProfile extends DBRecruiter {
  user: DBUser;
}

export interface JobWithRecruiter extends DBJob {
  recruiter?: RecruiterProfile;
  match_score?: number;       // computed for candidate view
  matched_skills?: string[];  // computed for candidate view
  missing_skills?: SkillGap[];
}

export interface ApplicationWithDetails extends DBApplication {
  job?: DBJob;
  candidate?: CandidateProfile;
  match_score_data?: DBMatchScore;
  skill_gaps?: DBSkillGap[];
}

export interface SkillGap {
  name: string;
  importance: SkillImportance;
  suggestion: string;
}

// ── Gemini Parsed Resume ──────────────────────────────────

export interface ParsedResume {
  skills: string[];
  work_experience: WorkExperience[];
  education: Education[];
  summary: string;
  contact?: {
    phone?: string;
    linkedin?: string;
    github?: string;
  };
}

// ── Auth ─────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole | null;
  full_name: string | null;
  avatar_url: string | null;
}

// ── Status Meta ──────────────────────────────────────────

export const STATUS_META: Record<ApplicationStatus | JobStatus, { bg: string; text: string; label: string }> = {
  submitted:    { bg: 'rgba(21,101,192,0.12)',  text: '#1565C0', label: 'Submitted' },
  under_review: { bg: 'rgba(245,127,23,0.12)',  text: '#F57F17', label: 'Under Review' },
  shortlisted:  { bg: 'rgba(46,125,50,0.12)',   text: '#2E7D32', label: 'Shortlisted' },
  rejected:     { bg: 'rgba(198,40,40,0.12)',   text: '#C62828', label: 'Rejected' },
  active:       { bg: 'rgba(46,125,50,0.12)',   text: '#2E7D32', label: 'Active' },
  draft:        { bg: 'rgba(90,106,122,0.12)',  text: '#5A6A7A', label: 'Draft' },
  closed:       { bg: 'rgba(198,40,40,0.12)',   text: '#C62828', label: 'Closed' },
};

export const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted:    ['under_review', 'rejected'],
  under_review: ['shortlisted', 'rejected'],
  shortlisted:  [],
  rejected:     [],
};

export function scoreColor(score: number): string {
  if (score >= 80) return '#2E7D32';
  if (score >= 60) return '#F9A825';
  return '#F57F17';
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Strong Match';
  if (score >= 60) return 'Good Match';
  return 'Weak Match';
}

export function calcProfileStrength(data: {
  hasResume: boolean;
  skillCount: number;
  workExpCount: number;
  educationCount: number;
  hasHeadline: boolean;
}): number {
  let score = 0;
  if (data.hasResume) score += 40;
  if (data.skillCount >= 3) score += 20;
  if (data.skillCount >= 7) score += 10;
  if (data.workExpCount > 0) score += 15;
  if (data.educationCount > 0) score += 10;
  if (data.hasHeadline) score += 5;
  return Math.min(score, 100);
}
