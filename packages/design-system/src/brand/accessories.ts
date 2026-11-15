import type { HolidayId } from '../holidays/holiday-ids.js';
import { SPRING_ACCESSORIES } from './accessories-spring.js';
import { SUMMER_ACCESSORIES } from './accessories-summer.js';
import { WINTER_ACCESSORIES } from './accessories-winter.js';
import type { BrandPalette } from './types.js';

const ACCESSORIES = {
  ...WINTER_ACCESSORIES,
  ...SPRING_ACCESSORIES,
  ...SUMMER_ACCESSORIES,
};

/** Accesorio SVG mutante para cada una de las 19 festividades y Día Normal. */
export function holidayAccessory(id: HolidayId, palette: BrandPalette): string {
  const build = ACCESSORIES[id];
  return build === undefined ? '' : build(palette);
}

export function hasAccessory(id: HolidayId): boolean {
  return ACCESSORIES[id] !== undefined;
}
