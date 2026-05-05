// lib/analytics.ts
// Typed analytics event helpers — centralised so event names never drift
import posthog from './posthog';

// ── Event Catalogue ──────────────────────────────────────────────────────────

export const Analytics = {
  // Auth
  login:          (method: 'email' | 'google', role: 'candidate' | 'recruiter') =>
    posthog.capture('user_login', { method, role }),
  register:       (role: 'candidate' | 'recruiter') =>
    posthog.capture('user_registered', { role }),
  logout:         () => posthog.capture('user_logout'),

  // Candidate — Resume
  resumeUploaded: (fileType: string, sizeKb: number) =>
    posthog.capture('resume_uploaded', { file_type: fileType, size_kb: sizeKb }),
  resumeParsed:   (skillCount: number) =>
    posthog.capture('resume_parsed', { skill_count: skillCount }),

  // Candidate — Jobs
  jobViewed:      (jobId: string, matchScore: number) =>
    posthog.capture('job_viewed', { job_id: jobId, match_score: matchScore }),
  jobApplied:     (jobId: string, matchScore: number) =>
    posthog.capture('job_applied', { job_id: jobId, match_score: matchScore }),
  jobSearched:    (query: string, filter: string, resultsCount: number) =>
    posthog.capture('job_searched', { query, filter, results_count: resultsCount }),
  skillGapViewed: (jobId: string, missingCount: number) =>
    posthog.capture('skill_gap_viewed', { job_id: jobId, missing_skill_count: missingCount }),

  // Recruiter — Jobs
  jobPosted:      (jobId: string, skillCount: number) =>
    posthog.capture('job_posted', { job_id: jobId, skill_count: skillCount }),
  jobDrafted:     (jobId: string) =>
    posthog.capture('job_drafted', { job_id: jobId }),

  // Recruiter — Applications
  candidateViewed:    (candidateId: string, matchScore: number) =>
    posthog.capture('candidate_profile_viewed', { candidate_id: candidateId, match_score: matchScore }),
  applicationUpdated: (applicationId: string, oldStatus: string, newStatus: string) =>
    posthog.capture('application_status_updated', { application_id: applicationId, from: oldStatus, to: newStatus }),
  matchExplanationViewed: (jobId: string, candidateId: string) =>
    posthog.capture('match_explanation_viewed', { job_id: jobId, candidate_id: candidateId }),

  // Identity (call after login/register to link anonymous → identified)
  identify: (userId: string, props: { email: string; role: string; name?: string }) => {
    posthog.identify(userId, props);
  },
  reset: () => posthog.reset(),
};
