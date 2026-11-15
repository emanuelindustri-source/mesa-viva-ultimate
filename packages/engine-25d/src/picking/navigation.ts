export type FocusDirection = 'up' | 'down' | 'left' | 'right';

export interface FocusItem {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface FocusOptions {
  readonly wrap?: boolean;
  readonly cone?: number;
  readonly minDistance?: number;
}

const DIRECTION_VECTORS: Readonly<Record<FocusDirection, readonly [number, number]>> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

function center(item: FocusItem): readonly [number, number] {
  return [item.x + item.width / 2, item.y + item.height / 2];
}

function distance(a: FocusItem, b: FocusItem): number {
  const [ax, ay] = center(a);
  const [bx, by] = center(b);
  return Math.hypot(ax - bx, ay - by);
}

/**
 * Navegación espacial por cono para D-pad y control remoto. Prefiere el
 * elemento más alineado con la dirección y luego el más cercano.
 */
export function nextFocus(
  currentId: string | null,
  items: readonly FocusItem[],
  direction: FocusDirection,
  options: FocusOptions = {},
): string | null {
  if (items.length === 0) return null;
  const current = items.find((item) => item.id === currentId) ?? null;
  if (current === null) return items[0]?.id ?? null;
  const [dirX, dirY] = DIRECTION_VECTORS[direction];
  const [cx, cy] = center(current);
  const cone = Math.max(0.2, options.cone ?? 1.5);
  const minDistance = Math.max(0, options.minDistance ?? 4);
  let best: FocusItem | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  let fallback: FocusItem | null = null;
  let fallbackDistance = Number.POSITIVE_INFINITY;
  for (const item of items) {
    if (item.id === currentId) continue;
    const [ix, iy] = center(item);
    const dx = ix - cx;
    const dy = iy - cy;
    const primary = dx * dirX + dy * dirY;
    const perpendicular = Math.abs(dx * dirY - dy * dirX);
    const d = distance(current, item);
    if (d < fallbackDistance) {
      fallback = item;
      fallbackDistance = d;
    }
    if (primary < minDistance) continue;
    if (perpendicular > primary * cone) continue;
    const score = primary + perpendicular * 1.8 + d * 0.15;
    if (score < bestScore) {
      bestScore = score;
      best = item;
    }
  }
  if (best !== null) return best.id;
  if (options.wrap === true && fallback !== null) return fallback.id;
  return null;
}

export function firstFocus(items: readonly FocusItem[]): string | null {
  return items[0]?.id ?? null;
}
