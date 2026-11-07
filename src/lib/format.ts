export function fmtDuration(sec: number): string {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
}

export function fmtMinutes(min: number): string {
  return fmtDuration(min * 60);
}

export function fmtDistance(m: number): string {
  if (m <= 0) return '';
  return `${(m / 1000).toFixed(m >= 10000 ? 1 : 2)} km`;
}

export function fmtNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

export function relativeDay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(d)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 19) return 'Good afternoon';
  return 'Good evening!';
}

export function lastSevenDayLabels(): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toLocaleDateString('en-US', { weekday: 'narrow' }));
  }
  return out;
}

const SPORT_ICONS: [string, string][] = [
  ['run', 'walk'],
  ['walk', 'footsteps'],
  ['hik', 'trail-sign'],
  ['ride', 'bicycle'],
  ['cycl', 'bicycle'],
  ['swim', 'water'],
  ['weight', 'barbell'],
  ['strength', 'barbell'],
  ['yoga', 'body'],
];

export function sportIcon(type: string): any {
  const t = type.toLowerCase();
  return SPORT_ICONS.find(([k]) => t.includes(k))?.[1] ?? 'fitness';
}
