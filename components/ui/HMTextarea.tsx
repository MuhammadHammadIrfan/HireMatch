'use client';
import { useState } from 'react';

interface HMTextareaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  maxLength?: number;
}

export default function HMTextarea({ label, placeholder, value, onChange, rows = 4, maxLength }: HMTextareaProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="mb-4">
      {label && <div className="text-[13px] font-semibold text-hm-textS mb-1.5">{label}</div>}
      <div className="relative">
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={[
            'w-full rounded-[10px] px-3.5 py-3 font-sans text-sm text-hm-textP resize-none outline-none',
            'border-[1.5px] transition-colors duration-150 box-border',
            focused ? 'border-hm-primary' : 'border-hm-border',
          ].join(' ')}
        />
        {maxLength && (
          <div className="absolute bottom-2.5 right-3 text-[11px] text-hm-textS">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
}
