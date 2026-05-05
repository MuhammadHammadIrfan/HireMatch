import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { parseResume, generateEmbeddingWithFallback } from '@/lib/gemini';
import { calculateProfileStrength } from '@/lib/matching';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx'].includes(ext ?? '')) {
      return NextResponse.json({ error: 'Only PDF or DOCX files are supported' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Upload to Supabase Storage
    const storagePath = `${userId}/${Date.now()}_${file.name}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(storagePath);

    // 2. Parse resume with Gemini
    const base64Data = fileBuffer.toString('base64');
    const mimeType = ext === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const parsed = await parseResume(base64Data, mimeType);

    // 3. Build embedding text and generate vector
    const embeddingText = [
      `Skills: ${parsed.skills.join(', ')}`,
      `Summary: ${parsed.summary}`,
      parsed.work_experience.map(w => `${w.title} at ${w.company}`).join('. '),
      parsed.education.map(e => `${e.degree} from ${e.school}`).join('. '),
    ].join('\n');

    const embedding = await generateEmbeddingWithFallback(embeddingText);

    // 4. Store in DB
    const profileStrength = calculateProfileStrength({
      hasResume: true,
      skillCount: parsed.skills.length,
      workExpCount: parsed.work_experience.length,
      educationCount: parsed.education.length,
      hasHeadline: true,
    });

    const { error: dbError } = await supabase.from('candidates').upsert({
      id: userId,
      skills: parsed.skills,
      work_experience: parsed.work_experience,
      education: parsed.education,
      resume_url: publicUrl,
      resume_filename: file.name,
      resume_text: embeddingText,
      resume_uploaded_at: new Date().toISOString(),
      resume_embedding: `[${embedding.join(',')}]`,
      profile_strength: profileStrength,
      headline: parsed.work_experience[0]
        ? `${parsed.work_experience[0].title} at ${parsed.work_experience[0].company}`
        : 'Professional',
    });

    if (dbError) throw new Error(`DB update failed: ${dbError.message}`);

    return NextResponse.json({ success: true, parsed, profileStrength });
  } catch (err) {
    console.error('[Resume Upload]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
