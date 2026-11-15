import { describe, expect, it } from 'vitest';
import { HOLIDAY_IDS, THEMED_HOLIDAY_IDS } from '../src/holidays/holiday-ids.js';
import { SCREEN_FORMATS } from '../src/version.js';

describe('catálogo del sistema de diseño', () => {
  it('define exactamente los 6 formatos de pantalla', () => {
    expect(SCREEN_FORMATS).toHaveLength(6);
    expect(SCREEN_FORMATS).toContain('televisor');
    expect(SCREEN_FORMATS).toContain('plegable');
  });

  it('define las 19 festividades más el modo Día Normal', () => {
    expect(HOLIDAY_IDS).toHaveLength(20);
    expect(THEMED_HOLIDAY_IDS).toHaveLength(19);
    expect(THEMED_HOLIDAY_IDS).not.toContain('dia-normal');
  });

  it('no contiene identificadores duplicados', () => {
    expect(new Set(HOLIDAY_IDS).size).toBe(HOLIDAY_IDS.length);
  });
});
