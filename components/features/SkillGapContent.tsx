'use client';
import { useState } from 'react';
import HMMatchRing from '../ui/HMMatchRing';
import HMSkillChip from '../ui/HMSkillChip';
import type { SkillGap } from '@/lib/types';

interface SkillGapContentProps {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: SkillGap[];
}

const IMP_COLORS: Record<string, { bg: string; text: string }> = {
  high:   { bg: 'rgba(244,63,94,0.10)',  text: '#F43F5E' },
  medium: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
  low:    { bg: 'rgba(16,185,129,0.10)', text: '#10B981' },
};

export default function SkillGapContent({ matchScore, matchedSkills, missingSkills }: SkillGapContentProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  return (
    <div>
      <div className="flex justify-center mb-6">
        <HMMatchRing score={matchScore} size={100} />
      </div>

      {/* Matched Skills */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(16,185,129,0.15)' }}>
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span className="text-[13px] font-bold text-hm-green">
            Matched Skills ({matchedSkills.length})
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.map(s => <HMSkillChip key={s} label={s} variant="matched" />)}
          {matchedSkills.length === 0 && (
            <span className="text-[13px] text-hm-textS" style={{ fontFamily: 'var(--font-dm)' }}>
              No matched skills found
            </span>
          )}
        </div>
      </div>

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)' }}>
              <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <span className="text-[13px] font-bold text-hm-amber">
              Skill Gaps ({missingSkills.length})
            </span>
          </div>

          {missingSkills.map((sk, i) => {
            const imp = sk.importance as string;
            const colors = IMP_COLORS[imp] ?? IMP_COLORS.medium;
            return (
              <div key={i} onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}
                className="bg-white rounded-2xl mb-2.5 border border-hm-border overflow-hidden cursor-pointer hover:border-slate-300 transition-colors">
                <div className="flex items-center px-4 py-3.5 gap-2.5">
                  <div className="flex-1 text-[13px] font-bold text-hm-textP">{sk.name}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0"
                    style={{ background: colors.bg, color: colors.text }}>
                    {imp}
                  </span>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: expanded[i] ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                {expanded[i] && sk.suggestion && (
                  <div className="px-4 pb-4 border-t border-hm-border pt-3">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(59,130,246,0.10)' }}>
                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
                        </svg>
                      </div>
                      <div className="text-[12px] text-hm-textS leading-relaxed" style={{ fontFamily: 'var(--font-dm)' }}>
                        {sk.suggestion}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Insight */}
      <div className="rounded-2xl p-4 mt-2 flex gap-3 items-start border border-hm-border"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(6,182,212,0.05))' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(59,130,246,0.12)' }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
        <div>
          <div className="text-[12px] font-bold text-hm-blue mb-1">Semantic Match Analysis</div>
          <div className="text-[12px] text-hm-textS leading-relaxed" style={{ fontFamily: 'var(--font-dm)' }}>
            Your profile aligns with this role's core requirements. AI vector similarity:{' '}
            <strong style={{ color: '#3B82F6' }}>{matchScore}%</strong> match confidence.
          </div>
        </div>
      </div>
    </div>
  );
}
