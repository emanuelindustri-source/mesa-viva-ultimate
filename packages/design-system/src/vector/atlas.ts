import { generateBoards } from './boards.js';
import { generateColorCards } from './cards-colors.js';
import { generateEnglishDeck } from './cards-english.js';
import { generateSpanishDeck } from './cards-spanish.js';
import { generateDominoSet } from './domino.js';
import { generateAdaptiveIcons } from './icons.js';
import { generateMedals } from './medals.js';
import { fnv1a, svgSprite } from './svg.js';
import type { AssetKind, AtlasKindCount, AtlasManifest, AtlasOptions, SvgAsset } from './types.js';

export const ATLAS_VERSION = '1.0.0';
export const ASSET_KINDS: readonly AssetKind[] = [
  'carta-espanola',
  'carta-inglesa',
  'carta-color',
  'ficha-domino',
  'tablero',
  'medalla',
  'icono-adaptativo',
];

export class VectorAtlasGenerator {
  private readonly dominoMaxPip: 6 | 9 | 12;
  private readonly includeSprite: boolean;
  private cached: AtlasManifest | null = null;

  constructor(options: AtlasOptions = {}) {
    this.dominoMaxPip = options.dominoMaxPip ?? 6;
    this.includeSprite = options.includeSprite ?? true;
  }

  generate(): AtlasManifest {
    if (this.cached !== null) return this.cached;
    const assets: SvgAsset[] = [
      ...generateSpanishDeck(),
      ...generateEnglishDeck(),
      ...generateColorCards(),
      ...generateDominoSet(this.dominoMaxPip),
      ...generateBoards(),
      ...generateMedals(),
      ...generateAdaptiveIcons(),
    ];
    const ids = assets.map((asset) => asset.id);
    const byKind: AtlasKindCount[] = ASSET_KINDS.map((kind) => ({
      kind,
      count: assets.filter((asset) => asset.kind === kind).length,
    }));
    const sprite = this.includeSprite ? svgSprite(assets) : '';
    const fingerprint = fnv1a(assets.map((asset) => `${asset.id}:${asset.markup}`).join('|'));
    this.cached = { version: ATLAS_VERSION, assets, ids, byKind, sprite, fingerprint };
    return this.cached;
  }

  getAssets(): readonly SvgAsset[] {
    return this.generate().assets;
  }

  getById(id: string): SvgAsset | null {
    return this.generate().assets.find((asset) => asset.id === id) ?? null;
  }

  toSprite(): string {
    return this.generate().sprite;
  }

  stats(): AtlasKindCount[] {
    return [...this.generate().byKind];
  }
}
