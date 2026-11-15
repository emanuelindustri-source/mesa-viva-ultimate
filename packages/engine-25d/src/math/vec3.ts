import type { Vec3 } from '../version.js';

export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new Error('El mínimo no puede superar al máximo');
  }
  return Math.min(Math.max(value, min), max);
}

/** Interpolación lineal entre dos vectores; t se limita al rango [0, 1]. */
export function lerpVec3(from: Vec3, to: Vec3, t: number): Vec3 {
  const factor = clamp(t, 0, 1);
  return {
    x: from.x + (to.x - from.x) * factor,
    y: from.y + (to.y - from.y) * factor,
    z: from.z + (to.z - from.z) * factor,
  };
}

export const ZERO_VEC3: Vec3 = { x: 0, y: 0, z: 0 };
