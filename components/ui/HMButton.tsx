import React, { useRef, useState } from 'react';

type ButtonVariant =
  | 'primary' | 'secondary' | 'ghost' | 'destructive'
  | 'white' | 'whiteOutline' | 'greenSolid' | 'redSolid' | 'amberSolid';

interface HMButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: 'lg' | 'sm';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:      'bg-hm-primary text-white hover:bg-hm-primaryL',
  secondary:    'bg-white text-hm-primary border-[1.5px] border-hm-primary hover:bg-hm-primaryBg',
  ghost:        'bg-transparent text-hm-primary hover:bg-hm-primaryBg',
  destructive:  'bg-hm-red text-white',
  white:        'bg-white text-hm-primary hover:bg-hm-primaryBg',
  whiteOutline: 'bg-transparent text-white border-[1.5px] border-white/65 hover:bg-white/10',
  greenSolid:   'bg-hm-green text-white',
  redSolid:     'bg-hm-red text-white',
  amberSolid:   'bg-hm-amber text-white',
};

function Spinner({ color = 'white' }: { color?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" className="animate-hm-spin" style={{ color }}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2A10 10 0 0 1 22 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function HMButton({
  children, variant = 'primary', size = 'lg', onClick, disabled, loading,
  fullWidth = true, type = 'button', className = '',
}: HMButtonProps) {
  const isDisabled = disabled || loading;
  const spinnerDark = ['secondary', 'ghost'].includes(variant);

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={[
        'flex items-center justify-center gap-2 rounded-[10px] font-semibold font-sans',
        'transition-all duration-150 select-none active:opacity-80',
        size === 'lg' ? 'h-12 text-[15px]' : 'h-10 text-[13px]',
        fullWidth ? 'w-full' : 'w-auto px-5',
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        VARIANTS[variant] ?? VARIANTS.primary,
        className,
      ].join(' ')}
    >
      {loading ? <Spinner color={spinnerDark ? '#1565C0' : 'white'} /> : children}
    </button>
  );
}
