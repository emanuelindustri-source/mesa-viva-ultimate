/** Modos y niveles de contraste compatibles con Material You. */
export type ThemeMode = 'light' | 'dark';
export type ContrastLevel = 'standard' | 'medium' | 'high';

/** Roles semánticos de color. Ninguna vista debe usar colores crudos. */
export const COLOR_ROLES = [
  'primary',
  'on-primary',
  'primary-container',
  'on-primary-container',
  'secondary',
  'on-secondary',
  'secondary-container',
  'on-secondary-container',
  'tertiary',
  'on-tertiary',
  'tertiary-container',
  'on-tertiary-container',
  'error',
  'on-error',
  'error-container',
  'on-error-container',
  'background',
  'on-background',
  'surface',
  'on-surface',
  'surface-variant',
  'on-surface-variant',
  'outline',
  'outline-variant',
  'shadow',
  'scrim',
  'inverse-surface',
  'inverse-on-surface',
  'inverse-primary',
  'surface-tint',
  'surface-dim',
  'surface-bright',
  'surface-container-lowest',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
] as const;

export type ColorRole = (typeof COLOR_ROLES)[number];
export type ColorScheme = Readonly<Record<ColorRole, string>>;

/** Semillas de una paleta. Las opcionales se derivan de `primary`. */
export interface ColorSeed {
  readonly primary: string;
  readonly secondary?: string;
  readonly tertiary?: string;
  readonly neutral?: string;
  readonly error?: string;
}

export type ColorSeedInput = string | ColorSeed;

export interface SchemeRequest {
  readonly seed: ColorSeedInput;
  readonly mode: ThemeMode;
  readonly contrast?: ContrastLevel;
}

export interface ContrastCheck {
  readonly foregroundRole: ColorRole;
  readonly backgroundRole: ColorRole;
  readonly ratio: number;
  readonly passesAA: boolean;
  readonly passesAAA: boolean;
}

/** Pares mínimos que toda paleta generada debe superar. */
export const CONTRAST_PAIRS = [
  ['on-primary', 'primary'],
  ['on-primary-container', 'primary-container'],
  ['on-secondary', 'secondary'],
  ['on-tertiary', 'tertiary'],
  ['on-error', 'error'],
  ['on-background', 'background'],
  ['on-surface', 'surface'],
  ['on-surface-variant', 'surface-variant'],
  ['inverse-on-surface', 'inverse-surface'],
] as const;
