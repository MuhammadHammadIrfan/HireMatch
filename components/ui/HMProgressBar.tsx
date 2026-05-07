interface HMProgressBarProps {
  value: number;
  color?: string;
  height?: number;
}

export default function HMProgressBar({ value, color = '#3B82F6', height = 8 }: HMProgressBarProps) {
  return (
    <div className="rounded-full overflow-hidden bg-hm-border" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-in-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}
