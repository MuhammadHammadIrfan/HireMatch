const COLORS = ['#1565C0', '#2E7D32', '#6A1B9A', '#00838F', '#C62828'];

function getColor(name: string): string {
  return COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
}

export function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  const color = getColor(name);
  const initials = (name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

export function CompanyLogo({ company, size = 40 }: { company: string; size?: number }) {
  const COMPANY_COLORS = ['#1565C0', '#2E7D32', '#C62828', '#F57F17', '#6A1B9A', '#00838F'];
  const color = COMPANY_COLORS[(company?.charCodeAt(0) ?? 0) % COMPANY_COLORS.length];
  return (
    <div
      className="rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {(company ?? '?')[0]}
    </div>
  );
}
