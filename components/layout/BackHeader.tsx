'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

interface BackHeaderProps {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  light?: boolean;
}

export default function BackHeader({ title, onBack, right, light = false }: BackHeaderProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <div className={[
      'flex items-center px-4 pt-14 pb-3.5 flex-shrink-0',
      light ? 'bg-transparent' : 'bg-white border-b border-hm-border',
    ].join(' ')}>
      <button
        onClick={handleBack}
        className={[
          'w-9 h-9 rounded-full flex items-center justify-center text-lg border-none flex-shrink-0',
          light ? 'bg-white/15 text-white' : 'bg-[#F0F4F8] text-hm-textP',
        ].join(' ')}
      >
        ←
      </button>
      <div className={`flex-1 text-center text-[17px] font-bold ${light ? 'text-white' : 'text-hm-textP'}`}>
        {title}
      </div>
      <div className="w-9 flex justify-end">{right}</div>
    </div>
  );
}
