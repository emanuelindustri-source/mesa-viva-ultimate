import type { ScreenFormat } from '../version.js';
import type { HingeInfo, ScreenOrientation, SizeClass, ViewportInfo } from './types.js';

export const MOBILE_MAX = 600;
export const TABLET_MAX = 1000;
export const ULTRAWIDE_ASPECT = 2.3;

export function aspectRatio(viewport: ViewportInfo): number {
  return viewport.width / Math.max(1, viewport.height);
}

export function orientationOf(viewport: ViewportInfo): ScreenOrientation {
  return viewport.width >= viewport.height ? 'landscape' : 'portrait';
}

export function sizeClassFor(width: number): SizeClass {
  if (width < MOBILE_MAX) return 'compact';
  if (width < TABLET_MAX) return 'medium';
  return 'expanded';
}

export function isSplitPosture(hinge: HingeInfo | undefined): boolean {
  if (hinge === undefined || !hinge.isSeparating) return false;
  return hinge.posture === 'half-open' || hinge.posture === 'book' || hinge.posture === 'tabletop';
}

/**
 * Clasifica los seis formatos. La TV y el plegable requieren señal del sistema;
 * el resto se deduce del viewport para no depender del user-agent.
 */
export function detectScreenFormat(viewport: ViewportInfo): ScreenFormat {
  if (viewport.isFoldable === true || viewport.hinge !== undefined) return 'plegable';
  if (viewport.isTelevision === true || viewport.platform === 'tv') return 'televisor';
  const aspect = aspectRatio(viewport);
  const shortest = Math.min(viewport.width, viewport.height);
  if (aspect >= ULTRAWIDE_ASPECT && viewport.width >= 1600) return 'ultrawide';
  if (aspect >= 1.5 && viewport.width >= 1024) return 'laptop';
  if (shortest < MOBILE_MAX) return 'movil';
  if (shortest < TABLET_MAX) return 'tablet';
  if (aspect >= 1.5) return 'laptop';
  return 'tablet';
}

/** Compatibilidad con pantallas plegables y modos de mesa dividida. */
export function splitPlanFor(viewport: ViewportInfo): { enabled: boolean; panes: 1 | 2; hinge: HingeInfo | null } {
  if (viewport.isFoldable !== true && viewport.hinge === undefined) {
    return { enabled: false, panes: 1, hinge: null };
  }
  const hinge = viewport.hinge ?? null;
  const enabled =
    hinge !== null && (isSplitPosture(hinge) || (hinge.isSeparating && viewport.width >= 600));
  return {
    enabled,
    panes: enabled ? 2 : 1,
    hinge,
  };
}
