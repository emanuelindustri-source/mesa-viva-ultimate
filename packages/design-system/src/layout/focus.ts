export type FocusDirection = 'up' | 'down' | 'left' | 'right';

export interface FocusNode {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly disabled?: boolean;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

function center(node: FocusNode): Point {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

function isEnabled(node: FocusNode): boolean {
  return node.disabled !== true && node.width > 0 && node.height > 0;
}

export function firstFocusable(nodes: readonly FocusNode[]): string | null {
  return nodes.find(isEnabled)?.id ?? null;
}

/**
 * Navegación espacial para D-pad y control remoto. Prioriza la distancia en el
 * eje de movimiento y penaliza la desviación perpendicular.
 */
export function moveFocus(
  nodes: readonly FocusNode[],
  currentId: string | null,
  direction: FocusDirection,
): string | null {
  const enabled = nodes.filter(isEnabled);
  if (enabled.length === 0) return null;
  const current = enabled.find((node) => node.id === currentId);
  if (current === undefined) return enabled[0]?.id ?? null;
  const origin = center(current);
  let bestId: string | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const candidate of enabled) {
    if (candidate.id === current.id) continue;
    const target = center(candidate);
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    let primary: number;
    let secondary: number;
    if (direction === 'left') {
      if (dx >= 0) continue;
      primary = Math.abs(dx);
      secondary = Math.abs(dy);
    } else if (direction === 'right') {
      if (dx <= 0) continue;
      primary = Math.abs(dx);
      secondary = Math.abs(dy);
    } else if (direction === 'up') {
      if (dy >= 0) continue;
      primary = Math.abs(dy);
      secondary = Math.abs(dx);
    } else {
      if (dy <= 0) continue;
      primary = Math.abs(dy);
      secondary = Math.abs(dx);
    }
    if (primary < secondary * 0.5) continue;
    const score = primary + secondary * 2.5;
    if (score < bestScore) {
      bestScore = score;
      bestId = candidate.id;
    }
  }
  return bestId;
}

/** Orden de tabulación con salto circular para teclado. */
export function cycleFocus(
  nodes: readonly FocusNode[],
  currentId: string | null,
  step = 1,
): string | null {
  const enabled = nodes.filter(isEnabled);
  if (enabled.length === 0) return null;
  const index = enabled.findIndex((node) => node.id === currentId);
  if (index === -1) return enabled[0]?.id ?? null;
  const next = (index + step) % enabled.length;
  return enabled[(next + enabled.length) % enabled.length]?.id ?? null;
}
