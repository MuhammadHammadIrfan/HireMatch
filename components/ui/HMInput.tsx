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
      {label && (
        <div className="text-[11px] font-semibold text-hm-textS mb-1.5 uppercase tracking-wide">
          {label}
        </div>
      )}
      <div className={[
        'flex items-center h-11 px-3.5 rounded-xl bg-white border transition-all duration-150',
        error
          ? 'border-hm-rose ring-2 ring-hm-roseBg'
          : focused
            ? 'border-hm-blue ring-2 ring-hm-blueBg'
            : 'border-hm-border hover:border-hm-textS/40',
      ].join(' ')}>
        {icon && (
          <span className={`mr-2.5 text-base flex-shrink-0 ${focused ? 'text-hm-blue' : 'text-hm-textS'}`}>
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 border-none outline-none text-sm text-hm-textP bg-transparent placeholder:text-hm-textS/50"
          style={{ fontFamily: 'var(--font-dm, DM Sans, system-ui)' }}
        />
        {rightIcon && (
          <button type="button" onClick={onRightIconClick}
            className="bg-none border-none cursor-pointer text-hm-textS p-1 text-base flex-shrink-0">
            {rightIcon}
          </button>
        )}
      </div>
      {error && <div className="text-xs text-hm-rose mt-1">{error}</div>}
    </div>
  );
}
