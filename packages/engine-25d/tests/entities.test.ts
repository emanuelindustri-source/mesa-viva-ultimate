import { createTheme } from '@mesa-viva/design-system';
import { describe, expect, it } from 'vitest';
import { BOARD_PRESETS, cellCenter, createGridLayout, nearestCell, snapToCell } from '../src/entities/board-layout.js';
import { CHIP_DENOMINATIONS, chipStackLayout, dominantChipColor } from '../src/entities/chips.js';
import { clampDie, diceRollPlan, PIP_LAYOUTS, rollDie } from '../src/entities/dice.js';
import { dominoPips } from '../src/entities/domino-pips.js';
import { fanLayout, reorderFan } from '../src/entities/fan-layout.js';
import { glossForRank, seatFrameForRank } from '../src/entities/rank-gloss.js';
import { boardRotationForViewer, seatLayout } from '../src/entities/seats.js';
import { boardAssetId, cardAssetId, tileAssetId } from '../src/pixi/entities/asset-id.js';

describe('entidades primitivas universales', () => {
  it('reparte el abanico de la mano de forma simétrica', () => {
    expect(fanLayout(0)).toHaveLength(0);
    expect(fanLayout(1)[0]?.x).toBeCloseTo(0);
    const slots = fanLayout(7, { maxWidth: 360, cardWidth: 80 });
    expect(slots).toHaveLength(7);
    const xs = slots.map((slot) => slot.x);
    expect(xs[0]).toBeLessThan(0);
    expect(xs[xs.length - 1]).toBeGreaterThan(0);
    expect(Math.abs((xs[0] ?? 0) + (xs[xs.length - 1] ?? 0))).toBeLessThan(40);
    expect(slots.every((slot) => Math.abs(slot.rotationDeg) <= 54)).toBe(true);
    expect(reorderFan(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(reorderFan([], 0, 1)).toEqual([]);
  });

  it('calcula casillas, snapping y presets de tablero', () => {
    const layout = createGridLayout({ rows: 8, columns: 8, cellSize: 64, gap: 2, originX: 100, originY: 100 });
    const center = cellCenter(layout, 0, 0);
    expect(center.size).toBe(64);
    expect(center.x).toBeLessThan(100);
    expect(nearestCell(layout, 0, 0)).toEqual({ row: 2, column: 2 });
    expect(snapToCell(layout, 10000, 10000)).toMatchObject({ row: 7, column: 7 });
    expect(BOARD_PRESETS.go.rows).toBe(19);
    expect(BOARD_PRESETS.ajedrez.columns).toBe(8);
  });

  it('genera pips y tiradas deterministas de dados', () => {
    for (let value = 1; value <= 6; value += 1) {
      const pips = PIP_LAYOUTS[value as keyof typeof PIP_LAYOUTS];
      expect(pips).toHaveLength(value);
      expect(pips.every((pip) => pip.x > 0 && pip.x < 1 && pip.y > 0 && pip.y < 1)).toBe(true);
    }
    expect(clampDie(9)).toBe(6);
    expect(clampDie(-2)).toBe(1);
    expect(clampDie(Number.NaN)).toBe(1);
    expect(diceRollPlan(4, 77)).toEqual(diceRollPlan(4, 77));
    expect(diceRollPlan(4, 77, true).spinDeg).toBeLessThan(360);
    expect(rollDie(123)).toBeGreaterThanOrEqual(1);
    expect(rollDie(123)).toBeLessThanOrEqual(6);
  });

  it('distribuye pips de dominó y pilas de fichas virtuales', () => {
    expect(dominoPips(0)).toHaveLength(0);
    expect(dominoPips(6)).toHaveLength(6);
    expect(dominoPips(12)).toHaveLength(12);
    expect(dominoPips(99)).toHaveLength(12);
    const layout = chipStackLayout(287, { maxPerStack: 10, spacing: 30 });
    expect(layout.amount).toBe(287);
    expect(layout.stacks.reduce((sum, stack) => sum + stack.total, 0)).toBe(287);
    expect(layout.stacks.every((stack) => stack.count <= 10)).toBe(true);
    expect(dominantChipColor(layout, '#fff')).toBe(CHIP_DENOMINATIONS[1]?.color);
    expect(chipStackLayout(-5).stacks).toHaveLength(0);
  });

  it('coloca asientos alrededor de la mesa y rota el tablero', () => {
    const slots = seatLayout(4, { halfWidth: 600, halfHeight: 350 }, { viewerIndex: 1 });
    expect(slots).toHaveLength(4);
    expect(slots[1]?.isViewer).toBe(true);
    expect(slots[1]?.y).toBeGreaterThan(0);
    expect(Math.abs(slots[1]?.x ?? 0)).toBeLessThan(1);
    expect(new Set(slots.map((slot) => `${slot.x.toFixed(2)},${slot.y.toFixed(2)}`)).size).toBe(4);
    expect(boardRotationForViewer(4, 1)).toBe(270);
    expect(seatLayout(20, { halfWidth: 600, halfHeight: 350 })).toHaveLength(8);
  });

  it('asigna brillo por rango e ids estables del atlas', () => {
    const theme = createTheme();
    expect(glossForRank('A', theme).tier).toBe('oro');
    expect(glossForRank('9', theme).tier).toBe('plata');
    expect(glossForRank('3', theme).tier).toBe('satinado');
    expect(glossForRank('A', theme).metalness).toBeGreaterThan(glossForRank('3', theme).metalness);
    expect(seatFrameForRank('Maestro')).toBe('oro');
    expect(seatFrameForRank('Competitivo')).toBe('plata');
    expect(seatFrameForRank('Novato')).toBe('bronce');
    expect(cardAssetId('inglesa', 'A', 'picas')).toBe('carta-inglesa-spades-a');
    expect(cardAssetId('espanola', '12', 'oro')).toBe('carta-espanola-oros-12');
    expect(cardAssetId('color', 'salta', 'rojo')).toBe('carta-color-rojo-salta');
    expect(tileAssetId(6, 2)).toBe('ficha-domino-2-6');
    expect(boardAssetId('ajedrez')).toBe('tablero-ajedrez');
  });
});
