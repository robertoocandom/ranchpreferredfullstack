export type TierName = 'BRONCE' | 'PLATA' | 'ORO';

export const TIER_THRESHOLDS: Record<TierName, { min: number; max: number | null; multiplier: number }> = {
  BRONCE: { min: 0, max: 499, multiplier: 1 },
  PLATA: { min: 500, max: 999, multiplier: 1.5 },
  ORO: { min: 1000, max: null, multiplier: 2 },
};

export function tierForPoints(points: number): TierName {
  if (points >= TIER_THRESHOLDS.ORO.min) return 'ORO';
  if (points >= TIER_THRESHOLDS.PLATA.min) return 'PLATA';
  return 'BRONCE';
}

export function multiplierForPoints(points: number): number {
  return TIER_THRESHOLDS[tierForPoints(points)].multiplier;
}
