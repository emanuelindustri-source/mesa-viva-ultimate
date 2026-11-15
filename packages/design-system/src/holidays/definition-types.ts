import type { HolidayId } from './holiday-ids.js';
import type { RegionalHolidayKey } from './regional.js';

export type HolidayRule =
  | { readonly type: 'fixed'; readonly month: number; readonly day: number }
  | { readonly type: 'nth-weekday'; readonly month: number; readonly weekday: number; readonly nth: number }
  | { readonly type: 'easter-offset'; readonly days: number }
  | { readonly type: 'regional'; readonly key: RegionalHolidayKey }
  | { readonly type: 'national-day' }
  | { readonly type: 'vacation'; readonly season: 'summer' | 'winter' }
  | { readonly type: 'leap-day' }
  | { readonly type: 'normal' };

export interface HolidayDefinition {
  readonly id: HolidayId;
  readonly priority: number;
  readonly rule: HolidayRule;
  readonly leadDays: number;
  readonly trailDays: number;
}

export interface HolidayWindow {
  readonly leadDays: number;
  readonly trailDays: number;
}

/** Ventanas configurables por el usuario o por la temporada. */
export type HolidayWindows = Partial<Record<HolidayId, HolidayWindow>>;

export interface HolidayOccurrence {
  readonly id: HolidayId;
  readonly primaryDate: string;
  readonly start: string;
  readonly end: string;
  readonly priority: number;
  readonly source: 'rule' | 'vacation';
}
