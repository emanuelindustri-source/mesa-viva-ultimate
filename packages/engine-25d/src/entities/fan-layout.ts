import { clamp } from '../math/vec3.js';

export interface FanOptions {
  readonly originX?: number;
  readonly originY?: number;
  readonly radius?: number;
  readonly maxSpanDeg?: number;
  readonly cardWidth?: number;
  readonly overlap?: number;
  readonly maxWidth?: number;
}

export interface FanSlot {
  readonly index: number;
  readonly x: number;
  readonly y: number;
  readonly rotationDeg: number;
  readonly scale: number;
  readonly z: number;
}

export const HAND_FAN_DEFAULTS: Required<FanOptions> = {
  originX: 0,
  originY: 0,
  radius: 520,
  maxSpanDeg: 54,
  cardWidth: 96,
  overlap: 0.62,
  maxWidth: 760,
};

/**
 * Abanico de mano determinista. Con muchas cartas reduce la separación antes
 * de ampliar el arco, para que nunca se salga del área segura.
 */
export function fanLayout(count: number, options: FanOptions = {}): readonly FanSlot[] {
  const total = Math.max(0, Math.floor(count));
  if (total === 0) return [];
  const config = { ...HAND_FAN_DEFAULTS, ...options };
  const radius = Math.max(120, config.radius);
  const cardWidth = Math.max(20, config.cardWidth);
  const naturalStep = cardWidth * clamp(config.overlap, 0.15, 1.4);
  const maxStep = total > 1 ? Math.max(12, (config.maxWidth - cardWidth) / (total - 1)) : naturalStep;
  const step = Math.min(naturalStep, maxStep);
  const span = Math.min(config.maxSpanDeg, ((total - 1) * step) / radius) * (180 / Math.PI);
  const slots: FanSlot[] = [];
  for (let index = 0; index < total; index += 1) {
    const t = total === 1 ? 0 : index / (total - 1) - 0.5;
    const angle = (t * span * Math.PI) / 180;
    const x = config.originX + Math.sin(angle) * radius + (index - (total - 1) / 2) * (step - naturalStep);
    const y = config.originY - Math.cos(angle) * radius + radius;
    slots.push({
      index,
      x,
      y,
      rotationDeg: t * span,
      scale: 1 - Math.abs(t) * 0.06,
      z: index,
    });
  }
  return slots;
}

/** Reordena la mano y devuelve las nuevas posiciones sin mutar la entrada. */
export function reorderFan<T>(cards: readonly T[], from: number, to: number): readonly T[] {
  if (cards.length === 0) return [];
  const clampedFrom = clamp(Math.trunc(from), 0, cards.length - 1);
  const clampedTo = clamp(Math.trunc(to), 0, cards.length - 1);
  const copy = [...cards];
  const [moved] = copy.splice(clampedFrom, 1);
  if (moved !== undefined) copy.splice(clampedTo, 0, moved);
  return copy;
}
