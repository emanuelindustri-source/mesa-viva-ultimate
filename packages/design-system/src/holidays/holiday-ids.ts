/**
 * Festividades soportadas por el HolidayEngine.
 * El modo "Día Normal" se gestiona aparte como ausencia de festividad activa.
 */
export const HOLIDAY_IDS = [
  'navidad',
  'halloween',
  'reyes-magos',
  'san-patricio',
  'san-valentin',
  'carnaval',
  'semana-santa',
  'dia-inocentes',
  'dia-madre',
  'dia-padre',
  'dia-nino',
  'dia-hijo',
  'dia-familia',
  'dia-tierra',
  'dia-encuentro-dos-mundos',
  'dia-independencia',
  'vacaciones-verano',
  'vacaciones-invierno',
  'ano-bisiesto',
  'dia-normal',
] as const;

export type HolidayId = (typeof HOLIDAY_IDS)[number];

/** Festividades temáticas reales (excluye el modo neutro). */
export const THEMED_HOLIDAY_IDS = HOLIDAY_IDS.filter(
  (id): id is Exclude<HolidayId, 'dia-normal'> => id !== 'dia-normal',
);
