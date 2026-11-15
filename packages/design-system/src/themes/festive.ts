import type { HolidayId } from '../holidays/holiday-ids.js';
import { SPRING_THEMES } from './festive-spring.js';
import { SUMMER_THEMES } from './festive-summer.js';
import { WINTER_THEMES } from './festive-winter.js';
import type { FestiveTheme } from './types.js';

/** Catálogo completo de las 19 festividades temáticas. */
export const FESTIVE_THEMES: readonly FestiveTheme[] = [...WINTER_THEMES, ...SPRING_THEMES, ...SUMMER_THEMES];

const BY_ID = new Map<HolidayId, FestiveTheme>(FESTIVE_THEMES.map((theme) => [theme.holidayId, theme]));

export function festiveTheme(id: HolidayId): FestiveTheme | null {
  return BY_ID.get(id) ?? null;
}

export function isThemedHoliday(id: HolidayId): boolean {
  return id !== 'dia-normal';
}

export function festivalSeeds(): Readonly<Record<string, string>> {
  return Object.fromEntries(FESTIVE_THEMES.map((theme) => [theme.holidayId, theme.seed]));
}

export function festivalMusic(id: HolidayId): string | null {
  return BY_ID.get(id)?.musicId ?? null;
}
