import { describe, expect, it } from 'vitest';
import {
  countryFromTimeZone,
  detectDeviceContext,
  HolidayEngine,
  isIndependenceName,
  loadOfficialHolidayProvider,
  type OfficialHolidayProvider,
  officialIndependenceDate,
  regionalDate,
  regionalDateFor,
  regionFromLocale,
  vacationRange,
} from '../src/index.js';

const engine = new HolidayEngine({ locale: 'es-VE', timeZone: 'America/Caracas' });

describe('detección de país con Intl', () => {
  it('obtiene el país del locale o de la zona horaria', () => {
    expect(detectDeviceContext({ locale: 'es-VE' }).country).toBe('VE');
    expect(detectDeviceContext({ locale: 'en-US', timeZone: 'America/New_York' }).country).toBe('US');
    expect(detectDeviceContext({ locale: 'en', timeZone: 'Asia/Tokyo' }).country).toBe('JP');
    expect(detectDeviceContext({ locale: 'en', timeZone: 'America/Caracas' }).country).toBe('VE');
  });

  it('extrae regiones y respalda zonas conocidas', () => {
    expect(regionFromLocale('zh-Hans-CN')).toBe('CN');
    expect(regionFromLocale('pt-BR')).toBe('BR');
    expect(regionFromLocale('es-419')).toBeNull();
    expect(countryFromTimeZone('Europe/Madrid')).toBe('ES');
    expect(countryFromTimeZone('Desconocida/Zona')).toBeNull();
  });

  it('el motor usa el país detectado', () => {
    const local = new HolidayEngine({ locale: 'es-VE', timeZone: 'America/Caracas' });
    expect(local.device.country).toBe('VE');
    expect(local.resolve('2026-07-05').holidayId).toBe('dia-independencia');
  });
});

describe('festividades nacionales y regionales', () => {
  it.each([
    ['VE', '2026-07-05'],
    ['US', '2026-07-04'],
    ['MX', '2026-09-16'],
    ['FR', '2026-07-14'],
    ['AR', '2026-07-09'],
  ] as const)('activa la independencia de %s el %s', (country, date) => {
    const resolution = engine.resolve(date, { country });
    expect(resolution.holidayId).toBe('dia-independencia');
    expect(resolution.primaryDate).toBe(date);
  });

  it('cambia el Día de la Madre y del Padre por país', () => {
    expect(regionalDate('dia-madre', 2026, 'VE')).toBe('2026-05-10');
    expect(regionalDate('dia-madre', 2026, 'ES')).toBe('2026-05-03');
    expect(regionalDate('dia-madre', 2026, 'MX')).toBe('2026-05-10');
    expect(regionalDate('dia-madre', 2026, 'AR')).toBe('2026-10-18');
    expect(regionalDate('dia-padre', 2026, 'ES')).toBe('2026-03-19');
    expect(regionalDate('dia-padre', 2026, 'VE')).toBe('2026-06-21');
    expect(regionalDate('dia-nino', 2026, 'MX')).toBe('2026-04-30');
    expect(regionalDateFor('dia-padre', 2026, 'DE').date).toBe('2026-05-14');
  });

  it('las vacaciones respetan hemisferio y país', () => {
    expect(vacationRange('summer', 2026, 'VE')).toEqual({ start: '2026-07-15', end: '2026-09-15' });
    expect(vacationRange('winter', 2026, 'AR')).toEqual({ start: '2026-07-15', end: '2026-07-31' });
    expect(engine.resolve('2026-08-01', { country: 'VE' }).holidayId).toBe('vacaciones-verano');
    expect(engine.resolve('2026-07-20', { country: 'AR' }).holidayId).toBe('vacaciones-invierno');
  });

  it('la ventana de invierno cede ante festividades específicas', () => {
    const windows = {
      navidad: { leadDays: 0, trailDays: 0 },
      'reyes-magos': { leadDays: 0, trailDays: 0 },
    };
    expect(engine.resolve('2026-12-20', { country: 'VE', windows }).holidayId).toBe('vacaciones-invierno');
    expect(engine.resolve('2026-12-25', { country: 'VE', windows }).holidayId).toBe('navidad');
  });
});

describe('respaldo con date-holidays', () => {
  it('detecta nombres de independencia', () => {
    expect(isIndependenceName('Día de la Independencia')).toBe(true);
    expect(isIndependenceName('Independence Day')).toBe(true);
    expect(isIndependenceName('Navidad')).toBe(false);
  });

  it('carga el proveedor real y encuentra el 5 de julio', async () => {
    const provider = await loadOfficialHolidayProvider();
    const holidays = provider.lookup('VE', 2026);
    expect(holidays.length).toBeGreaterThan(5);
    expect(officialIndependenceDate(provider, 'VE', 2026)).toBe('2026-07-05');
  });

  it('usa el proveedor para países sin tabla propia', () => {
    const stub: OfficialHolidayProvider = {
      lookup: (country, year) =>
        country === 'ZZ' && year === 2026
          ? [{ date: '2026-08-15', name: 'Independence Day', type: 'public' }]
          : [],
    };
    const custom = new HolidayEngine({ country: 'ZZ', officialHolidays: stub });
    const resolution = custom.resolve('2026-08-15');
    expect(resolution.holidayId).toBe('dia-independencia');
    expect(resolution.source).toBe('official');
    expect(resolution.officialName).toBe('Independence Day');
    expect(custom.getDate('dia-independencia', 2026)).toBe('2026-08-15');
    expect(custom.resolve('2026-08-16').holidayId).toBe('dia-independencia');
  });

  it('sin proveedor y sin tabla, el país extranjero queda en Día Normal', () => {
    const custom = new HolidayEngine({ country: 'ZZ' });
    expect(custom.resolve('2026-09-20').holidayId).toBe('dia-normal');
  });
});
