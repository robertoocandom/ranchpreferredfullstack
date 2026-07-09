export interface Localized {
  es: string;
  en: string;
}

// Fallback display values shown only until the real backend profile
// (fetched via /me after sign-in) has loaded.
export const contractor = {
  name: 'Carlos Hernández',
  email: 'carlos.h@contractormail.com',
};

export const colorSwatches: Array<{ name: Localized; hex: string; status: 'in' | 'low' }> = [
  { name: { es: 'Medium Brown', en: 'Medium Brown' }, hex: '#6B4226', status: 'in' },
  { name: { es: 'Cedar Natural', en: 'Cedar Natural' }, hex: '#C5A572', status: 'in' },
  { name: { es: 'Gray', en: 'Gray' }, hex: '#8A9099', status: 'low' },
  { name: { es: 'White', en: 'White' }, hex: '#EDE8E1', status: 'in' },
];

export const advisor = {
  name: 'Miguel Torres',
  initials: 'MT',
  store: 'Arlington',
  whatsapp: 'https://wa.me/18175550101',
};

export const weeklyOffer = {
  titleEs: "Postes de Cedro 8'\nSemi-Rustic",
  titleEn: "8' Cedar Posts\nSemi-Rustic",
  price: 2.89,
  originalPrice: 3.49,
  unitEs: '/ pieza',
  unitEn: '/ piece',
};
