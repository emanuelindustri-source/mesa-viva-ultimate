import { type Theme, VectorAtlasGenerator } from '@mesa-viva/design-system';
import type { ThemeTextureAtlasOptions } from './texture-atlas.js';
import { loadThemeAtlas } from './texture-cache.js';

/**
 * Construye el atlas temático desde el generador procedural de la Fase 2.
 * Sin descargas externas: todo SVG se rasteriza en canvas y se sube a GPU.
 */
export function buildThemeTextureAtlas(
  theme: Theme,
  options: ThemeTextureAtlasOptions = {},
): ReturnType<typeof loadThemeAtlas> {
  const manifest = new VectorAtlasGenerator({ dominoMaxPip: 6 }).generate();
  return loadThemeAtlas(manifest, theme, options);
}
