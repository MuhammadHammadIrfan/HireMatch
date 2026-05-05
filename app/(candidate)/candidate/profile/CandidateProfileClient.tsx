'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import HMSkillChip from '@/components/ui/HMSkillChip';
import HMButton from '@/components/ui/HMButton';
import HMToast from '@/components/ui/HMToast';
import { createClient } from '@/lib/supabase/client';
import { calcProfileStrength } from '@/lib/types';
import type { DBUser, DBCandidate } from '@/lib/types';

export default function CandidateProfileClient({ profile, candidate }: { profile: DBUser | null; candidate: DBCandidate | null }) {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>(candidate?.skills ?? []);
  const [newSkill, setNewSkill] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const name = profile?.full_name ?? 'User';
  const profileStrength = calcProfileStrength({
    hasResume: !!candidate?.resume_url,
    skillCount: skills.length,
    workExpCount: candidate?.work_experience?.length ?? 0,
    educationCount: candidate?.education?.length ?? 0,
    hasHeadline: !!candidate?.headline,
  });
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(s => [...s, newSkill.trim()]); setNewSkill('');
    }
  };
  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('candidates').update({ skills, profile_strength: profileStrength }).eq('id', user.id);
    setSaving(false);
    setToast('Changes saved successfully');
  };
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const workExp = Array.isArray(candidate?.work_experience) ? candidate.work_experience : [];
  const education = Array.isArray(candidate?.education) ? candidate.education : [];

  return (
    <div className="min-h-screen bg-hm-surface pb-32">
      {toast && <HMToast message={toast} onClose={() => setToast(null)} />}
      <div className="hm-gradient-primary px-5 pt-14 pb-7 text-center">
        <div className="relative inline-block mb-3">
          <Avatar name={name} size={72} />
          <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white border-2 border-hm-primary cursor-pointer text-xs flex items-center justify-center">✏</button>
        </div>
        <div className="text-xl font-black text-white mb-1">{name}</div>
        <div className="text-[13px] text-white/75">{candidate?.headline ?? 'Add a headline'}</div>
        <div className="mt-3 bg-white/12 rounded-[10px] px-3.5 py-2 inline-flex items-center gap-2">
          <div className="text-[13px] font-bold text-white">{profileStrength}%</div>
          <div className="text-xs text-white/80">Profile Strength</div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Resume */}
        {candidate?.resume_url && (
          <div className="bg-white rounded-2xl p-5 mb-3 border border-hm-border">
            <div className="text-[15px] font-bold text-hm-textP mb-3.5">📄 My Resume</div>
            <div className="flex items-center gap-3 bg-hm-surface rounded-[10px] p-3">
              <div className="w-10 h-10 rounded-[10px] bg-hm-redBg flex items-center justify-center text-xl flex-shrink-0">📑</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-hm-textP truncate">{candidate.resume_filename}</div>
                <div className="text-[11px] text-hm-textS">
                  Uploaded {candidate.resume_uploaded_at ? new Date(candidate.resume_uploaded_at).toLocaleDateString() : ''}
                </div>
              </div>
              <button onClick={() => router.push('/candidate/resume/upload')}
                className="bg-transparent border-[1.5px] border-hm-primary text-hm-primary px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex-shrink-0">
                Replace
              </button>
            </div>
          </div>
        )}

        {/* Skills */}
        <div className="bg-white rounded-2xl p-5 mb-3 border border-hm-border">
          <div className="text-[15px] font-bold text-hm-textP mb-3.5">🧠 Skills</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map(s => <HMSkillChip key={s} label={s} variant="primary" onRemove={() => setSkills(sk => sk.filter(x => x !== s))} />)}
          </div>
          <div className="flex gap-2">
            <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()}
              placeholder="Add a skill…"
              className="flex-1 h-[38px] border-[1.5px] border-hm-border rounded-lg px-3 font-sans text-[13px] outline-none" />
            <button onClick={addSkill} className="h-[38px] px-4 rounded-lg bg-hm-primary text-white border-none font-bold text-[13px] cursor-pointer">+ Add</button>
          </div>
        </div>

        {/* Work Experience */}
        <div className="bg-white rounded-2xl p-5 mb-3 border border-hm-border">
          <div className="flex justify-between items-center mb-3.5">
            <div className="text-[15px] font-bold text-hm-textP">💼 Work Experience</div>
            <button className="bg-hm-primaryBg border-none text-hm-primary px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">+ Add</button>
          </div>
          {workExp.map((w, i) => (
            <div key={i} className={`flex gap-3 items-start ${i < workExp.length - 1 ? 'mb-4' : ''}`}>
              <div className="w-9 h-9 rounded-[10px] bg-hm-primaryBg flex items-center justify-center text-base flex-shrink-0">🏢</div>
              <div className="flex-1">
                <div className="text-sm font-bold text-hm-textP">{w.title}</div>
                <div className="text-[13px] text-hm-textS">{w.company}</div>
                <div className="text-[11px] text-hm-textS mt-0.5">{w.start_date} – {w.end_date ?? 'Present'}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl p-5 mb-3 border border-hm-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 bg-transparent border-none cursor-pointer p-0">
            <div className="w-10 h-10 rounded-xl bg-hm-redBg flex items-center justify-center text-lg flex-shrink-0">🚪</div>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold text-hm-red">Log Out</div>
              <div className="text-xs text-hm-textS mt-0.5">Sign out of your account</div>
            </div>
            <span className="text-hm-red text-lg">›</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-4 pt-3 pb-8 bg-white border-t border-hm-border">
        <HMButton loading={saving} onClick={handleSave}>Save Changes</HMButton>
      </div>
    </div>
  );
}
