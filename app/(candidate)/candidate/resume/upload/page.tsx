'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BackHeader from '@/components/layout/BackHeader';
import HMButton from '@/components/ui/HMButton';
import HMProgressBar from '@/components/ui/HMProgressBar';
import { createClient } from '@/lib/supabase/client';

export default function ResumeUploadPage() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'dragover' | 'selected' | 'uploading' | 'done'>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx'].includes(ext ?? '')) { setError('Only PDF or DOCX formats are supported'); return; }
    if (f.size > 5 * 1024 * 1024) { setError('File exceeds the 5 MB limit'); return; }
    setError(''); setFile(f); setState('selected');
  };

  const handleUpload = async () => {
    if (!file) return;
    setState('uploading'); setProgress(0);
    const iv = setInterval(() => setProgress(p => Math.min(p + 5, 85)), 200);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const res = await fetch('/api/resume/upload', { method: 'POST', body: formData });
      clearInterval(iv);
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setProgress(100); setState('done');
      setTimeout(() => router.push('/candidate/resume/preview'), 600);
    } catch (err) {
      clearInterval(iv);
      setError((err as Error).message);
      setState('selected');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <BackHeader title="Upload Resume" onBack={() => router.push('/candidate/dashboard')} />
      <div className="px-5 pt-6">
        <p className="text-sm text-hm-textS mb-6">PDF or DOCX format, max 5 MB</p>

        {/* Drop Zone */}
        <div
          onClick={() => state === 'idle' && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setState('dragover'); }}
          onDragLeave={() => setState(state === 'dragover' ? 'idle' : state)}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          className="rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 mb-4"
          style={{
            border: `2px dashed ${state === 'dragover' ? '#1565C0' : error ? '#C62828' : '#E0E7EF'}`,
            background: state === 'dragover' ? 'rgba(21,101,192,0.09)'
              : (state === 'selected' || state === 'done') ? '#F0FDF4' : 'white',
          }}>
          <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden"
            onChange={e => handleFile(e.target.files?.[0] ?? null)} />

          {state === 'uploading' ? (
            <div>
              <div className="text-3xl mb-3">⏳</div>
              <div className="text-sm font-semibold text-hm-primary mb-4">Parsing resume with AI…</div>
              <HMProgressBar value={progress} color="#1565C0" height={6} />
              <div className="text-xs text-hm-textS mt-2">{progress}%</div>
            </div>
          ) : state === 'selected' || state === 'done' ? (
            <div>
              <div className="text-4xl mb-3">✅</div>
              <div className="text-sm font-bold text-hm-green mb-1">{file?.name}</div>
              <div className="text-xs text-hm-textS">{((file?.size ?? 0) / 1024).toFixed(0)} KB</div>
            </div>
          ) : (
            <div>
              <div className="text-5xl mb-3 opacity-60">☁️</div>
              <div className="text-[15px] font-semibold text-hm-textP mb-1.5">Drag & drop your file here</div>
              <div className="text-[13px] text-hm-textS mb-4">or</div>
              <div className="inline-block px-5 py-2.5 rounded-[10px] border-[1.5px] border-hm-primary text-hm-primary font-semibold text-[13px]">
                Browse Files
              </div>
              <div className="mt-4 text-[11px] text-hm-textS">PDF · DOCX &nbsp;·&nbsp; 5 MB max</div>
            </div>
          )}
        </div>

        {error && (
          <div className="text-[13px] text-hm-red bg-hm-redBg px-3.5 py-2.5 rounded-[10px] mb-4 font-medium">⚠ {error}</div>
        )}

        <HMButton disabled={state !== 'selected'} onClick={handleUpload} className="mb-4">Upload & Continue</HMButton>
        <HMButton variant="ghost" onClick={() => router.push('/candidate/dashboard')}>Skip for now</HMButton>
      </div>
    </div>
  );
}
