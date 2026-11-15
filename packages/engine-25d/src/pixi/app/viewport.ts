import type { ViewportInfo } from '@mesa-viva/design-system';

/** Mide el contenedor y conserva las señales nativas (TV, plegable, bisagra). */
export function measureViewport(container: HTMLElement, base: ViewportInfo | undefined): ViewportInfo {
  const rect = container.getBoundingClientRect();
  return {
    ...base,
    width: Math.max(320, Math.round(base?.width ?? (rect.width || 800))),
    height: Math.max(240, Math.round(base?.height ?? (rect.height || 600))),
    devicePixelRatio: base?.devicePixelRatio ?? (typeof window === 'undefined' ? 1 : window.devicePixelRatio),
  };
}
