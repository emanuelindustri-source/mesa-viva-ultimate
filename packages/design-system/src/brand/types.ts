import type { HolidayId } from '../holidays/holiday-ids.js';
import type { ThemeMode } from '../tokens/color-types.js';

export interface BrandPalette {
  readonly background: string;
  readonly surface: string;
  readonly primary: string;
  readonly accent: string;
  readonly ink: string;
  readonly muted: string;
}

export interface BrandOptions {
  readonly holidayId?: HolidayId;
  readonly mode?: ThemeMode;
  readonly palette?: Partial<BrandPalette>;
  readonly size?: number;
  readonly title?: string;
  readonly monochrome?: boolean;
}

export interface GameEmblemOptions extends BrandOptions {
  readonly gameId: string;
}

export const BRAND_GAME_IDS = [
  'caida',
  'domino',
  'blackjack',
  'colores',
  'poker',
  'ajedrez',
] as const;
