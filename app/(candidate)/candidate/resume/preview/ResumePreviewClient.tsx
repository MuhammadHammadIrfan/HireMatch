'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackHeader from '@/components/layout/BackHeader';
import HMSkillChip from '@/components/ui/HMSkillChip';
import HMButton from '@/components/ui/HMButton';
import HMCard from '@/components/ui/HMCard';
import type { DBCandidate } from '@/lib/types';

export default function ResumePreviewClient({ candidate }: { candidate: DBCandidate | null }) {
  const router = useRouter();
  const [open, setOpen] = useState({ skills: true, exp: true, edu: false, contact: false });
  const tog = (k: keyof typeof open) => setOpen(o => ({ ...o, [k]: !o[k] }));

  const Section = ({ k, label, children }: { k: keyof typeof open; label: string; children: React.ReactNode }) => (
    <HMCard className="mb-3" noPad>
      <div onClick={() => tog(k)} className="flex justify-between items-center px-4 py-4 cursor-pointer">
        <div className="text-[15px] font-bold text-hm-textP">{label}</div>
        <div className="flex gap-3 items-center">
          <button className="bg-transparent border-none text-hm-primary text-xs font-semibold cursor-pointer">Edit</button>
          <span className="text-hm-textS text-lg transition-transform duration-200 inline-block"
            style={{ transform: open[k] ? 'rotate(180deg)' : 'rotate(0)' }}>⌃</span>
        </div>
      </div>
      {open[k] && <div className="px-4 pb-4">{children}</div>}
    </HMCard>
  );

  const workExp = Array.isArray(candidate?.work_experience) ? candidate.work_experience : [];
  const education = Array.isArray(candidate?.education) ? candidate.education : [];
  const skills = candidate?.skills ?? [];

  return (
    <div className="min-h-screen bg-hm-surface">
      <BackHeader title="Resume Preview" onBack={() => router.push('/candidate/resume/upload')} />
      <div className="px-4 pt-4 pb-24">
        <div className="rounded-2xl px-4 py-4 mb-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
          <div className="text-3xl">✅</div>
          <div>
            <div className="text-[15px] font-bold text-white">Resume Parsed Successfully</div>
            <div className="text-xs text-white/80">Review the data we extracted from your resume</div>
          </div>
        </div>

        <Section k="skills" label="🧠 Skills Extracted">
          <div className="flex flex-wrap gap-2">
            {skills.map(s => <HMSkillChip key={s} label={s} variant="primary" />)}
            {skills.length === 0 && <div className="text-sm text-hm-textS">No skills extracted</div>}
          </div>
        </Section>

        <Section k="exp" label="💼 Work Experience">
          {workExp.map((w, i) => (
            <div key={i} className={`flex gap-3 ${i < workExp.length - 1 ? 'mb-4' : ''}`}>
              <div className="w-0.5 bg-hm-primary rounded-full flex-shrink-0 min-h-[40px]" />
              <div>
                <div className="text-sm font-bold text-hm-textP">{w.title}</div>
                <div className="text-[13px] text-hm-textS">{w.company}</div>
                <div className="text-[11px] text-hm-textS mt-0.5">{w.start_date} – {w.end_date ?? 'Present'}</div>
              </div>
            </div>
          ))}
        </Section>

        <Section k="edu" label="🎓 Education">
          {education.map((e, i) => (
            <div key={i}>
              <div className="text-sm font-bold text-hm-textP">{e.degree}</div>
              <div className="text-[13px] text-hm-textS">{e.school} · {e.year}</div>
            </div>
          ))}
        </Section>

        <HMButton onClick={() => router.push('/candidate/dashboard')} className="mt-2">
          Looks Good! Continue →
        </HMButton>
      </div>
    </div>
  );
}
