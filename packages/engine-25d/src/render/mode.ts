import type { QualityTier } from '../perf/quality.js';

export type RenderBackend = 'webgl2' | 'webgl1' | 'dom';

export type MotionLevel = 'full' | 'reduced' | 'disabled';

export interface RenderCapabilities {
  readonly webgl2: boolean;
  readonly webgl1: boolean;
  readonly offscreenCanvas?: boolean;
  readonly prefersReducedMotion?: boolean;
  readonly saveData?: boolean;
  readonly deviceMemoryGB?: number;
  readonly hardwareConcurrency?: number;
}

export interface RenderPlan {
  readonly backend: RenderBackend;
  readonly quality: QualityTier;
  readonly motion: MotionLevel;
  readonly antialias: boolean;
  readonly maxPixelRatio: number;
  readonly reason: string;
}

function tierFor(capabilities: RenderCapabilities): QualityTier {
  const memory = capabilities.deviceMemoryGB ?? 4;
  const cores = capabilities.hardwareConcurrency ?? 8;
  if (capabilities.saveData === true || memory < 2 || cores <= 4) return 'baja';
  if (memory < 4 || cores <= 6) return 'media';
  return 'alta';
}

/**
 * Elige backend y calidad antes de inicializar PixiJS. Sin WebGL se usa el
 * respaldo DOM, nunca una pantalla en blanco.
 */
export function planRender(capabilities: RenderCapabilities): RenderPlan {
  const reduced = capabilities.prefersReducedMotion === true;
  const motion: MotionLevel = reduced ? 'reduced' : capabilities.saveData === true ? 'reduced' : 'full';
  if (capabilities.webgl2) {
    const quality = tierFor(capabilities);
    return {
      backend: 'webgl2',
      quality,
      motion,
      antialias: quality === 'alta',
      maxPixelRatio: quality === 'alta' ? 2 : quality === 'media' ? 1.5 : 1,
      reason: 'WebGL 2 disponible',
    };
  }
  if (capabilities.webgl1) {
    return {
      backend: 'webgl1',
      quality: tierFor(capabilities) === 'alta' ? 'media' : 'baja',
      motion,
      antialias: false,
      maxPixelRatio: 1.25,
      reason: 'WebGL 1: calidad contenida para evitar tirones',
    };
  }
  return {
    backend: 'dom',
    quality: 'baja',
    motion: reduced ? 'reduced' : 'disabled',
    antialias: false,
    maxPixelRatio: 1,
    reason: 'Sin WebGL: se muestra la mesa estática en DOM',
  };
}

/** Sonda segura para entornos sin canvas (SSR, pruebas y CI). */
export function detectRenderCapabilities(
  environment: {
    readonly createContext?: (kind: 'webgl2' | 'webgl') => unknown;
    readonly prefersReducedMotion?: boolean;
    readonly deviceMemoryGB?: number;
    readonly hardwareConcurrency?: number;
    readonly saveData?: boolean;
  } = {},
): RenderCapabilities {
  const hasWebgl2 = environment.createContext?.('webgl2') !== null && environment.createContext?.('webgl2') !== undefined;
  const hasWebgl1 = environment.createContext?.('webgl') !== null && environment.createContext?.('webgl') !== undefined;
  return {
    webgl2: hasWebgl2,
    webgl1: hasWebgl1,
    ...(environment.prefersReducedMotion !== undefined ? { prefersReducedMotion: environment.prefersReducedMotion } : {}),
    ...(environment.deviceMemoryGB !== undefined ? { deviceMemoryGB: environment.deviceMemoryGB } : {}),
    ...(environment.hardwareConcurrency !== undefined ? { hardwareConcurrency: environment.hardwareConcurrency } : {}),
    ...(environment.saveData !== undefined ? { saveData: environment.saveData } : {}),
  };
}
