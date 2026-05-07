import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${userId}/avatar.${ext}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const supabase = createAdminClient();

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, fileBuffer, { contentType: file.type, upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);

    await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', userId);

    return NextResponse.json({ publicUrl });
  } catch (err) {
    console.error('[Avatar Upload]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
