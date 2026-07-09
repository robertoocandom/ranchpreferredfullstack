export const colors = {
  orange: '#F37021',
  orangeDark: '#C94E04',
  dark: '#111111',
  white: '#FFFFFF',
  cardBg: '#F3F4F6',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  border: '#E5E7EB',
  green: '#16A34A',
  red: '#DC2626',
  bronze: '#CD7F32',
  silver: '#A8A9AD',
  gold: '#F0A500',
  whatsapp: '#25D366',
} as const;

export const tierColor: Record<'BRONCE' | 'PLATA' | 'ORO', string> = {
  BRONCE: colors.bronze,
  PLATA: colors.silver,
  ORO: colors.gold,
};

export const font = "'Inter', sans-serif";
