import { describe, expect, it } from 'vitest';
import {
  addDays,
  easterSunday,
  HOLIDAY_DEFINITIONS,
  HOLIDAY_IDS,
  HolidayEngine,
  isLeapYear,
  nthWeekdayOfMonth,
  parseIsoDate,
  periodRange,
  THEMED_HOLIDAY_IDS,
} from '../src/index.js';
import { FESTIVE_THEMES } from '../src/themes/festive.js';

const engine = new HolidayEngine({ locale: 'es-VE', timeZone: 'America/Caracas' });

describe('catálogo de festividades', () => {
  it('cubre 19 festividades y el Día Normal', () => {
    expect(HOLIDAY_IDS).toHaveLength(20);
    expect(THEMED_HOLIDAY_IDS).toHaveLength(19);
    expect(HOLIDAY_DEFINITIONS).toHaveLength(20);
    expect(FESTIVE_THEMES).toHaveLength(19);
    expect(new Set(THEMED_HOLIDAY_IDS)).toEqual(new Set(FESTIVE_THEMES.map((theme) => theme.holidayId)));
  });

  it('cada festividad temática tiene partículas, marco, icono y música', () => {
    for (const theme of FESTIVE_THEMES) {
      expect(theme.particles).not.toBe('none');
      expect(theme.frame).not.toBe('none');
      expect(theme.musicId).toBe(`music.${theme.holidayId}`);
      expect(theme.labelKey).toBe(`holidays.${theme.holidayId}`);
    }
  });
});

describe('matemática de fechas', () => {
  it('calcula Pascua en años conocidos', () => {
    expect(easterSunday(2024)).toBe('2024-03-31');
    expect(easterSunday(2025)).toBe('2025-04-20');
    expect(easterSunday(2026)).toBe('2026-04-05');
  });

  it('suma días y detecta años bisiestos', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2024-12-31', 1)).toBe('2025-01-01');
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2100)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });

  it('calcula el n-ésimo día de la semana', () => {
    expect(nthWeekdayOfMonth(2026, 5, 0, 2)).toBe('2026-05-10');
    expect(nthWeekdayOfMonth(2026, 5, 0, -1)).toBe('2026-05-31');
    expect(nthWeekdayOfMonth(2026, 4, 6, -1)).toBe('2026-04-25');
    expect(nthWeekdayOfMonth(2026, 2, 0, 5)).toBeNull();
  });

  it('crea períodos que cruzan el año', () => {
    expect(periodRange(2026, { month: 12, day: 20 }, { month: 1, day: 7 })).toEqual({
      start: '2026-12-20',
      end: '2027-01-07',
    });
  });

  it('valida fechas ISO', () => {
    expect(parseIsoDate('2024-02-29')).toEqual({ year: 2024, month: 2, day: 29 });
    expect(() => parseIsoDate('2026-02-29')).toThrow();
    expect(() => parseIsoDate('2026-13-01')).toThrow();
  });
});

describe('HolidayEngine: cada festividad se activa y vuelve a Día Normal', () => {
  it('resuelve las 19 festividades en su fecha primaria', () => {
    for (const id of THEMED_HOLIDAY_IDS) {
      if (id === 'vacaciones-verano' || id === 'vacaciones-invierno') continue;
      const year = id === 'ano-bisiesto' ? 2028 : 2026;
      const date = engine.getDate(id, year, 'VE');
      expect(date, `sin fecha para ${id}`).not.toBeNull();
      const resolution = engine.resolve(date ?? '', { country: 'VE' });
      expect(resolution.holidayId, `${id} en ${date ?? ''}`).toBe(id);
      expect(resolution.labelKey).toBe(`holidays.${id}`);
    }
  });

  it('el 29 de febrero solo existe en año bisiesto', () => {
    expect(engine.getDate('ano-bisiesto', 2028, 'VE')).toBe('2028-02-29');
    expect(engine.getDate('ano-bisiesto', 2027, 'VE')).toBeNull();
    expect(engine.resolve('2027-02-28', { country: 'VE' }).holidayId).toBe('dia-normal');
  });

  it('vuelve a Día Normal fuera de las ventanas', () => {
    const normal = engine.resolve('2026-06-10', { country: 'VE' });
    expect(normal.holidayId).toBe('dia-normal');
    expect(normal.isHoliday).toBe(false);
    expect(normal.window).toBeNull();
  });

  it('la ventana de San Valentín empieza siete días antes', () => {
    expect(engine.resolve('2026-02-06', { country: 'VE' }).holidayId).toBe('dia-normal');
    expect(engine.resolve('2026-02-07', { country: 'VE' }).holidayId).toBe('san-valentin');
    expect(engine.resolve('2026-02-14', { country: 'VE' }).holidayId).toBe('san-valentin');
    expect(engine.resolve('2026-02-18', { country: 'VE' }).holidayId).toBe('dia-normal');
  });

  it('respeta prioridad en solapamientos de diciembre', () => {
    expect(engine.resolve('2026-12-25', { country: 'VE' }).holidayId).toBe('navidad');
    expect(engine.resolve('2026-12-28', { country: 'VE' }).holidayId).toBe('dia-inocentes');
    expect(engine.resolve('2027-01-05', { country: 'VE' }).holidayId).toBe('reyes-magos');
  });

  it('acepta ventanas personalizadas', () => {
    const custom = engine.resolve('2026-01-20', {
      country: 'VE',
      windows: { 'san-valentin': { leadDays: 30, trailDays: 0 } },
    });
    expect(custom.holidayId).toBe('san-valentin');
  });

  it('lista las próximas festividades sin repetir ventanas', () => {
    const upcoming = engine.upcoming('2026-12-01', 4);
    expect(upcoming.map((item) => item.holidayId)).toEqual([
      'navidad',
      'dia-inocentes',
      'reyes-magos',
      'vacaciones-invierno',
    ]);
    expect(upcoming.every((item) => item.isHoliday)).toBe(true);
  });
});
