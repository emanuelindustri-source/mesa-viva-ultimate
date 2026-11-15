import type { Texture } from 'pixi.js';

/** Puente mínimo entre el atlas rasterizado y las entidades. */
export interface TextureProvider {
  get(assetId: string): Texture | null;
}
