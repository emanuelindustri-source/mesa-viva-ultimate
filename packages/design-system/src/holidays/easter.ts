import { addDays, isoFor } from './date-utils.js';

/**
 * Domingo de Pascua gregoriano (algoritmo de Meeus/Jones/Butcher).
 * Base de Carnaval, Semana Santa y otras festividades móviles.
 */
export function easterSunday(year: number): string {
  if (!Number.isInteger(year) || year < 1583) {
    throw new Error('El año debe ser un entero gregoriano (>= 1583)');
  }
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return isoFor(year, month, day);
}

export function easterOffset(year: number, days: number): string {
  return addDays(easterSunday(year), days);
}
