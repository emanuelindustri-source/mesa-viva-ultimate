import { clamp } from '../math/vec3.js';

export interface HitTarget {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** Rotación en grados alrededor del centro. */
  readonly rotationDeg?: number;
  readonly elevation?: number;
  /** Orden de apilado; mayor significa más arriba dentro del mismo Z. */
  readonly order?: number;
}

export function pointInRotatedRect(x: number, y: number, target: HitTarget): boolean {
  const rotation = ((target.rotationDeg ?? 0) * Math.PI) / 180;
  const dx = x - target.x;
  const dy = y - target.y;
  const cos = Math.cos(-rotation);
  const sin = Math.sin(-rotation);
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;
  return Math.abs(localX) <= target.width / 2 && Math.abs(localY) <= target.height / 2;
}

/** Devuelve el id de la entidad más alta bajo el punto o null. */
export function pickTopmost(x: number, y: number, targets: readonly HitTarget[]): string | null {
  let winner: HitTarget | null = null;
  for (const target of targets) {
    if (!pointInRotatedRect(x, y, target)) continue;
    if (winner === null || compareDepth(target, winner) > 0) winner = target;
  }
  return winner?.id ?? null;
}

function compareDepth(a: HitTarget, b: HitTarget): number {
  const elevationDiff = (a.elevation ?? 0) - (b.elevation ?? 0);
  if (Math.abs(elevationDiff) > 1e-6) return elevationDiff;
  return (a.order ?? 0) - (b.order ?? 0);
}

/** Rectángulo mínimo que contiene una carta rotada, para culling rápido. */
export function boundingRect(target: HitTarget): {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
} {
  const rotation = ((target.rotationDeg ?? 0) * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rotation));
  const sin = Math.abs(Math.sin(rotation));
  const width = target.width * cos + target.height * sin;
  const height = target.width * sin + target.height * cos;
  return { x: target.x, y: target.y, width, height };
}

export function pointInsideBounds(x: number, y: number, bounds: ReturnType<typeof boundingRect>, padding = 0): boolean {
  const margin = clamp(padding, 0, 4096);
  return (
    Math.abs(x - bounds.x) <= bounds.width / 2 + margin &&
    Math.abs(y - bounds.y) <= bounds.height / 2 + margin
  );
}
