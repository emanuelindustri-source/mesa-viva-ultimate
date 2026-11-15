import type { HolidayId } from '../holidays/holiday-ids.js';
import type { ColorScheme } from '../tokens/color-types.js';
import { COLOR_ROLES, type ColorSeedInput } from '../tokens/color-types.js';
import { createElevations, elevationCssVariables } from '../tokens/elevation.js';
import { schemeFromAndroidDynamicColors } from '../tokens/material-you.js';
import { schemeFromSeed } from '../tokens/palette.js';
import { RADII, SPACING, spacingCssVariables } from '../tokens/spacing.js';
import { createTypography, typographyToCssVariables } from '../tokens/typography.js';
import { resolveUserPalette, userPaletteScheme } from '../tokens/user-palettes.js';
import { festiveTheme } from './festive.js';
import type { Theme, ThemeOptions } from './types.js';

function colorVariables(scheme: ColorScheme): Record<string, string> {
  const variables: Record<string, string> = {};
  for (const role of COLOR_ROLES) variables[`--md-sys-color-${role}`] = scheme[role];
  return variables;
}

function seedFromFestive(holidayId: HolidayId, fallback: ColorSeedInput): ColorSeedInput {
  const theme = festiveTheme(holidayId);
  return theme === null ? fallback : { primary: theme.seed, secondary: theme.accent };
}

export function createTheme(options: ThemeOptions = {}): Theme {
  const mode = options.mode ?? options.palette?.mode ?? 'light';
  const locale = options.locale ?? 'es-VE';
  const contrast = options.contrast ?? options.palette?.contrast ?? 'standard';
  const holidayId = options.holidayId ?? 'dia-normal';
  const festive = festiveTheme(holidayId);
  const paletteResolution =
    options.palette !== null && options.palette !== undefined
      ? { scheme: userPaletteScheme(options.palette) }
      : options.palettes !== undefined
        ? resolveUserPalette(options.palettes, mode, holidayId)
        : null;
  let scheme: ColorScheme;
  if (
    options.dynamicColors !== null &&
    options.dynamicColors !== undefined &&
    options.preferDynamicColors !== false
  ) {
    scheme = schemeFromAndroidDynamicColors(options.dynamicColors, mode, contrast);
  } else if (paletteResolution !== null) {
    scheme = paletteResolution.scheme;
  } else {
    const base: ColorSeedInput = options.seed ?? seedFromFestive(holidayId, '#00695c');
    scheme = schemeFromSeed(base, mode, contrast);
  }
  const typography = createTypography(locale, options.typeScale ?? 1);
  const elevations = createElevations(mode);
  const cssVariables: Record<string, string> = {
    ...colorVariables(scheme),
    ...typographyToCssVariables(typography),
    ...elevationCssVariables(elevations),
    ...spacingCssVariables(),
    '--mv-mode': mode,
    '--mv-locale': locale,
    '--mv-holiday': holidayId,
    '--mv-festive-accent': festive?.accent ?? scheme.tertiary,
    '--mv-festive-particles': festive?.particles ?? 'none',
    '--mv-festive-frame': festive?.frame ?? 'none',
    '--mv-festive-icon': festive?.icon ?? 'none',
    '--mv-festive-music': festive?.musicId ?? 'none',
  };
  return {
    mode,
    locale,
    contrast,
    holidayId,
    festive,
    scheme,
    typography,
    elevations,
    spacing: SPACING,
    radii: RADII,
    cssVariables,
  };
}

export function themeCssText(theme: Theme, selector = ':root'): string {
  const declarations = Object.entries(theme.cssVariables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return `${selector} {\n${declarations}\n}`;
}
