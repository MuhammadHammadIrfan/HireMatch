interface HMSkillChipProps {
  label: string;
  variant?: 'default' | 'matched' | 'missing' | 'primary';
  onRemove?: () => void;
}

const VARIANTS = {
  default: { bg: '#EEF2F7',                     color: '#5A6A7A' },
  matched: { bg: 'rgba(46,125,50,0.1)',          color: '#2E7D32' },
  missing: { bg: 'rgba(245,127,23,0.1)',         color: '#F57F17' },
  primary: { bg: 'rgba(21,101,192,0.09)',        color: '#1565C0' },
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
