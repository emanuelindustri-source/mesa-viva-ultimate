import type { HolidayId } from '../holidays/holiday-ids.js';
import { normalizeHex } from './color-convert.js';
import type { ColorRole, ColorScheme, ContrastLevel, ThemeMode } from './color-types.js';
import { COLOR_ROLES } from './color-types.js';
import { schemeFromSeed } from './palette.js';

export type PaletteKind = 'normal' | 'festivo';

/** Paleta personal guardada por el jugador. */
export interface UserPalette {
  readonly id: string;
  readonly name: string;
  readonly kind: PaletteKind;
  readonly seed: string;
  readonly mode: ThemeMode;
  readonly contrast: ContrastLevel;
  readonly holidayId: HolidayId | null;
  readonly overrides: Readonly<Partial<Record<ColorRole, string>>>;
}

export interface UserPaletteInput {
  readonly id: string;
  readonly name: string;
  readonly seed: string;
  readonly kind?: PaletteKind;
  readonly mode?: ThemeMode;
  readonly contrast?: ContrastLevel;
  readonly holidayId?: HolidayId;
  readonly overrides?: Partial<Record<ColorRole, string>>;
}

function normalizeOverrides(
  overrides: Partial<Record<ColorRole, string>> | undefined,
): Partial<Record<ColorRole, string>> {
  if (overrides === undefined) return {};
  const normalized: Partial<Record<ColorRole, string>> = {};
  for (const role of COLOR_ROLES) {
    const value = overrides[role];
    if (value !== undefined) normalized[role] = normalizeHex(value);
  }
  return normalized;
}

export function createUserPalette(input: UserPaletteInput): UserPalette {
  if (input.id.trim().length === 0) throw new Error('La paleta necesita un identificador');
  if (input.name.trim().length === 0) throw new Error('La paleta necesita un nombre');
  const kind = input.kind ?? 'normal';
  if (kind === 'festivo' && input.holidayId === undefined) {
    throw new Error('Una paleta festiva debe indicar su festividad');
  }
  return {
    id: input.id.trim(),
    name: input.name.trim(),
    kind,
    seed: normalizeHex(input.seed),
    mode: input.mode ?? 'light',
    contrast: input.contrast ?? 'standard',
    holidayId: input.holidayId ?? null,
    overrides: normalizeOverrides(input.overrides),
  };
}

export function validateUserPalette(palette: UserPalette): string[] {
  const errors: string[] = [];
  if (palette.id.trim().length === 0) errors.push('identificador vacío');
  if (palette.name.trim().length === 0) errors.push('nombre vacío');
  try {
    normalizeHex(palette.seed);
  } catch {
    errors.push('semilla hexadecimal inválida');
  }
  for (const [role, value] of Object.entries(palette.overrides)) {
    if (!(COLOR_ROLES as readonly string[]).includes(role)) errors.push(`rol desconocido: ${role}`);
    if (typeof value === 'string') {
      try {
        normalizeHex(value);
      } catch {
        errors.push(`color inválido en ${role}`);
      }
    }
  }
  if (palette.kind === 'festivo' && palette.holidayId === null) {
    errors.push('falta la festividad de la paleta');
  }
  return errors;
}

export function mergeScheme(base: ColorScheme, overrides: Readonly<Partial<Record<ColorRole, string>>>): ColorScheme {
  return { ...base, ...overrides };
}

export function userPaletteScheme(palette: UserPalette): ColorScheme {
  return mergeScheme(schemeFromSeed(palette.seed, palette.mode, palette.contrast), palette.overrides);
}

export interface PaletteResolution {
  readonly palette: UserPalette;
  readonly scheme: ColorScheme;
  readonly source: 'festivo' | 'normal';
}

/** Elige la paleta festiva del día o, si no existe, la paleta normal. */
export function resolveUserPalette(
  palettes: readonly UserPalette[],
  mode: ThemeMode,
  holidayId: HolidayId | null,
): PaletteResolution | null {
  const available = palettes.filter((palette) => palette.mode === mode);
  if (holidayId !== null && holidayId !== 'dia-normal') {
    const festive = available.find((palette) => palette.kind === 'festivo' && palette.holidayId === holidayId);
    if (festive !== undefined) {
      return { palette: festive, scheme: userPaletteScheme(festive), source: 'festivo' };
    }
  }
  const normal = available.find((palette) => palette.kind === 'normal');
  if (normal === undefined) return null;
  return { palette: normal, scheme: userPaletteScheme(normal), source: 'normal' };
}

/** Paletas de fábrica: una clara y una oscura para días normales. */
export const DEFAULT_PALETTES: readonly UserPalette[] = [
  createUserPalette({ id: 'normal-claro', name: 'Mesa clara', seed: '#00695c', mode: 'light' }),
  createUserPalette({ id: 'normal-oscuro', name: 'Mesa oscura', seed: '#4db6ac', mode: 'dark' }),
];
