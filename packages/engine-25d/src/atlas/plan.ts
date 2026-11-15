import {
  type AssetKind,
  type AtlasManifest,
  fnv1a,
  type SvgAsset,
  type Theme,
} from '@mesa-viva/design-system';
import { fitInside } from './svg.js';

export interface AtlasPlanOptions {
  readonly maxSheetSize?: number;
  readonly padding?: number;
  readonly includeIcons?: boolean;
  readonly maxCardWidth?: number;
  readonly maxBoardWidth?: number;
}

export interface AtlasCell {
  readonly assetId: string;
  readonly kind: AssetKind;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface AtlasSheetPlan {
  readonly index: number;
  readonly width: number;
  readonly height: number;
  readonly cells: readonly AtlasCell[];
}

export interface AtlasPlan {
  readonly cacheKey: string;
  readonly themeKey: string;
  readonly tint: string;
  readonly sheets: readonly AtlasSheetPlan[];
  readonly assetCount: number;
  readonly totalPixels: number;
}

interface SizedAsset {
  readonly asset: SvgAsset;
  readonly width: number;
  readonly height: number;
}

const KIND_BOX: Readonly<Record<AssetKind, readonly [number, number]>> = {
  'carta-espanola': [112, 160],
  'carta-inglesa': [112, 160],
  'carta-color': [112, 160],
  'ficha-domino': [128, 72],
  tablero: [512, 512],
  medalla: [256, 256],
  'icono-adaptativo': [108, 108],
};

export function themeAtlasKey(theme: Theme): string {
  const festive = theme.festive?.holidayId ?? 'dia-normal';
  return fnv1a(
    [theme.mode, theme.holidayId, festive, theme.scheme.primary, theme.scheme.tertiary, theme.contrast].join('|'),
  );
}

function sizeAsset(asset: SvgAsset, options: AtlasPlanOptions): SizedAsset {
  const box = KIND_BOX[asset.kind] ?? [112, 160];
  const isBoard = asset.kind === 'tablero';
  const maxWidth = isBoard ? (options.maxBoardWidth ?? box[0]) : (options.maxCardWidth ?? box[0]);
  const target = fitInside(
    { width: asset.width, height: asset.height },
    { width: maxWidth, height: isBoard ? maxWidth : box[1] },
  );
  return { asset, width: target.width, height: target.height };
}

export function selectAtlasAssets(
  manifest: AtlasManifest,
  theme: Theme,
  options: AtlasPlanOptions = {},
): readonly SizedAsset[] {
  const includeIcons = options.includeIcons === true || theme.festive !== null;
  return manifest.assets
    .filter((asset) => includeIcons || asset.kind !== 'icono-adaptativo')
    .map((asset) => sizeAsset(asset, options))
    .sort((a, b) => b.height - a.height || a.asset.id.localeCompare(b.asset.id));
}

/**
 * Empaqueta los SVG en hojas de atlas deterministas. No rasteriza: esa tarea
 * ocurre una sola vez en la GPU y se cachea por tema y festividad.
 */
export function planAtlas(
  manifest: AtlasManifest,
  theme: Theme,
  options: AtlasPlanOptions = {},
): AtlasPlan {
  const maxSheet = Math.max(512, Math.min(4096, options.maxSheetSize ?? 2048));
  const padding = Math.max(0, Math.min(32, options.padding ?? 4));
  const assets = selectAtlasAssets(manifest, theme, options);
  const sheets: AtlasSheetPlan[] = [];
  let cells: AtlasCell[] = [];
  let x = padding;
  let y = padding;
  let rowHeight = 0;
  let totalPixels = 0;
  const finishSheet = (): void => {
    if (cells.length === 0) return;
    const usedHeight = Math.min(maxSheet, y + rowHeight + padding);
    sheets.push({ index: sheets.length, width: maxSheet, height: usedHeight, cells });
    cells = [];
  };
  for (const sized of assets) {
    const cellWidth = Math.min(maxSheet - padding * 2, sized.width);
    const cellHeight = Math.min(maxSheet - padding * 2, sized.height);
    if (x > padding && x + cellWidth + padding > maxSheet) {
      x = padding;
      y += rowHeight + padding;
      rowHeight = 0;
    }
    if (y + cellHeight + padding > maxSheet) {
      finishSheet();
      x = padding;
      y = padding;
      rowHeight = 0;
    }
    cells.push({
      assetId: sized.asset.id,
      kind: sized.asset.kind,
      x,
      y,
      width: cellWidth,
      height: cellHeight,
    });
    totalPixels += cellWidth * cellHeight;
    x += cellWidth + padding;
    rowHeight = Math.max(rowHeight, cellHeight);
  }
  finishSheet();
  const cacheKey = fnv1a(
    [
      manifest.fingerprint,
      themeAtlasKey(theme),
      maxSheet,
      padding,
      options.includeIcons === true ? 'icons' : 'base',
      options.maxCardWidth ?? 112,
      options.maxBoardWidth ?? 512,
    ].join('|'),
  );
  return {
    cacheKey,
    themeKey: themeAtlasKey(theme),
    tint: theme.scheme.primary,
    sheets,
    assetCount: assets.length,
    totalPixels,
  };
}

export function assetsById(manifest: AtlasManifest): ReadonlyMap<string, SvgAsset> {
  const map = new Map<string, SvgAsset>();
  for (const asset of manifest.assets) map.set(asset.id, asset);
  return map;
}
