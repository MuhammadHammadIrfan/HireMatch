interface HMSelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

export default function HMSelect({ label, value, onChange, options }: HMSelectProps) {
  return (
    <div className="mb-4">
      {label && <div className="text-[13px] font-semibold text-hm-textS mb-1.5">{label}</div>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-12 border-[1.5px] border-hm-border rounded-[10px] px-3.5 font-sans text-sm text-hm-textP bg-white outline-none cursor-pointer"
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
