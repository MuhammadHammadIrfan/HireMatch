// ============================================================
// Gemini Multi-Key Fallback Client
// Rotates through API keys automatically on 429/503 errors
// Supports: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash
// ============================================================

import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  type GenerativeModel,
} from '@google/generative-ai';
import type { ParsedResume } from './types';

// ── Key Pool ─────────────────────────────────────────────

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('No GEMINI_API_KEY found in environment');
  return key;
}

// ── Model Priority List ───────────────────────────────────

const CHAT_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
] as const;

const EMBEDDING_MODEL = 'text-embedding-004';

// ── Safety Settings ───────────────────────────────────────

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// ── Retry Helper ──────────────────────────────────────────

const RETRYABLE_ERRORS = [429, 503, 500, 502, 504];

function isRetryable(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { status?: number; message?: string };
  if (e.status && RETRYABLE_ERRORS.includes(e.status)) return true;
  if (e.message?.includes('quota') || e.message?.includes('rate limit') || e.message?.includes('overloaded')) return true;
  return false;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Core: Generate Content with Fallback ─────────────────

export async function generateWithFallback(
  prompt: string,
  imageParts?: Array<{ inlineData: { data: string; mimeType: string } }>,
): Promise<string> {
  const key = getApiKey();

  for (const modelName of CHAT_MODELS) {
    const client = new GoogleGenerativeAI(key);
    const model = client.getGenerativeModel({
      model: modelName,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
    });

    try {
      const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = imageParts
        ? [...imageParts, { text: prompt }]
        : [{ text: prompt }];

      const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
      const text = result.response.text();
      if (!text) throw new Error('Empty response from Gemini');
      console.log(`[Gemini] Success: model=${modelName}`);
      return text;
    } catch (err) {
      console.warn(`[Gemini] Failed: model=${modelName}`, (err as Error).message);
      if (isRetryable(err)) await sleep(1000); // backoff before trying next model
    }
  }

  throw new Error('All Gemini models exhausted. Try again later.');
}

// ── Core: Generate Embedding with Fallback ────────────────

export async function generateEmbeddingWithFallback(text: string): Promise<number[]> {
  const key = getApiKey();
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = new GoogleGenerativeAI(key);
      const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });
      const result = await model.embedContent(text.slice(0, 25000)); // token limit safety
      const embedding = result.embedding.values;
      console.log(`[Gemini Embed] Success: dims=${embedding.length}`);
      return embedding;
    } catch (err) {
      console.warn(`[Gemini Embed] Failed attempt ${attempt}`, (err as Error).message);
      if (isRetryable(err) && attempt < MAX_RETRIES) {
        await sleep(1000 * attempt);
      } else if (attempt === MAX_RETRIES) {
        throw new Error('Gemini embedding failed after maximum retries.');
      }
    }
  }

  throw new Error('Gemini embedding failed.');
}

// ── Resume Parsing ────────────────────────────────────────

const RESUME_PARSE_PROMPT = `You are an expert resume parser. Extract structured information from the resume.
Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "skills": ["skill1", "skill2"],
  "work_experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "start_date": "Mon YYYY",
      "end_date": "Mon YYYY or null if current",
      "description": "Brief description"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School Name",
      "year": "YYYY",
      "field": "Field of Study"
    }
  ],
  "summary": "One paragraph professional summary",
  "contact": {
    "phone": "phone if visible",
    "linkedin": "linkedin URL if visible",
    "github": "github URL if visible"
  }
}`;

export async function parseResume(fileData: string, mimeType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'): Promise<ParsedResume> {
  const text = await generateWithFallback(
    RESUME_PARSE_PROMPT,
    [{ inlineData: { data: fileData, mimeType } }]
  );

  // Extract JSON from response (sometimes wrapped in markdown)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse JSON from Gemini resume response');

  try {
    const parsed = JSON.parse(jsonMatch[0]) as ParsedResume;
    // Ensure arrays exist
    parsed.skills = parsed.skills ?? [];
    parsed.work_experience = parsed.work_experience ?? [];
    parsed.education = parsed.education ?? [];
    parsed.summary = parsed.summary ?? '';
    return parsed;
  } catch {
    throw new Error('Invalid JSON returned from Gemini resume parser');
  }
}

// ── Job Description Summarizer (for embedding) ────────────

export function buildJobEmbeddingText(job: {
  title: string;
  description?: string | null;
  skills: Array<{ name: string; importance: string }>;
  requirements?: string[];
  experience_level?: string | null;
}): string {
  const skillsText = job.skills.map(s => `${s.name} (${s.importance})`).join(', ');
  const reqText = (job.requirements ?? []).join('. ');
  return [
    `Job Title: ${job.title}`,
    job.experience_level ? `Experience Level: ${job.experience_level}` : '',
    `Required Skills: ${skillsText}`,
    reqText ? `Requirements: ${reqText}` : '',
    job.description ? `Description: ${job.description.slice(0, 2000)}` : '',
  ].filter(Boolean).join('\n');
}

// ── Skill Gap Suggestion Generator ───────────────────────

export async function generateSkillSuggestions(
  missingSkills: string[]
): Promise<Record<string, string>> {
  if (missingSkills.length === 0) return {};

  const prompt = `For each of the following technical skills, provide a concise, actionable learning suggestion (1-2 sentences, mention a specific free resource or course).
Return ONLY valid JSON with skill names as keys and suggestions as values. No markdown.

Skills: ${JSON.stringify(missingSkills)}`;

  const text = await generateWithFallback(prompt);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return {};

  try {
    return JSON.parse(jsonMatch[0]) as Record<string, string>;
  } catch {
    return {};
  }
}
