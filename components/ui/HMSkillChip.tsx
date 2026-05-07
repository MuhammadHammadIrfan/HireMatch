interface HMSkillChipProps {
  label: string;
  variant?: 'default' | 'matched' | 'missing' | 'primary';
  onRemove?: () => void;
}

const VARIANTS = {
  default: { bg: '#F1F5F9',                      color: '#64748B' },
  matched: { bg: 'rgba(16,185,129,0.10)',        color: '#10B981' },
  missing: { bg: 'rgba(245,158,11,0.12)',        color: '#F59E0B' },
  primary: { bg: 'rgba(59,130,246,0.09)',        color: '#3B82F6' },
};

export default function HMSkillChip({ label, variant = 'default', onRemove }: HMSkillChipProps) {
  const s = VARIANTS[variant] ?? VARIANTS.default;
  return (
    <div
      className="inline-flex items-center gap-[3px] px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0"
      style={{ background: s.bg, color: s.color }}
    >
      {variant === 'matched' && <span className="text-[10px]">✓</span>}
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="bg-transparent border-none cursor-pointer pl-0.5 text-sm leading-none"
          style={{ color: s.color }}
        >×</button>
      )}
    </div>
  );
}
