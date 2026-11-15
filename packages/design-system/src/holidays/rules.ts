import { independenceFor } from './countries.js';
import { addDays, daysInMonth, isLeapYear, isoFor, nthWeekdayOfMonth } from './date-utils.js';
import type { HolidayDefinition, HolidayOccurrence, HolidayWindows } from './definition-types.js';
import { HOLIDAY_DEFINITIONS } from './definitions.js';
import { easterOffset } from './easter.js';
import { regionalDate, vacationRange } from './regional.js';

export function primaryDateFor(
  definition: HolidayDefinition,
  year: number,
  country: string | null,
): string | null {
  const rule = definition.rule;
  if (rule.type === 'fixed') {
    return rule.day <= daysInMonth(year, rule.month) ? isoFor(year, rule.month, rule.day) : null;
  }
  if (rule.type === 'nth-weekday') {
    return nthWeekdayOfMonth(year, rule.month, rule.weekday, rule.nth);
  }
  if (rule.type === 'easter-offset') return easterOffset(year, rule.days);
  if (rule.type === 'regional') return regionalDate(rule.key, year, country);
  if (rule.type === 'national-day') {
    const national = independenceFor(country);
    return national === null ? null : isoFor(year, national.month, national.day);
  }
  if (rule.type === 'leap-day') return isLeapYear(year) ? isoFor(year, 2, 29) : null;
  return null;
}

export function occurrenceFor(
  definition: HolidayDefinition,
  year: number,
  country: string | null,
  windows: HolidayWindows = {},
): HolidayOccurrence | null {
  if (definition.rule.type === 'normal') return null;
  if (definition.rule.type === 'vacation') {
    const range = vacationRange(definition.rule.season, year, country);
    return {
      id: definition.id,
      primaryDate: range.start,
      start: range.start,
      end: range.end,
      priority: definition.priority,
      source: 'vacation',
    };
  }
  const primaryDate = primaryDateFor(definition, year, country);
  if (primaryDate === null) return null;
  const override = windows[definition.id];
  const leadDays = override?.leadDays ?? definition.leadDays;
  const trailDays = override?.trailDays ?? definition.trailDays;
  return {
    id: definition.id,
    primaryDate,
    start: addDays(primaryDate, -leadDays),
    end: addDays(primaryDate, trailDays),
    priority: definition.priority,
    source: 'rule',
  };
}

/** Todas las ocurrencias de un año; el motor consulta años vecinos por los rangos. */
export function occurrencesForYear(
  year: number,
  country: string | null,
  windows: HolidayWindows = {},
): readonly HolidayOccurrence[] {
  const occurrences: HolidayOccurrence[] = [];
  for (const definition of HOLIDAY_DEFINITIONS) {
    const occurrence = occurrenceFor(definition, year, country, windows);
    if (occurrence !== null) occurrences.push(occurrence);
  }
  return occurrences;
}
