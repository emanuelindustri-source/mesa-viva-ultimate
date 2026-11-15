import type { AtlasManifest, Theme } from '@mesa-viva/design-system';
import { ThemeTextureAtlas, type ThemeTextureAtlasOptions } from './texture-atlas.js';

const cache = new Map<string, Promise<ThemeTextureAtlas>>();

/** Cache por huella de tema: la festividad del día no regenera SVG por frame. */
export function loadThemeAtlas(
  manifest: AtlasManifest,
  theme: Theme,
  options: ThemeTextureAtlasOptions = {},
): Promise<ThemeTextureAtlas> {
  const keyParts = [
    manifest.fingerprint,
    theme.mode,
    theme.holidayId,
    theme.scheme.primary,
    options.maxSheetSize ?? 2048,
    options.padding ?? 4,
    options.maxCardWidth ?? 112,
    options.maxBoardWidth ?? 512,
    options.includeIcons === true ? 1 : 0,
  ];
  const key = keyParts.join('|');
  const existing = cache.get(key);
  if (existing !== undefined) return existing;
  const pending = ThemeTextureAtlas.build(manifest, theme, options);
  cache.set(key, pending);
  pending.catch(() => cache.delete(key));
  return pending;
}

export async function disposeThemeAtlasCache(): Promise<void> {
  const pending = [...cache.values()];
  cache.clear();
  for (const promise of pending) {
    try {
      const atlas = await promise;
      atlas.destroy();
    } catch {
      // Un atlas fallido ya no tiene recursos que liberar.
    }
  }
}
