import React, { useState } from 'react';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#F43F5E'];
const COMPANY_COLORS = ['#3B82F6', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6', '#06B6D4'];

function getColor(name: string, palette: string[]): string {
  return palette[(name?.charCodeAt(0) ?? 0) % palette.length];
}

export function Avatar({
  name,
  size = 48,
  src,
}: {
  name: string;
  size?: number;
  src?: string | null;
}) {
  const [error, setError] = useState(false);
  const color = getColor(name, COLORS);
  const initials = (name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-display font-black flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

export function CompanyLogo({ company, size = 40 }: { company: string; size?: number }) {
  const color = getColor(company, COMPANY_COLORS);
  return (
    <div
      className="rounded-xl flex items-center justify-center text-white font-display font-black flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {(company ?? '?')[0]}
    </div>
  );
}
