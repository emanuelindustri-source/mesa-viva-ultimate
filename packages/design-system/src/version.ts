export const DESIGN_SYSTEM_VERSION = '0.1.0';

/** Los 6 formatos de pantalla objetivo del diseño adaptativo universal. */
export const SCREEN_FORMATS = [
  'movil',
  'tablet',
  'televisor',
  'laptop',
  'ultrawide',
  'plegable',
] as const;

export type ScreenFormat = (typeof SCREEN_FORMATS)[number];
