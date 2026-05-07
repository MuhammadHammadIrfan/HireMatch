'use client';
import { useEffect } from 'react';

interface HMToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const BG: Record<string, string> = {
  success: '#0F172A',
  error:   '#F43F5E',
  info:    '#3B82F6',
};

const ICONS: Record<string, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
};

export default function HMToast({ message, type = 'success', onClose }: HMToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed top-14 left-4 right-4 z-[9999] flex items-center justify-between rounded-xl px-4 py-3 text-white text-sm font-medium shadow-lg animate-hm-toast-in"
      style={{ background: BG[type] ?? BG.success }}
    >
      <span>{ICONS[type]} {message}</span>
      <button onClick={onClose} className="bg-transparent border-none text-white/70 cursor-pointer text-xl leading-none ml-3">×</button>
    </div>
  );
}
