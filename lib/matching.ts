import type { SkillGap, SkillImportance, JobSkill } from './types';

// ── Fuzzy skill matching ──────────────────────────────────

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function skillsMatch(candidate: string, job: string): boolean {
  const c = normalise(candidate);
  const j = normalise(job);
  if (c === j) return true;
  if (c.includes(j) || j.includes(c)) return true;
  // common aliases
  const aliases: Record<string, string[]> = {
    'js': ['javascript'],
    'ts': ['typescript'],
    'reactjs': ['react'],
    'nodejs': ['node', 'node.js'],
    'psql': ['postgresql', 'postgres'],
    'py': ['python'],
  };
  for (const [key, vals] of Object.entries(aliases)) {
    if ((c === key || vals.includes(c)) && (j === key || vals.includes(j))) return true;
  }
  return false;
}

// ── Skill gap computation ─────────────────────────────────

export interface SkillGapResult {
  matchedSkills: string[];
  missingSkills: SkillGap[];
  matchPercent: number;
}

export function computeSkillGap(
  candidateSkills: string[],
  jobSkills: JobSkill[],
  suggestions: Record<string, string> = {}
): SkillGapResult {
  const matched: string[] = [];
  const missing: SkillGap[] = [];

  for (const js of jobSkills) {
    const found = candidateSkills.some(cs => skillsMatch(cs, js.name));
    if (found) {
      matched.push(js.name);
    } else {
      missing.push({
        name: js.name,
        importance: js.importance as SkillImportance,
        suggestion: suggestions[js.name] ?? defaultSuggestion(js.name),
      });
    }
  }

  // Also check candidate skills against requirement text-based skills
  const totalRequired = jobSkills.length;
  const matchPercent = totalRequired > 0 ? Math.round((matched.length / totalRequired) * 100) : 0;

  return { matchedSkills: matched, missingSkills: missing, matchPercent };
}

function defaultSuggestion(skill: string): string {
  return `Search for "${skill}" courses on freeCodeCamp, Udemy, or the official documentation to get started.`;
}

// ── Profile strength calculator ───────────────────────────

export function calculateProfileStrength(data: {
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
