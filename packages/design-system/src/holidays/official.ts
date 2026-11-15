export interface OfficialHoliday {
  readonly date: string;
  readonly name: string;
  readonly type: string;
}

export interface OfficialHolidayProvider {
  /** Fiestas oficiales del país y año. Devuelve [] si no hay datos. */
  readonly lookup: (country: string, year: number) => readonly OfficialHoliday[];
}

const INDEPENDENCE_PATTERN =
  /independ|freedom|national day|fiesta nacional|d[ií]a da independ|f[eê]te nationale|staatsfeiertag|festa nazionale|onafhankelijk|nationale feestdag/i;

/** Carga diferida de `date-holidays` para no inflar el paquete inicial. */
export async function loadOfficialHolidayProvider(): Promise<OfficialHolidayProvider> {
  const module = await import('date-holidays');
  const Holidays = module.default;
  const cache = new Map<string, readonly OfficialHoliday[]>();
  return {
    lookup: (country: string, year: number): readonly OfficialHoliday[] => {
      const key = `${country}:${year}`;
      const cached = cache.get(key);
      if (cached !== undefined) return cached;
      let result: readonly OfficialHoliday[] = [];
      try {
        const calendar = new Holidays(country, { languages: ['en', 'es'], types: ['public'] });
        result = calendar.getHolidays(year).map((holiday) => ({
          date: holiday.date.slice(0, 10),
          name: holiday.name,
          type: holiday.type,
        }));
      } catch {
        result = [];
      }
      cache.set(key, result);
      return result;
    },
  };
}

export function isIndependenceName(name: string): boolean {
  return INDEPENDENCE_PATTERN.test(name);
}

/** Respaldo para países sin tabla propia: busca una fiesta de independencia oficial. */
export function officialIndependenceHoliday(
  provider: OfficialHolidayProvider,
  country: string,
  year: number,
): OfficialHoliday | null {
  const matches = provider.lookup(country, year).filter((holiday) => isIndependenceName(holiday.name));
  const preferred = matches.find((holiday) => !/declar|declaration/i.test(holiday.name)) ?? matches[0];
  return preferred ?? null;
}

export function officialIndependenceDate(
  provider: OfficialHolidayProvider,
  country: string,
  year: number,
): string | null {
  return officialIndependenceHoliday(provider, country, year)?.date ?? null;
}
