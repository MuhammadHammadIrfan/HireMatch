import { scoreColor } from '@/lib/types';

export default function HMScorePill({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <div
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap"
      style={{ background: `${color}18`, color }}
    >
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      {score}% Match
    </div>
  );
}
