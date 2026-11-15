import { createTheme, VectorAtlasGenerator } from '@mesa-viva/design-system';
import { describe, expect, it } from 'vitest';
import { assetsById, planAtlas, themeAtlasKey } from '../src/atlas/plan.js';
import { fitInside, svgCellDataUri, svgToDataUri } from '../src/atlas/svg.js';
import { estimateAtlasMemory } from '../src/perf/memory.js';

const manifest = new VectorAtlasGenerator({ dominoMaxPip: 6 }).generate();

describe('planificación del atlas de texturas', () => {
  it('empaqueta todos los assets sin solapamientos ni desbordes', () => {
    const theme = createTheme({ holidayId: 'dia-normal' });
    const plan = planAtlas(manifest, theme, { maxSheetSize: 1024, maxCardWidth: 96, maxBoardWidth: 384 });
    expect(plan.assetCount).toBe(manifest.assets.length - 15);
    const cells = plan.sheets.flatMap((sheet) => sheet.cells);
    expect(cells).toHaveLength(plan.assetCount);
    for (const sheet of plan.sheets) {
      for (const cell of sheet.cells) {
        expect(cell.x).toBeGreaterThanOrEqual(0);
        expect(cell.y).toBeGreaterThanOrEqual(0);
        expect(cell.x + cell.width).toBeLessThanOrEqual(sheet.width);
        expect(cell.y + cell.height).toBeLessThanOrEqual(sheet.height);
      }
      for (let a = 0; a < sheet.cells.length; a += 1) {
        for (let b = a + 1; b < sheet.cells.length; b += 1) {
          const first = sheet.cells[a];
          const second = sheet.cells[b];
          if (first === undefined || second === undefined) continue;
          const separate =
            first.x + first.width <= second.x ||
            second.x + second.width <= first.x ||
            first.y + first.height <= second.y ||
            second.y + second.height <= first.y;
          expect(separate).toBe(true);
        }
      }
    }
    expect(plan.totalPixels).toBeGreaterThan(0);
    expect(estimateAtlasMemory(plan).megabytes).toBeCloseTo((plan.totalPixels * 4) / (1024 * 1024), 2);
    expect(assetsById(manifest).size).toBe(manifest.assets.length);
  });

  it('cambia la caché con el tema y la festividad', () => {
    const normal = createTheme({ holidayId: 'dia-normal' });
    const navidad = createTheme({ holidayId: 'navidad', mode: 'dark' });
    const halloween = createTheme({ holidayId: 'halloween' });
    const base = planAtlas(manifest, normal);
    expect(planAtlas(manifest, normal).cacheKey).toBe(base.cacheKey);
    expect(planAtlas(manifest, navidad).cacheKey).not.toBe(base.cacheKey);
    expect(planAtlas(manifest, halloween).cacheKey).not.toBe(planAtlas(manifest, navidad).cacheKey);
    expect(themeAtlasKey(normal)).not.toBe(themeAtlasKey(halloween));
    expect(planAtlas(manifest, navidad).assetCount).toBe(manifest.assets.length);
    expect(planAtlas(manifest, normal, { includeIcons: true }).assetCount).toBe(manifest.assets.length);
    expect(planAtlas(manifest, normal).tint).toBe(normal.scheme.primary);
  });

  it('genera URIs autocontenidas y ajusta proporciones', () => {
    const asset = manifest.assets[0];
    expect(asset).toBeDefined();
    if (asset === undefined) return;
    const uri = svgToDataUri(asset.markup);
    expect(uri.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(uri).not.toContain('<svg');
    const cell = svgCellDataUri({ asset, x: 0, y: 0, width: 64, height: 96 });
    expect(decodeURIComponent(cell)).toContain('viewBox');
    expect(decodeURIComponent(cell)).toContain('width="64"');
    expect(fitInside({ width: 300, height: 150 }, { width: 64, height: 64 })).toEqual({ width: 64, height: 32 });
    expect(fitInside({ width: 0, height: 0 }, { width: 10, height: 10 })).toEqual({ width: 10, height: 10 });
  });
});
