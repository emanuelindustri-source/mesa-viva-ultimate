export type AssetKind =
  | 'carta-espanola'
  | 'carta-inglesa'
  | 'carta-color'
  | 'ficha-domino'
  | 'tablero'
  | 'medalla'
  | 'icono-adaptativo';

export interface SvgAsset {
  readonly id: string;
  readonly kind: AssetKind;
  readonly width: number;
  readonly height: number;
  readonly viewBox: string;
  readonly markup: string;
}

export interface AtlasKindCount {
  readonly kind: AssetKind;
  readonly count: number;
}

export interface AtlasManifest {
  readonly version: string;
  readonly assets: readonly SvgAsset[];
  readonly ids: readonly string[];
  readonly byKind: readonly AtlasKindCount[];
  readonly sprite: string;
  readonly fingerprint: string;
}

export interface AtlasOptions {
  readonly dominoMaxPip?: 6 | 9 | 12;
  readonly includeSprite?: boolean;
}

export interface CardPalette {
  readonly paper: string;
  readonly ink: string;
  readonly border: string;
  readonly accent: string;
}
