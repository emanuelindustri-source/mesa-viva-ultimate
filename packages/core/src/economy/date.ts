const DAY_MS = 86_400_000;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function dayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function isValidDayKey(day: string): boolean {
  if (!DAY_PATTERN.test(day)) return false;
  const parsed = new Date(`${day}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && dayKey(parsed) === day;
}

function parseDay(day: string): Date {
  if (!isValidDayKey(day)) throw new Error(`Fecha inválida: ${day}`);
  return new Date(`${day}T00:00:00.000Z`);
}

export function addDays(day: string, delta: number): string {
  if (!Number.isInteger(delta)) throw new Error('El desplazamiento debe ser entero');
  return dayKey(new Date(parseDay(day).getTime() + delta * DAY_MS));
}

export function previousDay(day: string): string {
  return addDays(day, -1);
}

/** Lunes de la semana que contiene el día indicado. */
export function weekKey(day: string): string {
  const date = parseDay(day);
  const weekday = date.getUTCDay();
  const sinceMonday = (weekday + 6) % 7;
  return addDays(day, -sinceMonday);
}

export function compareDays(left: string, right: string): number {
  return left.localeCompare(right);
}
