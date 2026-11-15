import { festiveTheme } from '../themes/festive.js';
import type { BrandOptions, BrandPalette } from './types.js';

const LIGHT: BrandPalette = {
  background: '#f7f1e5',
  surface: '#fffaf0',
  primary: '#00695c',
  accent: '#c9a227',
  ink: '#191713',
  muted: '#6d6355',
};

const DARK: BrandPalette = {
  background: '#12100e',
  surface: '#1d1915',
  primary: '#6fe3b0',
  accent: '#c9a227',
  ink: '#f4e6c1',
  muted: '#b9ab8f',
};

/** Paleta de marca derivada de la festividad, el modo y los overrides del usuario. */
export function brandPalette(options: BrandOptions = {}): BrandPalette {
  const mode = options.mode ?? 'dark';
  const base = mode === 'light' ? LIGHT : DARK;
  const festive = options.holidayId === undefined ? null : festiveTheme(options.holidayId);
  const holiday = festive === null
    ? {}
    : { accent: festive.accent, primary: festive.seed };
  return {
    ...base,
    ...holiday,
    ...(options.palette ?? {}),
  };
}

export function contrastInk(background: string): string {
  const hex = background.replace('#', '');
  if (hex.length !== 6) return '#ffffff';
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.58 ? '#17120b' : '#fff8e7';
}
