export const colors = {
  bg: '#0B0C10',
  card: '#14161C',
  cardHi: '#1A1D25',
  border: '#22252E',
  text: '#F4F5F7',
  muted: '#8A8F9C',
  faint: '#555A66',
  track: '#1F222B',
  // One tonal family: warm peach -> violet -> mint
  move: ['#FFB38A', '#FF7A8A'] as [string, string],
  recover: ['#B9A4FF', '#7C8CFF'] as [string, string],
  heart: ['#8FF0DA', '#4FD1C5'] as [string, string],
  accent: '#B9A4FF',
  good: '#8FF0DA',
  warn: '#FFB38A',
};

export const radius = { sm: 12, md: 18, lg: 28, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const type = {
  hero: { fontSize: 68, fontWeight: '700' as const, letterSpacing: -2 },
  title: { fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.8 },
  h2: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.3 },
  value: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.8 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.8 },
};
