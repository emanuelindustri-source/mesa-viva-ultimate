import { addDays, isWithin, localIsoDate, parseIsoDate } from './date-utils.js';
import type { HolidayOccurrence, HolidayWindows } from './definition-types.js';
import { definitionFor } from './definitions.js';
import type { HolidayId } from './holiday-ids.js';
import { loadOfficialHolidayProvider, type OfficialHolidayProvider, officialIndependenceHoliday } from './official.js';
import {
  type DeviceContext,
  type DeviceContextOverrides,
  detectDeviceContext,
} from './regions.js';
import { occurrencesForYear, primaryDateFor } from './rules.js';

export type HolidaySource = 'rule' | 'vacation' | 'official' | 'normal';

export interface HolidayResolution {
  readonly date: string;
  readonly holidayId: HolidayId;
  readonly isHoliday: boolean;
  readonly labelKey: string;
  readonly priority: number;
  readonly primaryDate: string | null;
  readonly window: { readonly start: string; readonly end: string } | null;
  readonly source: HolidaySource;
  readonly country: string | null;
  readonly locale: string;
  readonly timeZone: string;
  readonly officialName: string | null;
}

export interface HolidayEngineOptions {
  readonly locale?: string;
  readonly timeZone?: string;
  readonly country?: string | null;
  readonly windows?: HolidayWindows;
  readonly officialHolidays?: OfficialHolidayProvider;
}

export interface ResolveOptions {
  readonly country?: string | null;
  readonly windows?: HolidayWindows;
}

function contextOverrides(options: HolidayEngineOptions): DeviceContextOverrides {
  return {
    ...(options.locale !== undefined ? { locale: options.locale } : {}),
    ...(options.timeZone !== undefined ? { timeZone: options.timeZone } : {}),
    ...(options.country !== undefined ? { country: options.country } : {}),
  };
}

export class HolidayEngine {
  private readonly context: DeviceContext;
  private readonly windows: HolidayWindows;
  private officialHolidays: OfficialHolidayProvider | null;

  constructor(options: HolidayEngineOptions = {}) {
    this.context = detectDeviceContext(contextOverrides(options));
    this.windows = options.windows ?? {};
    this.officialHolidays = options.officialHolidays ?? null;
  }

  static async create(options: HolidayEngineOptions = {}): Promise<HolidayEngine> {
    const engine = new HolidayEngine(options);
    await engine.preloadOfficialHolidays();
    return engine;
  }

  /** Precarga `date-holidays` para habilitar el respaldo oficial por país. */
  async preloadOfficialHolidays(): Promise<void> {
    if (this.officialHolidays === null) {
      this.officialHolidays = await loadOfficialHolidayProvider();
    }
  }

  get device(): DeviceContext {
    return this.context;
  }

  getDate(id: HolidayId, year: number, country?: string | null): string | null {
    if (id === 'dia-normal') return null;
    const target = country !== undefined ? this.normalizeCountry(country) : this.context.country;
    const primary = primaryDateFor(definitionFor(id), year, target);
    if (primary !== null) return primary;
    if (id === 'dia-independencia') return this.officialIndependence(target, year)?.date ?? null;
    return null;
  }

  occurrences(year: number, country?: string | null, windows?: HolidayWindows): readonly HolidayOccurrence[] {
    const target = country !== undefined ? this.normalizeCountry(country) : this.context.country;
    return occurrencesForYear(year, target, windows ?? this.windows);
  }

  resolve(input?: Date | string, options: ResolveOptions = {}): HolidayResolution {
    if (typeof input === 'string') parseIsoDate(input);
    const date = typeof input === 'string' ? input : localIsoDate(input ?? new Date());
    const country = options.country !== undefined ? this.normalizeCountry(options.country) : this.context.country;
    const year = parseIsoDate(date).year;
    const windows = options.windows ?? this.windows;
    const candidates: HolidayOccurrence[] = [];
    for (const candidateYear of [year - 1, year, year + 1]) {
      for (const occurrence of occurrencesForYear(candidateYear, country, windows)) {
        if (isWithin(date, occurrence.start, occurrence.end)) candidates.push(occurrence);
      }
    }
    if (country !== null && primaryDateFor(definitionFor('dia-independencia'), year, country) === null) {
      const official = this.officialIndependence(country, year);
      if (official !== null && isWithin(date, addDays(official.date, -1), addDays(official.date, 1))) {
        return this.resolution(date, 'dia-independencia', true, 96, official.date, addDays(official.date, -1), addDays(official.date, 1), 'official', country, official.name);
      }
    }
    candidates.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      const aExact = a.primaryDate === date ? 1 : 0;
      const bExact = b.primaryDate === date ? 1 : 0;
      return bExact - aExact;
    });
    const winner = candidates[0];
    if (winner !== undefined) {
      return this.resolution(date, winner.id, true, winner.priority, winner.primaryDate, winner.start, winner.end, winner.source, country, null);
    }
    return this.resolution(date, 'dia-normal', false, 0, null, null, null, 'normal', country, null);
  }

  /** Próximas festividades únicas, sin repetir días dentro de la misma ventana. */
  upcoming(from: string = localIsoDate(), limit = 6): readonly HolidayResolution[] {
    const found: HolidayResolution[] = [];
    const seen = new Set<HolidayId>();
    for (let offset = 0; offset < 400 && found.length < limit; offset += 1) {
      const resolution = this.resolve(addDays(from, offset));
      if (resolution.isHoliday && !seen.has(resolution.holidayId)) {
        seen.add(resolution.holidayId);
        found.push(resolution);
      }
    }
    return found;
  }

  private normalizeCountry(country: string | null): string | null {
    return country === null ? null : country.toUpperCase();
  }

  private officialIndependence(country: string | null, year: number): { readonly date: string; readonly name: string } | null {
    if (country === null || this.officialHolidays === null) return null;
    for (const candidateYear of [year, year + 1]) {
      const match = officialIndependenceHoliday(this.officialHolidays, country, candidateYear);
      if (match !== null) return { date: match.date, name: match.name };
    }
    return null;
  }

  private resolution(
    date: string,
    holidayId: HolidayId,
    isHoliday: boolean,
    priority: number,
    primaryDate: string | null,
    start: string | null,
    end: string | null,
    source: HolidaySource,
    country: string | null,
    officialName: string | null,
  ): HolidayResolution {
    return {
      date,
      holidayId,
      isHoliday,
      labelKey: `holidays.${holidayId}`,
      priority,
      primaryDate,
      window: start !== null && end !== null ? { start, end } : null,
      source,
      country,
      locale: this.context.locale,
      timeZone: this.context.timeZone,
      officialName,
    };
  }
}
