'use client';
import { useEffect, useState } from 'react';
import { scoreColor, scoreLabel } from '@/lib/types';

interface HMMatchRingProps {
  score: number;
  size?: number;
  animate?: boolean;
}

export default function HMMatchRing({ score, size = 80, animate = true }: HMMatchRingProps) {
  const [disp, setDisp] = useState(animate ? 0 : score);
  const sw = size < 60 ? 5 : 7;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (disp / 100) * circ;
  const color = scoreColor(score);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setDisp(score), 120);
    return () => clearTimeout(t);
  }, [score, animate]);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E0E7EF" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.65s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-bold leading-none" style={{ fontSize: size * 0.23, color }}>{score}%</div>
        {size >= 80 && (
          <div className="text-center leading-tight text-hm-textS mt-0.5" style={{ fontSize: size * 0.1 }}>
            {scoreLabel(score)}
          </div>
        )}
      </div>
    </div>
  );
}
