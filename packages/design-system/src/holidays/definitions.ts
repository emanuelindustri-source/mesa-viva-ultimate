import type { HolidayDefinition, HolidayWindow } from './definition-types.js';
import type { HolidayId } from './holiday-ids.js';

/** Reglas de las 19 festividades y del modo neutro. */
export const HOLIDAY_DEFINITIONS: readonly HolidayDefinition[] = [
  { id: 'navidad', priority: 110, rule: { type: 'fixed', month: 12, day: 25 }, leadDays: 24, trailDays: 6 },
  { id: 'halloween', priority: 60, rule: { type: 'fixed', month: 10, day: 31 }, leadDays: 6, trailDays: 2 },
  { id: 'reyes-magos', priority: 105, rule: { type: 'fixed', month: 1, day: 6 }, leadDays: 5, trailDays: 0 },
  { id: 'san-patricio', priority: 70, rule: { type: 'fixed', month: 3, day: 17 }, leadDays: 3, trailDays: 1 },
  { id: 'san-valentin', priority: 70, rule: { type: 'fixed', month: 2, day: 14 }, leadDays: 7, trailDays: 0 },
  { id: 'carnaval', priority: 95, rule: { type: 'easter-offset', days: -48 }, leadDays: 1, trailDays: 1 },
  { id: 'semana-santa', priority: 100, rule: { type: 'easter-offset', days: 0 }, leadDays: 7, trailDays: 0 },
  { id: 'dia-inocentes', priority: 115, rule: { type: 'fixed', month: 12, day: 28 }, leadDays: 0, trailDays: 0 },
  { id: 'dia-madre', priority: 65, rule: { type: 'regional', key: 'dia-madre' }, leadDays: 3, trailDays: 0 },
  { id: 'dia-padre', priority: 65, rule: { type: 'regional', key: 'dia-padre' }, leadDays: 3, trailDays: 0 },
  { id: 'dia-nino', priority: 60, rule: { type: 'regional', key: 'dia-nino' }, leadDays: 2, trailDays: 0 },
  { id: 'dia-hijo', priority: 60, rule: { type: 'regional', key: 'dia-hijo' }, leadDays: 2, trailDays: 0 },
  { id: 'dia-familia', priority: 55, rule: { type: 'fixed', month: 5, day: 15 }, leadDays: 2, trailDays: 0 },
  { id: 'dia-tierra', priority: 55, rule: { type: 'fixed', month: 4, day: 22 }, leadDays: 5, trailDays: 0 },
  { id: 'dia-encuentro-dos-mundos', priority: 90, rule: { type: 'fixed', month: 10, day: 12 }, leadDays: 2, trailDays: 0 },
  { id: 'dia-independencia', priority: 96, rule: { type: 'national-day' }, leadDays: 1, trailDays: 1 },
  { id: 'vacaciones-verano', priority: 10, rule: { type: 'vacation', season: 'summer' }, leadDays: 0, trailDays: 0 },
  { id: 'vacaciones-invierno', priority: 10, rule: { type: 'vacation', season: 'winter' }, leadDays: 0, trailDays: 0 },
  { id: 'ano-bisiesto', priority: 130, rule: { type: 'leap-day' }, leadDays: 0, trailDays: 0 },
  { id: 'dia-normal', priority: 0, rule: { type: 'normal' }, leadDays: 0, trailDays: 0 },
];

const BY_ID = new Map<HolidayId, HolidayDefinition>(
  HOLIDAY_DEFINITIONS.map((definition) => [definition.id, definition]),
);

export function definitionFor(id: HolidayId): HolidayDefinition {
  const definition = BY_ID.get(id);
  if (definition === undefined) throw new Error(`Festividad desconocida: ${id}`);
  return definition;
}

export function defaultWindows(): Readonly<Record<HolidayId, HolidayWindow>> {
  const windows: Partial<Record<HolidayId, HolidayWindow>> = {};
  for (const definition of HOLIDAY_DEFINITIONS) {
    windows[definition.id] = { leadDays: definition.leadDays, trailDays: definition.trailDays };
  }
  return windows as Record<HolidayId, HolidayWindow>;
}
