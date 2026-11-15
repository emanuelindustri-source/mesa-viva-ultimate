export interface MonthDay {
  readonly month: number;
  readonly day: number;
}

export type Hemisphere = 'north' | 'south';

/**
 * Día nacional o de independencia por país ISO 3166-1.
 * Para países sin independencia formal se usa su fiesta nacional equivalente.
 */
export const NATIONAL_DAYS: Readonly<Record<string, MonthDay>> = {
  VE: { month: 7, day: 5 },
  US: { month: 7, day: 4 },
  MX: { month: 9, day: 16 },
  CO: { month: 7, day: 20 },
  EC: { month: 8, day: 10 },
  PE: { month: 7, day: 28 },
  BO: { month: 8, day: 6 },
  CL: { month: 9, day: 18 },
  AR: { month: 7, day: 9 },
  PY: { month: 5, day: 14 },
  UY: { month: 8, day: 25 },
  BR: { month: 9, day: 7 },
  DO: { month: 2, day: 27 },
  CU: { month: 5, day: 20 },
  HT: { month: 1, day: 1 },
  PA: { month: 11, day: 3 },
  CR: { month: 9, day: 15 },
  SV: { month: 9, day: 15 },
  GT: { month: 9, day: 15 },
  HN: { month: 9, day: 15 },
  NI: { month: 9, day: 15 },
  JM: { month: 8, day: 6 },
  TT: { month: 8, day: 31 },
  BB: { month: 11, day: 30 },
  BS: { month: 7, day: 10 },
  BZ: { month: 9, day: 21 },
  GY: { month: 5, day: 26 },
  SR: { month: 11, day: 25 },
  ES: { month: 10, day: 12 },
  FR: { month: 7, day: 14 },
  DE: { month: 10, day: 3 },
  IT: { month: 6, day: 2 },
  PT: { month: 6, day: 10 },
  IE: { month: 3, day: 17 },
  NL: { month: 4, day: 27 },
  BE: { month: 7, day: 21 },
  CH: { month: 8, day: 1 },
  AT: { month: 10, day: 26 },
  SE: { month: 6, day: 6 },
  NO: { month: 5, day: 17 },
  DK: { month: 6, day: 5 },
  FI: { month: 12, day: 6 },
  PL: { month: 11, day: 11 },
  CZ: { month: 10, day: 28 },
  HU: { month: 8, day: 20 },
  RO: { month: 12, day: 1 },
  GR: { month: 3, day: 25 },
  TR: { month: 10, day: 29 },
  RU: { month: 6, day: 12 },
  UA: { month: 8, day: 24 },
  CA: { month: 7, day: 1 },
  AU: { month: 1, day: 26 },
  NZ: { month: 2, day: 6 },
  ZA: { month: 4, day: 27 },
  IN: { month: 8, day: 15 },
  JP: { month: 2, day: 11 },
  CN: { month: 10, day: 1 },
  KR: { month: 8, day: 15 },
  PH: { month: 6, day: 12 },
  ID: { month: 8, day: 17 },
  MY: { month: 8, day: 31 },
  SG: { month: 8, day: 9 },
  TH: { month: 12, day: 5 },
  VN: { month: 9, day: 2 },
  EG: { month: 7, day: 23 },
  NG: { month: 10, day: 1 },
  KE: { month: 12, day: 12 },
  MA: { month: 11, day: 18 },
  SA: { month: 9, day: 23 },
  AE: { month: 12, day: 2 },
  QA: { month: 12, day: 18 },
};

const SOUTHERN = new Set([
  'AR', 'AU', 'BO', 'BR', 'CL', 'PY', 'PE', 'UY', 'ZA', 'NZ', 'ID', 'TL', 'NA', 'BW', 'ZW', 'MZ', 'MG',
]);

export function independenceFor(country: string | null): MonthDay | null {
  if (country === null) return null;
  return NATIONAL_DAYS[country.toUpperCase()] ?? null;
}

export function hemisphereFor(country: string | null): Hemisphere {
  if (country !== null && SOUTHERN.has(country.toUpperCase())) return 'south';
  return 'north';
}

export function isKnownCountry(country: string | null): boolean {
  return country !== null && NATIONAL_DAYS[country.toUpperCase()] !== undefined;
}
