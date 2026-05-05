import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateEmbeddingWithFallback, buildJobEmbeddingText } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json() as { jobId: string };
    if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });

    const supabase = createAdminClient();
    const { data: job, error } = await supabase.from('jobs').select('*').eq('id', jobId).single();
    if (error || !job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const text = buildJobEmbeddingText(job);
    const embedding = await generateEmbeddingWithFallback(text);

    await supabase.from('jobs').update({
      job_embedding: `[${embedding.join(',')}]`,
    }).eq('id', jobId);

    return NextResponse.json({ success: true, dims: embedding.length });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
