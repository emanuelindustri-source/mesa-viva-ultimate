import { clamp } from './vec3.js';

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * clamp(t, 0, 1);
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function easeOutCubic(t: number): number {
  const value = clamp(t, 0, 1);
  return 1 - (1 - value) ** 3;
}

export function easeOutBack(t: number, overshoot = 1.70158): number {
  const value = clamp(t, 0, 1);
  const c = overshoot + 1;
  return 1 + c * (value - 1) ** 3 + overshoot * (value - 1) ** 2;
}

/** Factor independiente del framerate para suavizar sensores y cámara. */
export function dampFactor(halfLifeSeconds: number, dtSeconds: number): number {
  const halfLife = Math.max(0.0001, halfLifeSeconds);
  const dt = clamp(dtSeconds, 0, 0.25);
  return 1 - 2 ** (-dt / halfLife);
}

export function moveTowards(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}
