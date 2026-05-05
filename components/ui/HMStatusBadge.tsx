import { STATUS_META } from '@/lib/types';
import type { ApplicationStatus, JobStatus } from '@/lib/types';

interface HMStatusBadgeProps {
  status: ApplicationStatus | JobStatus | string;
  small?: boolean;
}

export default function HMStatusBadge({ status, small = false }: HMStatusBadgeProps) {
  const meta = STATUS_META[status as ApplicationStatus] ?? { bg: '#E0E7EF', text: '#5A6A7A', label: status };
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full font-bold whitespace-nowrap ${small ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}`}
      style={{ background: meta.bg, color: meta.text }}
    >
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.text }} />
      {meta.label}
    </div>
  );
}
