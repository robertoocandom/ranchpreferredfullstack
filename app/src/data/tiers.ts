import { colors } from '../theme';

export type TierName = 'BRONCE' | 'PLATA' | 'ORO';

export interface TierInfo {
  key: TierName;
  label: { es: string; en: string };
  min: number;
  max: number | null;
  gradient: string;
  accent: string;
  perksMultiplier: string;
  benefits: Array<{ es: string; en: string }>;
}

export const tiers: TierInfo[] = [
  {
    key: 'BRONCE',
    label: { es: 'BRONCE', en: 'BRONZE' },
    min: 0,
    max: 499,
    gradient: 'linear-gradient(135deg,#6B3F1A,#9A5C2A)',
    accent: colors.bronze,
    perksMultiplier: '1x',
    benefits: [
      { es: '**1 punto** por cada $10 en compras', en: '**1 point** per $10 spent' },
      { es: 'Acceso a ofertas semanales', en: 'Access to weekly deals' },
      { es: 'Canje de puntos por crédito en tienda', en: 'Redeem points for store credit' },
      { es: 'Programa de referidos — **10 o 50 pts** por referido', en: 'Referral program — **10 or 50 pts** per referral' },
    ],
  },
  {
    key: 'PLATA',
    label: { es: 'PLATA', en: 'SILVER' },
    min: 500,
    max: 999,
    gradient: 'linear-gradient(135deg,#6B7280,#9CA3AF)',
    accent: colors.silver,
    perksMultiplier: '1.5x',
    benefits: [
      { es: '**1.5 puntos** por cada $10 en compras', en: '**1.5 points** per $10 spent' },
      { es: '**5% de descuento** en materiales seleccionados', en: '**5% discount** on select materials' },
      { es: 'Asesor VIP asignado a tu cuenta', en: 'VIP advisor assigned to your account' },
      { es: 'Acceso anticipado a promociones', en: 'Early access to promotions' },
      { es: 'Todo lo de Bronce incluido', en: 'Everything in Bronze included' },
    ],
  },
  {
    key: 'ORO',
    label: { es: 'ORO', en: 'GOLD' },
    min: 1000,
    max: null,
    gradient: 'linear-gradient(135deg,#92680A,#F0A500)',
    accent: colors.gold,
    perksMultiplier: '2x',
    benefits: [
      { es: '**2 puntos** por cada $10 en compras', en: '**2 points** per $10 spent' },
      { es: '**10% de descuento** en todos los materiales', en: '**10% discount** on all materials' },
      { es: 'Servicio prioritario en todas las tiendas', en: 'Priority service at all stores' },
      { es: 'Invitaciones a eventos exclusivos de The Ranch', en: 'Invitations to exclusive The Ranch events' },
      { es: 'Premio mensual especial (Cooler YETI, herramientas)', en: 'Special monthly prize (YETI cooler, tools)' },
      { es: 'Todo lo de Plata incluido', en: 'Everything in Silver included' },
    ],
  },
];

export function tierForPoints(points: number): TierName {
  if (points >= 1000) return 'ORO';
  if (points >= 500) return 'PLATA';
  return 'BRONCE';
}
