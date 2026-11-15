import type { RenderCapabilities } from '../../render/mode.js';

interface NavigatorWithHints {
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: number;
  readonly connection?: { readonly saveData?: boolean };
}

function contextFor(canvas: HTMLCanvasElement, kind: 'webgl2' | 'webgl'): boolean {
  try {
    return canvas.getContext(kind) !== null;
  } catch {
    return false;
  }
}

/** Sonda de capacidades del navegador; nunca lanza en modo privado o CI. */
export function browserCapabilities(): RenderCapabilities {
  const capabilities: RenderCapabilities = {
    webgl2: false,
    webgl1: false,
    prefersReducedMotion: false,
  };
  if (typeof document === 'undefined' || typeof navigator === 'undefined') return capabilities;
  const canvas = document.createElement('canvas');
  const webgl2 = contextFor(canvas, 'webgl2');
  const webgl1 = webgl2 || contextFor(canvas, 'webgl');
  const media = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  const nav = navigator as unknown as NavigatorWithHints;
  return {
    webgl2,
    webgl1,
    prefersReducedMotion: media?.matches ?? false,
    ...(nav.deviceMemory !== undefined ? { deviceMemoryGB: nav.deviceMemory } : {}),
    ...(nav.hardwareConcurrency !== undefined ? { hardwareConcurrency: nav.hardwareConcurrency } : {}),
    ...(nav.connection?.saveData !== undefined ? { saveData: nav.connection.saveData } : {}),
  };
}
