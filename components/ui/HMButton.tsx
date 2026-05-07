import React from 'react';

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
  primary:      'bg-hm-blue text-white hover:bg-hm-blueLight',
  secondary:    'bg-white text-hm-blue border border-hm-blue hover:bg-hm-blueBg',
  ghost:        'bg-transparent text-hm-blue hover:bg-hm-blueBg',
  destructive:  'bg-hm-rose text-white hover:bg-rose-600',
  white:        'bg-white text-hm-blue hover:bg-hm-blueBg shadow-card',
  whiteOutline: 'bg-transparent text-white border border-white/65 hover:bg-white/10',
  greenSolid:   'bg-hm-green text-white hover:bg-emerald-600',
  redSolid:     'bg-hm-rose text-white hover:bg-rose-600',
  amberSolid:   'bg-hm-amber text-white hover:bg-amber-600',
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
        'flex items-center justify-center gap-2 rounded-lg font-display font-semibold',
        'transition-all duration-150 select-none',
        'active:scale-[0.97]',
        size === 'lg' ? 'h-12 text-[15px]' : 'h-9 text-[13px]',
        fullWidth ? 'w-full' : 'w-auto px-5',
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5',
        VARIANTS[variant] ?? VARIANTS.primary,
        className,
      ].join(' ')}
    >
      {loading ? <Spinner color={spinnerDark ? '#3B82F6' : 'white'} /> : children}
    </button>
  );
}
