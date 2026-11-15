import { hexToOklch, normalizeHex } from './color-convert.js';
import type { ColorScheme, ColorSeedInput, ContrastLevel, ThemeMode } from './color-types.js';
import {
  createTonalPalette,
  schemeFromPalettes,
  schemeFromSeed,
  type ThemePalettes,
  TONES,
  type TonalPalette,
} from './palette.js';

/** Android 12 introdujo Dynamic Colors (API 31). */
export const ANDROID_DYNAMIC_COLOR_MIN_API = 31;
export const MATERIAL_YOU_BRIDGE_VERSION = 1;

/** Paleta tonal exportada por el puente Kotlin: { "10": "#...", "40": "#..." }. */
export interface AndroidTonalPalette {
  readonly [tone: string]: string | undefined;
}

export interface AndroidDynamicColors {
  readonly accent1: AndroidTonalPalette;
  readonly accent2: AndroidTonalPalette;
  readonly accent3: AndroidTonalPalette;
  readonly neutral1: AndroidTonalPalette;
  readonly neutral2: AndroidTonalPalette;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parsePalette(value: unknown, field: string): AndroidTonalPalette {
  if (!isRecord(value)) throw new Error(`Paleta Android inválida: ${field}`);
  const tones: Record<string, string> = {};
  for (const [tone, color] of Object.entries(value)) {
    if (typeof color !== 'string') continue;
    tones[tone] = normalizeHex(color);
  }
  if (Object.keys(tones).length === 0) throw new Error(`Paleta Android vacía: ${field}`);
  return tones;
}

/** Lee el JSON emitido por `MaterialYouBridge.kt`. */
export function parseAndroidDynamicColors(json: string): AndroidDynamicColors {
  const parsed: unknown = JSON.parse(json);
  if (!isRecord(parsed)) throw new Error('El puente Android debe devolver un objeto JSON');
  return {
    accent1: parsePalette(parsed.accent1, 'accent1'),
    accent2: parsePalette(parsed.accent2, 'accent2'),
    accent3: parsePalette(parsed.accent3, 'accent3'),
    neutral1: parsePalette(parsed.neutral1, 'neutral1'),
    neutral2: parsePalette(parsed.neutral2, 'neutral2'),
  };
}

interface ToneEntry {
  readonly tone: number;
  readonly color: string;
}

function androidPalette(androidSource: AndroidTonalPalette, fallback: string): TonalPalette {
  const entries: ToneEntry[] = [];
  for (const [key, color] of Object.entries(androidSource)) {
    const toneValue = Number.parseInt(key, 10);
    if (Number.isFinite(toneValue) && typeof color === 'string') {
      entries.push({ tone: Math.max(0, Math.min(100, toneValue)), color: normalizeHex(color) });
    }
  }
  if (entries.length === 0) return createTonalPalette(fallback);
  const tones: Record<number, string> = {};
  for (const target of TONES) {
    let selected = entries[0] as ToneEntry;
    let distance = Number.POSITIVE_INFINITY;
    for (const entry of entries) {
      const current = Math.abs(entry.tone - target);
      if (current < distance) {
        selected = entry;
        distance = current;
      }
    }
    tones[target] = selected.color;
  }
  const source = tones[40] ?? (entries[0] as ToneEntry).color;
  const color = hexToOklch(source);
  return { source, hue: color.h, chroma: color.c, tones };
}

export function palettesFromAndroid(colors: AndroidDynamicColors): ThemePalettes {
  return {
    primary: androidPalette(colors.accent1, '#6750a4'),
    secondary: androidPalette(colors.accent2, '#625b71'),
    tertiary: androidPalette(colors.accent3, '#7d5260'),
    neutral: androidPalette(colors.neutral1, '#79747e'),
    neutralVariant: androidPalette(colors.neutral2, '#79747e'),
    error: createTonalPalette('#b3261e'),
  };
}

/** Convierte los colores dinámicos del dispositivo en los 37 roles del tema. */
export function schemeFromAndroidDynamicColors(
  colors: AndroidDynamicColors,
  mode: ThemeMode,
  contrast: ContrastLevel = 'standard',
): ColorScheme {
  return schemeFromPalettes(palettesFromAndroid(colors), mode, contrast);
}

export function supportsDynamicColor(apiLevel: number): boolean {
  return Number.isInteger(apiLevel) && apiLevel >= ANDROID_DYNAMIC_COLOR_MIN_API;
}

/** Respaldo para web, escritorio y Android antiguo: paleta derivada de una semilla. */
export function schemeFromMaterialSeed(
  seed: ColorSeedInput,
  mode: ThemeMode,
  contrast: ContrastLevel = 'standard',
): ColorScheme {
  return schemeFromSeed(seed, mode, contrast);
}
