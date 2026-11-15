import { type Hemisphere, hemisphereFor, type MonthDay } from './countries.js';
import { isoFor, nthWeekdayOfMonth, periodRange } from './date-utils.js';
import { easterOffset } from './easter.js';

export type RegionalHolidayKey = 'dia-madre' | 'dia-padre' | 'dia-nino' | 'dia-hijo';

export type RegionalDateRule =
  | { readonly kind: 'fixed'; readonly month: number; readonly day: number }
  | { readonly kind: 'nth-weekday'; readonly month: number; readonly weekday: number; readonly nth: number }
  | { readonly kind: 'easter-offset'; readonly days: number };

const DEFAULT_RULES: Readonly<Record<RegionalHolidayKey, RegionalDateRule>> = {
  'dia-madre': { kind: 'nth-weekday', month: 5, weekday: 0, nth: 2 },
  'dia-padre': { kind: 'nth-weekday', month: 6, weekday: 0, nth: 3 },
  'dia-nino': { kind: 'nth-weekday', month: 7, weekday: 0, nth: 3 },
  'dia-hijo': { kind: 'nth-weekday', month: 8, weekday: 0, nth: 3 },
};

/** Fechas tradicionales que cambian de país (domingo 0 = domingo). */
export const REGIONAL_RULES: Readonly<Record<string, Partial<Record<RegionalHolidayKey, RegionalDateRule>>>> = {
  ES: {
    'dia-madre': { kind: 'nth-weekday', month: 5, weekday: 0, nth: 1 },
    'dia-padre': { kind: 'fixed', month: 3, day: 19 },
    'dia-hijo': { kind: 'fixed', month: 5, day: 15 },
  },
  IT: { 'dia-padre': { kind: 'fixed', month: 3, day: 19 } },
  PT: {
    'dia-madre': { kind: 'nth-weekday', month: 5, weekday: 0, nth: 1 },
    'dia-padre': { kind: 'fixed', month: 3, day: 19 },
  },
  BO: { 'dia-padre': { kind: 'fixed', month: 3, day: 19 } },
  MX: {
    'dia-madre': { kind: 'fixed', month: 5, day: 10 },
    'dia-nino': { kind: 'fixed', month: 4, day: 30 },
    'dia-hijo': { kind: 'fixed', month: 5, day: 30 },
  },
  AR: {
    'dia-madre': { kind: 'nth-weekday', month: 10, weekday: 0, nth: 3 },
    'dia-nino': { kind: 'nth-weekday', month: 8, weekday: 0, nth: 2 },
    'dia-hijo': { kind: 'nth-weekday', month: 8, weekday: 0, nth: 4 },
  },
  BR: {
    'dia-padre': { kind: 'nth-weekday', month: 8, weekday: 0, nth: 2 },
    'dia-nino': { kind: 'fixed', month: 10, day: 12 },
  },
  CL: { 'dia-nino': { kind: 'nth-weekday', month: 8, weekday: 0, nth: 2 } },
  PE: { 'dia-nino': { kind: 'nth-weekday', month: 8, weekday: 0, nth: 3 } },
  CO: { 'dia-nino': { kind: 'nth-weekday', month: 4, weekday: 6, nth: -1 } },
  FR: { 'dia-madre': { kind: 'nth-weekday', month: 5, weekday: 0, nth: -1 } },
  DE: { 'dia-padre': { kind: 'easter-offset', days: 39 } },
  JP: { 'dia-nino': { kind: 'fixed', month: 5, day: 5 } },
  IN: { 'dia-nino': { kind: 'fixed', month: 11, day: 14 } },
  CN: { 'dia-nino': { kind: 'fixed', month: 6, day: 1 } },
};

export function regionalDate(
  key: RegionalHolidayKey,
  year: number,
  country: string | null,
): string | null {
  const code = country === null ? null : country.toUpperCase();
  const rule = (code !== null ? REGIONAL_RULES[code]?.[key] : undefined) ?? DEFAULT_RULES[key];
  if (rule.kind === 'fixed') return isoFor(year, rule.month, rule.day);
  if (rule.kind === 'easter-offset') return easterOffset(year, rule.days);
  return nthWeekdayOfMonth(year, rule.month, rule.weekday, rule.nth);
}

export interface VacationPeriods {
  readonly summer: { readonly start: MonthDay; readonly end: MonthDay };
  readonly winter: { readonly start: MonthDay; readonly end: MonthDay };
}

const NORTH: VacationPeriods = {
  summer: { start: { month: 7, day: 1 }, end: { month: 8, day: 31 } },
  winter: { start: { month: 12, day: 20 }, end: { month: 1, day: 7 } },
};

const SOUTH: VacationPeriods = {
  summer: { start: { month: 1, day: 1 }, end: { month: 2, day: 28 } },
  winter: { start: { month: 7, day: 1 }, end: { month: 7, day: 31 } },
};

/** Calendarios escolares aproximados; cada país puede sobrescribirlos. */
export const VACATION_OVERRIDES: Readonly<Record<string, VacationPeriods>> = {
  VE: {
    summer: { start: { month: 7, day: 15 }, end: { month: 9, day: 15 } },
    winter: { start: { month: 12, day: 15 }, end: { month: 1, day: 7 } },
  },
  ES: {
    summer: { start: { month: 6, day: 21 }, end: { month: 9, day: 22 } },
    winter: { start: { month: 12, day: 21 }, end: { month: 1, day: 7 } },
  },
  US: {
    summer: { start: { month: 6, day: 1 }, end: { month: 8, day: 31 } },
    winter: { start: { month: 12, day: 20 }, end: { month: 1, day: 5 } },
  },
  MX: {
    summer: { start: { month: 7, day: 15 }, end: { month: 8, day: 31 } },
    winter: { start: { month: 12, day: 20 }, end: { month: 1, day: 7 } },
  },
  BR: {
    summer: { start: { month: 12, day: 20 }, end: { month: 2, day: 20 } },
    winter: { start: { month: 7, day: 1 }, end: { month: 7, day: 31 } },
  },
  AR: {
    summer: { start: { month: 12, day: 20 }, end: { month: 2, day: 28 } },
    winter: { start: { month: 7, day: 15 }, end: { month: 7, day: 31 } },
  },
  CL: {
    summer: { start: { month: 12, day: 20 }, end: { month: 2, day: 28 } },
    winter: { start: { month: 6, day: 25 }, end: { month: 7, day: 31 } },
  },
};

export function vacationPeriods(country: string | null): VacationPeriods {
  if (country !== null && VACATION_OVERRIDES[country] !== undefined) {
    return VACATION_OVERRIDES[country] as VacationPeriods;
  }
  return hemisphereFor(country) === 'south' ? SOUTH : NORTH;
}

export function vacationRange(
  key: 'summer' | 'winter',
  year: number,
  country: string | null,
): { readonly start: string; readonly end: string } {
  const periods = vacationPeriods(country);
  return periodRange(year, periods[key].start, periods[key].end);
}

/** Entrada útil para depurar por qué un país usa una regla concreta. */
export function regionalDateFor(
  key: RegionalHolidayKey,
  year: number,
  country: string | null,
): { readonly date: string | null; readonly country: string | null; readonly hemisphere: Hemisphere } {
  return { date: regionalDate(key, year, country), country, hemisphere: hemisphereFor(country) };
}
