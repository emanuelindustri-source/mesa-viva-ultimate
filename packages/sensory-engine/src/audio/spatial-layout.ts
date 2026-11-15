import type { Vec3 } from '../types.js';

export interface SeatSpatialLayout {
  readonly id: string;
  readonly index: number;
  readonly position: Vec3;
}

export interface CardSpatialLayout {
  readonly id: string;
  readonly index: number;
  readonly position: Vec3;
}

export interface TableSpatialLayout {
  readonly seats: readonly SeatSpatialLayout[];
  readonly cards: readonly CardSpatialLayout[];
}

/** Asientos alrededor del tapete; el índice 0 mira hacia el centro. */
export function seatRingLayout(
  count: number,
  radius = 4.2,
  height = 1.05,
  rotation = 0,
): readonly SeatSpatialLayout[] {
  const total = Math.max(1, Math.floor(count));
  return Array.from({ length: total }, (_, index) => {
    const angle = rotation + (index / total) * Math.PI * 2;
    return {
      id: `asiento-${index}`,
      index,
      position: {
        x: Math.sin(angle) * radius,
        y: height,
        z: Math.cos(angle) * radius,
      },
    };
  });
}

/** Abanico de cartas en el centro, orientado hacia el asiento indicado. */
export function cardArcLayout(
  seat: Vec3,
  count: number,
  radius = 1.7,
  spread = 0.92,
  height = 0.16,
): readonly CardSpatialLayout[] {
  const total = Math.max(1, Math.floor(count));
  const baseAngle = Math.atan2(seat.x, seat.z);
  return Array.from({ length: total }, (_, index) => {
    const offset = total === 1 ? 0 : (index / (total - 1) - 0.5) * spread;
    const angle = baseAngle + offset;
    return {
      id: `carta-${index}`,
      index,
      position: {
        x: Math.sin(angle) * radius,
        y: height,
        z: Math.cos(angle) * radius,
      },
    };
  });
}

export function centerCardPosition(index: number, count: number, radius = 0.9): Vec3 {
  const total = Math.max(1, count);
  const angle = (index / total) * Math.PI * 2;
  return { x: Math.sin(angle) * radius, y: 0.12, z: Math.cos(angle) * radius };
}
