import { type FanSlot, fanLayout } from '../../entities/fan-layout.js';
import { type SeatSlot, seatLayout } from '../../entities/seats.js';
import type { StageLayout } from '../../layout/stage-layout.js';

export interface RowSlot {
  readonly index: number;
  readonly x: number;
  readonly y: number;
}

/** Unidades de mesa por píxel de pantalla en el centro de la mesa. */
export function tableUnit(layout: StageLayout): number {
  return 1 / Math.max(0.05, layout.baseScale);
}

export function handFan(count: number, layout: StageLayout): readonly FanSlot[] {
  const unit = tableUnit(layout);
  return fanLayout(count, {
    originX: 0,
    originY: 0,
    radius: 620 * unit,
    maxSpanDeg: 52,
    cardWidth: layout.cardWidth * unit * 1.05,
    maxWidth: layout.width * 0.78 * unit,
    overlap: 0.6,
  });
}export function tileHandFan(count: number, layout: StageLayout): readonly FanSlot[] {
  const unit = tableUnit(layout);
  return fanLayout(count, {
    originX: 0,
    originY: 0,
    radius: 720 * unit,
    maxSpanDeg: 46,
    cardWidth: layout.tileWidth * unit * 1.15,
    maxWidth: layout.width * 0.8 * unit,
    overlap: 0.55,
  });
}

export function cardRow(count: number, y: number, layout: StageLayout, maxRatio = 1.5): readonly RowSlot[] {
  if (count <= 0) return [];
  const spacing = Math.min(layout.cardWidth * maxRatio, (layout.width * 0.7) / Math.max(1, count)) * tableUnit(layout);
  return Array.from({ length: count }, (_, index) => ({
    index,
    x: (index - (count - 1) / 2) * spacing,
    y,
  }));
}

export function seatsFor(count: number, layout: StageLayout, viewerIndex: number): readonly SeatSlot[] {
  return seatLayout(count, {
    halfWidth: layout.tableHalfWidth * 0.82,
    halfHeight: layout.tableHalfHeight * 0.82,
    margin: 1.05,
  }, { viewerIndex, maxRotationDeg: 18 });
}

export function boardSizeFor(layout: StageLayout): number {
  return Math.max(140, Math.round(Math.min(layout.width * 0.54, layout.height * 0.52)));
}
