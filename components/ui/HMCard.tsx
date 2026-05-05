import React from 'react';

interface HMCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  noPad?: boolean;
  className?: string;
}

export default function HMCard({ children, onClick, noPad = false, className = '' }: HMCardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-white rounded-2xl border border-hm-border',
        noPad ? '' : 'p-5',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
