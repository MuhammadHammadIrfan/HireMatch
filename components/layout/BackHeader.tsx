'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

interface BackHeaderProps {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  light?: boolean;
}

function IconArrowLeft() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export default function BackHeader({ title, onBack, right, light = false }: BackHeaderProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <div className={[
      'flex items-center px-4 pt-14 md:pt-5 pb-3.5 flex-shrink-0',
      light ? 'bg-transparent' : 'bg-white border-b border-hm-border',
    ].join(' ')}>
      <button
        onClick={handleBack}
        className={[
          'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border-none transition-colors duration-150',
          light
            ? 'bg-white/15 text-white hover:bg-white/25'
            : 'bg-hm-surface text-hm-textP hover:bg-hm-border',
        ].join(' ')}
      >
        <IconArrowLeft />
      </button>
      <div className={`flex-1 text-center font-display text-[17px] font-bold ${light ? 'text-white' : 'text-hm-textP'}`}>
        {title}
      </div>
      <div className="w-9 flex justify-end">{right}</div>
    </div>
  );
}
