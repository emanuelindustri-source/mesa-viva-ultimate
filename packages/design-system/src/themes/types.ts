import type { HolidayId } from '../holidays/holiday-ids.js';
import type { ColorScheme, ColorSeedInput, ContrastLevel, ThemeMode } from '../tokens/color-types.js';
import type { ElevationLevel, ElevationToken } from '../tokens/elevation.js';
import type { AndroidDynamicColors } from '../tokens/material-you.js';
import type { RadiusToken, SpacingToken } from '../tokens/spacing.js';
import type { TypographyScale } from '../tokens/typography.js';
import type { UserPalette } from '../tokens/user-palettes.js';

export type ParticleKind =
  | 'snow'
  | 'confetti'
  | 'hearts'
  | 'leaves'
  | 'fireworks'
  | 'petals'
  | 'stars'
  | 'bubbles'
  | 'bats'
  | 'clovers'
  | 'sun'
  | 'none';

export type FrameKind =
  | 'garland'
  | 'cobweb'
  | 'stars'
  | 'clovers'
  | 'hearts'
  | 'serpentine'
  | 'olive'
  | 'gifts'
  | 'flags'
  | 'waves'
  | 'snow'
  | 'balloons'
  | 'leaves'
  | 'calendar'
  | 'none';

/** Identificadores estables que consumen partículas, marcos y audio. */
export interface FestiveTheme {
  readonly holidayId: HolidayId;
  readonly labelKey: string;
  readonly seed: string;
  readonly accent: string;
  readonly particles: ParticleKind;
  readonly frame: FrameKind;
  readonly icon: string;
  readonly musicId: string;
  readonly motif: string;
}

export interface Theme {
  readonly mode: ThemeMode;
  readonly locale: string;
  readonly contrast: ContrastLevel;
  readonly holidayId: HolidayId;
  readonly festive: FestiveTheme | null;
  readonly scheme: ColorScheme;
  readonly typography: TypographyScale;
  readonly elevations: Readonly<Record<ElevationLevel, ElevationToken>>;
  readonly spacing: Readonly<Record<SpacingToken, number>>;
  readonly radii: Readonly<Record<RadiusToken, number>>;
  readonly cssVariables: Readonly<Record<string, string>>;
}

export interface ThemeOptions {
  readonly mode?: ThemeMode;
  readonly locale?: string;
  readonly contrast?: ContrastLevel;
  readonly holidayId?: HolidayId | null;
  readonly seed?: ColorSeedInput;
  readonly typeScale?: number;
  readonly palette?: UserPalette | null;
  readonly palettes?: readonly UserPalette[];
  readonly dynamicColors?: AndroidDynamicColors | null;
  readonly preferDynamicColors?: boolean;
}
