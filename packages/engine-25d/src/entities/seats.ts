import { clamp } from '../math/vec3.js';

export interface SeatTable {
  readonly halfWidth: number;
  readonly halfHeight: number;
  readonly margin?: number;
}

export interface SeatSlot {
  readonly index: number;
  readonly x: number;
  readonly y: number;
  readonly angleDeg: number;
  readonly rotationDeg: number;
  readonly isViewer: boolean;
}

export interface SeatLayoutOptions {
  readonly viewerIndex?: number;
  readonly margin?: number;
  readonly maxRotationDeg?: number;
}

/**
 * Reparte los asientos alrededor de la mesa. El espectador siempre queda abajo
 * y los demás giran en sentido horario para que la mesa se lea desde su silla.
 */
export function seatLayout(playerCount: number, table: SeatTable, options: SeatLayoutOptions = {}): readonly SeatSlot[] {
  const count = clamp(Math.floor(playerCount), 1, 8);
  const halfWidth = Math.max(40, table.halfWidth);
  const halfHeight = Math.max(30, table.halfHeight);
  const margin = Math.max(1, options.margin ?? table.margin ?? 1.18);
  const viewerIndex = clamp(Math.floor(options.viewerIndex ?? 0), 0, count - 1);
  const maxRotation = Math.max(0, options.maxRotationDeg ?? 26);
  const slots: SeatSlot[] = [];
  for (let index = 0; index < count; index += 1) {
    const relative = index - viewerIndex;
    const angle = Math.PI / 2 + (relative * Math.PI * 2) / count;
    slots.push({
      index,
      x: Math.cos(angle) * halfWidth * margin,
      y: Math.sin(angle) * halfHeight * margin,
      angleDeg: normalizeDegrees((angle * 180) / Math.PI),
      rotationDeg: clamp(Math.cos(angle) * maxRotation, -maxRotation, maxRotation),
      isViewer: index === viewerIndex,
    });
  }
  return slots;
}

export function normalizeDegrees(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function seatForPlayer(slots: readonly SeatSlot[], playerIndex: number): SeatSlot | null {
  return slots[playerIndex] ?? null;
}

/** Rota la mesa para que el jugador activo quede abajo, sin mover asientos. */
export function boardRotationForViewer(playerCount: number, viewerIndex: number): number {
  const count = Math.max(1, playerCount);
  return normalizeDegrees(-(viewerIndex / count) * 360);
}
