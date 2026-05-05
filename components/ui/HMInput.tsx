'use client';
import { useState } from 'react';

interface HMInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  className?: string;
}

export default function HMInput({
  label, type = 'text', placeholder, value, onChange, error,
  icon, rightIcon, onRightIconClick, className = '',
}: HMInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`mb-4 ${className}`}>
      {label && <div className="text-[13px] font-semibold text-hm-textS mb-1.5">{label}</div>}
      <div className={[
        'flex items-center h-12 px-3.5 rounded-[10px] bg-white border-[1.5px] transition-colors duration-150',
        error ? 'border-hm-red' : focused ? 'border-hm-primary' : 'border-hm-border',
      ].join(' ')}>
        {icon && <span className={`mr-2.5 text-base flex-shrink-0 ${focused ? 'text-hm-primary' : 'text-hm-textS'}`}>{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 border-none outline-none font-sans text-sm text-hm-textP bg-transparent placeholder:text-hm-textS/60"
        />
        {rightIcon && (
          <button type="button" onClick={onRightIconClick}
            className="bg-none border-none cursor-pointer text-hm-textS p-1 text-base flex-shrink-0">
            {rightIcon}
          </button>
        )}
      </div>
      {error && <div className="text-xs text-hm-red mt-1">{error}</div>}
    </div>
  );
}
