import type { VibrateFn } from './types.js';

interface NavigatorWithVibration {
  readonly vibrate?: (pattern: number | number[]) => boolean;
}

/** Detecta la vibración web sin tocar `navigator` durante el import. */
export function detectWebVibration(): VibrateFn | null {
  if (typeof globalThis === 'undefined') return null;
  const navigatorLike = (globalThis as { navigator?: NavigatorWithVibration }).navigator;
  if (navigatorLike?.vibrate === undefined) return null;
  return (pattern: number | readonly number[]): boolean => {
    try {
      const value: number | number[] = typeof pattern === 'number' ? pattern : [...pattern];
      return navigatorLike.vibrate?.call(navigatorLike, value) ?? false;
    } catch {
      return false;
    }
  };
}
