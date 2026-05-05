import type { ApplicationStatus } from '@/lib/types';

interface Step {
  key: ApplicationStatus;
  label: string;
  date?: string | null;
}

const STATE_ORDER: ApplicationStatus[] = ['submitted', 'under_review', 'shortlisted'];

export default function StatusTimeline({
  status,
  submittedAt,
  reviewedAt,
  shortlistedAt,
}: {
  status: ApplicationStatus;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  shortlistedAt?: string | null;
}) {
  const steps: Step[] = [
    { key: 'submitted',    label: 'Submitted',   date: submittedAt },
    { key: 'under_review', label: 'Under Review', date: reviewedAt },
    { key: 'shortlisted',  label: 'Shortlisted',  date: shortlistedAt },
  ];

  const reached = STATE_ORDER.indexOf(status);

  return (
    <div className="py-3 pb-1">
      {steps.map((s, i) => (
        <div key={i} className={`flex gap-3 items-start ${i < steps.length - 1 ? 'mb-4' : ''}`}>
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
              style={{
                background: i <= reached ? '#1565C0' : '#E0E7EF',
                borderColor: i <= reached ? '#1565C0' : '#E0E7EF',
              }}
            >
              {i <= reached && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            {i < steps.length - 1 && (
              <div className="w-0.5 h-7 mt-1" style={{ background: i < reached ? '#1565C0' : '#E0E7EF' }} />
            )}
          </div>
          <div>
            <div className={`text-[13px] ${i <= reached ? 'font-bold text-hm-textP' : 'text-hm-textS'}`}>
              {s.label}
            </div>
            {s.date && i <= reached && (
              <div className="text-[11px] text-hm-textS">
                {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>
        </div>
      ))}
      {status === 'rejected' && (
        <div className="flex gap-3 items-start mt-1">
          <div className="w-3.5 h-3.5 rounded-full bg-hm-red flex items-center justify-center flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <div className="text-[13px] font-bold text-hm-red">Rejected</div>
        </div>
      )}
    </div>
  );
}
