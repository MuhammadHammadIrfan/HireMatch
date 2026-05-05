'use client';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { scoreColor } from '@/lib/types';

const COLUMNS = [
  { key: 'submitted',    label: 'Applied',       color: '#1565C0' },
  { key: 'under_review', label: 'Reviewing',      color: '#F57F17' },
  { key: 'shortlisted',  label: 'Shortlisted',    color: '#2E7D32' },
  { key: 'rejected',     label: 'Rejected',       color: '#C62828' },
];

export default function PipelineClient({ columns }: { columns: Record<string, any[]> }) {
  const router = useRouter();
  const total = Object.values(columns).reduce((a, arr) => a + arr.length, 0);

  return (
    <div className="min-h-screen bg-hm-surface">
      <div className="bg-white pt-14 pb-4 px-5 border-b border-hm-border">
        <div className="text-[22px] font-black text-hm-textP mb-1">Pipeline</div>
        <div className="text-[13px] text-hm-textS">{total} total applicants</div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-3 px-4 pt-4 pb-8" style={{ minWidth: `${COLUMNS.length * 210}px` }}>
          {COLUMNS.map(col => {
            const apps = columns[col.key] ?? [];
            return (
              <div key={col.key} className="flex-shrink-0 w-52">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                  <div className="text-[13px] font-bold" style={{ color: col.color }}>{col.label}</div>
                  <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: `${col.color}18`, color: col.color }}>
                    {apps.length}
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  {apps.map(app => {
                    const name = app.users?.full_name ?? 'Candidate';
                    return (
                      <div key={app.id}
                        onClick={() => router.push(`/recruiter/candidates/${app.candidate_id}`)}
                        className="bg-white rounded-xl p-3.5 border border-hm-border cursor-pointer">
                        <div className="flex items-start gap-2.5 mb-2">
                          <Avatar name={name} size={32} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-bold text-hm-textP truncate">{name}</div>
                            <div className="text-[11px] text-hm-textS truncate">{app.candidates?.headline ?? '—'}</div>
                          </div>
                        </div>
                        <div className="text-[11px] text-hm-textS truncate mb-2">{app.jobs?.title}</div>
                        {app.match_score != null && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: `${scoreColor(app.match_score)}12`, color: scoreColor(app.match_score) }}>
                            ● {app.match_score}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {apps.length === 0 && (
                    <div className="text-center text-hm-textS text-xs py-4 opacity-60">Empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
