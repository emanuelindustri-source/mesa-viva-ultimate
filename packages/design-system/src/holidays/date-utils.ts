export interface PlainDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function utcDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  const date = utcDate(year, month + 1, 0);
  return date.getUTCDate();
}

export function isoFor(year: number, month: number, day: number): string {
  const date = utcDate(year, month, day);
  const y = date.getUTCFullYear().toString().padStart(4, '0');
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function parseIsoDate(value: string): PlainDate {
  const match = ISO_PATTERN.exec(value);
  if (match === null) throw new Error(`Fecha ISO inválida: ${value}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new Error(`Fecha fuera de rango: ${value}`);
  }
  return { year, month, day };
}

export function addDays(value: string, days: number): string {
  const { year, month, day } = parseIsoDate(value);
  const date = utcDate(year, month, day + days);
  return isoFor(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

/** Día de la semana en UTC: 0 = domingo, 6 = sábado. */
export function weekday(value: string): number {
  const { year, month, day } = parseIsoDate(value);
  return utcDate(year, month, day).getUTCDay();
}

export function dayOfYear(value: string): number {
  const { year, month, day } = parseIsoDate(value);
  const current = utcDate(year, month, day).getTime();
  const first = utcDate(year, 1, 1).getTime();
  return Math.round((current - first) / 86_400_000) + 1;
}

export function compareIso(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}

export function isWithin(value: string, start: string, end: string): boolean {
  return compareIso(value, start) >= 0 && compareIso(value, end) <= 0;
}

/** Fecha civil local del dispositivo, sin conversiones UTC sorpresivas. */
export function localIsoDate(date: Date = new Date()): string {
  return isoFor(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/** n-ésimo día de la semana del mes; n negativo cuenta desde el final. */
export function nthWeekdayOfMonth(
  year: number,
  month: number,
  dayOfWeek: number,
  nth: number,
): string | null {
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error('Día de la semana inválido');
  }
  if (!Number.isInteger(nth) || nth === 0 || Math.abs(nth) > 5) {
    throw new Error(' n debe ser un entero entre -5 y 5, distinto de cero');
  }
  if (nth > 0) {
    const first = weekday(isoFor(year, month, 1));
    const day = 1 + ((dayOfWeek - first + 7) % 7) + 7 * (nth - 1);
    return day <= daysInMonth(year, month) ? isoFor(year, month, day) : null;
  }
  const lastDay = daysInMonth(year, month);
  const last = weekday(isoFor(year, month, lastDay));
  const day = lastDay - ((last - dayOfWeek + 7) % 7) + 7 * (nth + 1);
  return day >= 1 ? isoFor(year, month, day) : null;
}

/** Rango inclusivo [inicio, fin] de un período que puede cruzar el año. */
export function periodRange(
  year: number,
  start: { readonly month: number; readonly day: number },
  end: { readonly month: number; readonly day: number },
): { readonly start: string; readonly end: string } {
  const startIso = isoFor(year, start.month, start.day);
  const endYear = end.month < start.month || (end.month === start.month && end.day < start.day) ? year + 1 : year;
  return { start: startIso, end: isoFor(endYear, end.month, end.day) };
}
