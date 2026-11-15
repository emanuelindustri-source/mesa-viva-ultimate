import type { AtlasManifest, Theme } from '@mesa-viva/design-system';
import { Rectangle, Texture } from 'pixi.js';
import {
  type AtlasPlan,
  type AtlasPlanOptions,
  assetsById,
  planAtlas,
} from '../../atlas/plan.js';
import { svgCellDataUri } from '../../atlas/svg.js';

export interface ThemeTextureAtlasOptions extends AtlasPlanOptions {
  readonly signal?: AbortSignal;
}

/**
 * Rasteriza el atlas SVG una sola vez por tema/festividad y devuelve
 * subtexturas de GPU listas para Sprite, sin descargar imágenes externas.
 */
export class ThemeTextureAtlas {
  readonly plan: AtlasPlan;
  private readonly textures: ReadonlyMap<string, Texture>;
  private readonly baseTextures: readonly Texture[];

  private constructor(plan: AtlasPlan, textures: ReadonlyMap<string, Texture>, baseTextures: readonly Texture[]) {
    this.plan = plan;
    this.textures = textures;
    this.baseTextures = baseTextures;
  }

  static async build(
    manifest: AtlasManifest,
    theme: Theme,
    options: ThemeTextureAtlasOptions = {},
  ): Promise<ThemeTextureAtlas> {
    const plan = planAtlas(manifest, theme, options);
    const assets = assetsById(manifest);
    const textures = new Map<string, Texture>();
    const bases: Texture[] = [];
    try {
      for (const sheet of plan.sheets) {
        if (options.signal?.aborted === true) throw new Error('Atlas cancelado');
        const canvas = document.createElement('canvas');
        canvas.width = sheet.width;
        canvas.height = sheet.height;
        const context = canvas.getContext('2d');
        if (context === null) throw new Error('Canvas 2D no disponible para el atlas');
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        const images = await Promise.all(
          sheet.cells.map(async (cell) => {
            const asset = assets.get(cell.assetId);
            if (asset === undefined) return null;
            const image = await loadSvgImage(
              svgCellDataUri({ asset, x: 0, y: 0, width: cell.width, height: cell.height }),
            );
            return { cell, image };
          }),
        );
        for (const entry of images) {
          if (entry === null) continue;
          context.drawImage(entry.image, entry.cell.x, entry.cell.y, entry.cell.width, entry.cell.height);
        }
        const base = Texture.from(canvas);
        base.source.scaleMode = 'linear';
        bases.push(base);
        for (const cell of sheet.cells) {
          textures.set(cell.assetId, new Texture({
            source: base.source,
            frame: new Rectangle(cell.x, cell.y, cell.width, cell.height),
          }));
        }
      }
    } catch (error) {
      for (const base of bases) base.destroy(true);
      throw error;
    }
    return new ThemeTextureAtlas(plan, textures, bases);
  }

  get(assetId: string): Texture | null {
    return this.textures.get(assetId) ?? null;
  }

  has(assetId: string): boolean {
    return this.textures.has(assetId);
  }

  get textureCount(): number {
    return this.textures.size;
  }

  get cacheKey(): string {
    return this.plan.cacheKey;
  }

  destroy(): void {
    for (const texture of this.textures.values()) texture.destroy(false);
    for (const base of this.baseTextures) base.destroy(true);
  }
}

function loadSvgImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo rasterizar un SVG del atlas'));
    image.src = uri;
  });
}
