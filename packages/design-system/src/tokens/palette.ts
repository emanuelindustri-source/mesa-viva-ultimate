import { hexToOklch, normalizeHex, oklchToHex } from './color-convert.js';
import type {
  ColorScheme,
  ColorSeed,
  ColorSeedInput,
  ContrastLevel,
  ThemeMode,
} from './color-types.js';

/** Tonalidades compartidas por las paletas Material You. */
export const TONES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 92, 94, 95, 96, 98, 99, 100] as const;
export type Tone = (typeof TONES)[number];

export interface TonalPalette {
  readonly source: string;
  readonly hue: number;
  readonly chroma: number;
  readonly tones: Readonly<Record<number, string>>;
}

export interface ThemePalettes {
  readonly primary: TonalPalette;
  readonly secondary: TonalPalette;
  readonly tertiary: TonalPalette;
  readonly neutral: TonalPalette;
  readonly neutralVariant: TonalPalette;
  readonly error: TonalPalette;
}

function rotate(seed: string, degrees: number, chromaScale: number): string {
  const color = hexToOklch(seed);
  return oklchToHex({ l: color.l, c: color.c * chromaScale, h: color.h + degrees });
}

export function createTonalPalette(seed: string, chromaScale = 1): TonalPalette {
  const source = normalizeHex(seed);
  const color = hexToOklch(source);
  const tones: Record<number, string> = {};
  for (const value of TONES) {
    if (value === 0) tones[value] = '#000000';
    else if (value === 100) tones[value] = '#ffffff';
    else tones[value] = oklchToHex({ l: value / 100, c: color.c * chromaScale, h: color.h });
  }
  return { source, hue: color.h, chroma: color.c * chromaScale, tones };
}

/** Devuelve la tonalidad exacta o la más cercana disponible. */
export function tone(palette: TonalPalette, target: number): string {
  if (palette.tones[target] !== undefined) return palette.tones[target] as string;
  let nearest: Tone = 50;
  let distance = Number.POSITIVE_INFINITY;
  for (const value of TONES) {
    const current = Math.abs(value - target);
    if (current < distance) {
      nearest = value;
      distance = current;
    }
  }
  return palette.tones[nearest] as string;
}

export function resolveSeed(input: ColorSeedInput): Required<ColorSeed> {
  const seed: ColorSeed = typeof input === 'string' ? { primary: input } : input;
  const primary = normalizeHex(seed.primary);
  return {
    primary,
    secondary: seed.secondary ? normalizeHex(seed.secondary) : rotate(primary, 40, 0.55),
    tertiary: seed.tertiary ? normalizeHex(seed.tertiary) : rotate(primary, 120, 0.8),
    neutral: seed.neutral ? normalizeHex(seed.neutral) : rotate(primary, 0, 0.08),
    error: seed.error ? normalizeHex(seed.error) : '#b3261e',
  };
}

export function createPalettes(input: ColorSeedInput): ThemePalettes {
  const seed = resolveSeed(input);
  return {
    primary: createTonalPalette(seed.primary),
    secondary: createTonalPalette(seed.secondary),
    tertiary: createTonalPalette(seed.tertiary),
    neutral: createTonalPalette(seed.neutral),
    neutralVariant: createTonalPalette(rotate(seed.primary, 0, 0.18)),
    error: createTonalPalette(seed.error),
  };
}

type PaletteKey = keyof ThemePalettes;

function tonal(
  palettes: ThemePalettes,
  key: PaletteKey,
  light: number,
  dark: number,
  mode: ThemeMode,
): string {
  return tone(palettes[key], mode === 'light' ? light : dark);
}

function tonePair(level: ContrastLevel): { lightA: number; lightB: number; darkA: number; darkB: number } {
  if (level === 'high') return { lightA: 30, lightB: 78, darkA: 90, darkB: 42 };
  if (level === 'medium') return { lightA: 35, lightB: 84, darkA: 85, darkB: 36 };
  return { lightA: 40, lightB: 90, darkA: 80, darkB: 30 };
}

/** Construye los 37 roles semánticos a partir de seis paletas tonales. */
export function schemeFromPalettes(
  palettes: ThemePalettes,
  mode: ThemeMode,
  contrast: ContrastLevel = 'standard',
): ColorScheme {
  const pair = tonePair(contrast);
  const light = mode === 'light';
  const main = light ? pair.lightA : pair.darkA;
  const container = light ? pair.lightB : pair.darkB;
  const onMain = light ? 100 : 10;
  const onContainer = light ? 10 : 100;
  const isHigh = contrast === 'high';
  return {
    primary: tonal(palettes, 'primary', main, main, mode),
    'on-primary': tonal(palettes, 'primary', onMain, onMain, mode),
    'primary-container': tonal(palettes, 'primary', container, container, mode),
    'on-primary-container': tonal(palettes, 'primary', onContainer, isHigh ? 100 : onContainer, mode),
    secondary: tonal(palettes, 'secondary', main, main, mode),
    'on-secondary': tonal(palettes, 'secondary', onMain, onMain, mode),
    'secondary-container': tonal(palettes, 'secondary', container, container, mode),
    'on-secondary-container': tonal(palettes, 'secondary', onContainer, onContainer, mode),
    tertiary: tonal(palettes, 'tertiary', main, main, mode),
    'on-tertiary': tonal(palettes, 'tertiary', onMain, onMain, mode),
    'tertiary-container': tonal(palettes, 'tertiary', container, container, mode),
    'on-tertiary-container': tonal(palettes, 'tertiary', onContainer, onContainer, mode),
    error: tonal(palettes, 'error', main, main, mode),
    'on-error': tonal(palettes, 'error', onMain, onMain, mode),
    'error-container': tonal(palettes, 'error', container, container, mode),
    'on-error-container': tonal(palettes, 'error', onContainer, onContainer, mode),
    background: tonal(palettes, 'neutral', 99, 5, mode),
    'on-background': tonal(palettes, 'neutral', 10, 90, mode),
    surface: tonal(palettes, 'neutral', 98, 5, mode),
    'on-surface': tonal(palettes, 'neutral', 10, 90, mode),
    'surface-variant': tonal(palettes, 'neutralVariant', 90, 30, mode),
    'on-surface-variant': tonal(palettes, 'neutralVariant', 30, 80, mode),
    outline: tonal(palettes, 'neutralVariant', 50, 60, mode),
    'outline-variant': tonal(palettes, 'neutralVariant', 80, 30, mode),
    shadow: '#000000',
    scrim: '#000000',
    'inverse-surface': tonal(palettes, 'neutral', 20, 90, mode),
    'inverse-on-surface': tonal(palettes, 'neutral', 95, 20, mode),
    'inverse-primary': tonal(palettes, 'primary', 80, 40, mode),
    'surface-tint': tonal(palettes, 'primary', main, main, mode),
    'surface-dim': tonal(palettes, 'neutral', 96, 5, mode),
    'surface-bright': tonal(palettes, 'neutral', 100, 25, mode),
    'surface-container-lowest': tonal(palettes, 'neutral', 100, 5, mode),
    'surface-container-low': tonal(palettes, 'neutral', 98, 10, mode),
    'surface-container': tonal(palettes, 'neutral', 96, 15, mode),
    'surface-container-high': tonal(palettes, 'neutral', 94, 20, mode),
    'surface-container-highest': tonal(palettes, 'neutral', 92, 25, mode),
  };
}

export function schemeFromSeed(
  input: ColorSeedInput,
  mode: ThemeMode,
  contrast: ContrastLevel = 'standard',
): ColorScheme {
  return schemeFromPalettes(createPalettes(input), mode, contrast);
}
