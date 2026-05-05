'use client';
import { useState } from 'react';
import HMMatchRing from '../ui/HMMatchRing';
import HMSkillChip from '../ui/HMSkillChip';
import type { SkillGap } from '@/lib/types';
import { scoreColor } from '@/lib/types';

interface SkillGapContentProps {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: SkillGap[];
}

export default function SkillGapContent({ matchScore, matchedSkills, missingSkills }: SkillGapContentProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const importanceColor = (imp: string) =>
    imp === 'high' ? '#C62828' : imp === 'medium' ? '#F57F17' : '#78909C';
  const importanceBg = (imp: string) =>
    imp === 'high' ? 'rgba(198,40,40,0.1)' : imp === 'medium' ? 'rgba(245,127,23,0.1)' : 'rgba(120,144,156,0.1)';

  return (
    <div>
      <div className="flex justify-center mb-6">
        <HMMatchRing score={matchScore} size={100} />
      </div>

      {/* Matched Skills */}
      <div className="mb-5">
        <div className="text-sm font-bold text-hm-green mb-2.5 flex items-center gap-1.5">
          ✅ Matched Skills ({matchedSkills.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.map(s => <HMSkillChip key={s} label={s} variant="matched" />)}
        </div>
      </div>

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div>
          <div className="text-sm font-bold text-hm-amber mb-2.5 flex items-center gap-1.5">
            ⚠ Missing Skills ({missingSkills.length})
          </div>
          {missingSkills.map((sk, i) => (
            <div
              key={i}
              onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}
              className="bg-white rounded-2xl mb-2.5 border border-hm-border overflow-hidden cursor-pointer"
            >
              <div className="flex items-center px-4 py-3.5 gap-2.5">
                <div className="flex-1">
                  <div className="text-sm font-bold text-hm-textP">{sk.name}</div>
                </div>
                <div
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                  style={{ background: importanceBg(sk.importance), color: importanceColor(sk.importance) }}
                >
                  {sk.importance}
                </div>
                <span
                  className="text-hm-textS text-sm inline-block transition-transform duration-300"
                  style={{ transform: expanded[i] ? 'rotate(180deg)' : 'rotate(0)' }}
                >⌃</span>
              </div>
              {expanded[i] && (
                <div className="px-4 pb-4 text-[13px] text-hm-textS leading-relaxed border-t border-hm-border pt-3 animate-hm-fade-in">
                  💡 {sk.suggestion}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* NLP Insight */}
      <div className="rounded-2xl p-3.5 mt-2 flex gap-2.5 items-start" style={{ background: 'rgba(21,101,192,0.09)' }}>
        <span className="text-xl">🤖</span>
        <div>
          <div className="text-xs font-bold text-hm-primary mb-1">NLP Semantic Insight</div>
          <div className="text-[13px] text-hm-textS leading-relaxed">
            Candidate's background aligns with this role's core requirements. Semantic vector similarity:{' '}
            <strong style={{ color: '#1565C0' }}>{matchScore}%</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
