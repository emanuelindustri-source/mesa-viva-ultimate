export interface DeviceContext {
  readonly locale: string;
  readonly language: string;
  readonly country: string | null;
  readonly timeZone: string;
}

/** Zonas horarias frecuentes para inferir el país cuando el locale no lo trae. */
export const TIMEZONE_COUNTRIES: Readonly<Record<string, string>> = {
  'America/Caracas': 'VE',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Mexico_City': 'MX',
  'America/Bogota': 'CO',
  'America/Lima': 'PE',
  'America/Santiago': 'CL',
  'America/Argentina/Buenos_Aires': 'AR',
  'America/Sao_Paulo': 'BR',
  'America/Panama': 'PA',
  'America/Santo_Domingo': 'DO',
  'America/Havana': 'CU',
  'Europe/Madrid': 'ES',
  'Europe/Canary': 'ES',
  'Europe/London': 'GB',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Rome': 'IT',
  'Europe/Lisbon': 'PT',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Zurich': 'CH',
  'Europe/Vienna': 'AT',
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI',
  'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ',
  'Europe/Budapest': 'HU',
  'Europe/Bucharest': 'RO',
  'Europe/Athens': 'GR',
  'Europe/Istanbul': 'TR',
  'Europe/Moscow': 'RU',
  'Europe/Kyiv': 'UA',
  'Asia/Kolkata': 'IN',
  'Asia/Tokyo': 'JP',
  'Asia/Shanghai': 'CN',
  'Asia/Seoul': 'KR',
  'Asia/Manila': 'PH',
  'Asia/Jakarta': 'ID',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Singapore': 'SG',
  'Asia/Bangkok': 'TH',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Qatar': 'QA',
  'Africa/Cairo': 'EG',
  'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE',
  'Africa/Casablanca': 'MA',
  'Africa/Johannesburg': 'ZA',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Pacific/Auckland': 'NZ',
};

export function regionFromLocale(locale: string): string | null {
  try {
    const parsed = new Intl.Locale(locale);
    const region = parsed.region ?? null;
    return region !== null && /^[A-Z]{2}$/.test(region) ? region : null;
  } catch {
    const parts = locale.split(/[-_]/);
    const candidate = (parts[1] ?? '').toUpperCase();
    return /^[A-Z]{2}$/.test(candidate) ? candidate : null;
  }
}

export function countryFromTimeZone(timeZone: string): string | null {
  const direct = TIMEZONE_COUNTRIES[timeZone];
  if (direct !== undefined) return direct;
  for (const [zone, country] of Object.entries(TIMEZONE_COUNTRIES)) {
    if (timeZone.startsWith(`${zone}/`)) return country;
  }
  return null;
}

function systemLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || 'es-VE';
  } catch {
    return 'es-VE';
  }
}

function systemTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export interface DeviceContextOverrides {
  readonly locale?: string;
  readonly timeZone?: string;
  readonly country?: string | null;
}

/** Detecta idioma, país y zona horaria con `Intl`, con respaldo por zona. */
export function detectDeviceContext(overrides: DeviceContextOverrides = {}): DeviceContext {
  const locale = overrides.locale ?? systemLocale();
  const timeZone = overrides.timeZone ?? systemTimeZone();
  const inferred = regionFromLocale(locale) ?? countryFromTimeZone(timeZone);
  const country = overrides.country !== undefined ? overrides.country : inferred;
  return {
    locale,
    language: (locale.toLowerCase().split('-')[0] ?? 'es'),
    country: country === null ? null : country.toUpperCase(),
    timeZone,
  };
}
