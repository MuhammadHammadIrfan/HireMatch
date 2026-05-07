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
        'bg-white rounded-xl shadow-card',
        noPad ? '' : 'p-5',
        onClick ? 'cursor-pointer hm-card-hover hover:shadow-card-hover' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
