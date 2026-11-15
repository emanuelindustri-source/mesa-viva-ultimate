import type { PoolQuality } from '../pool/budgets.js';

export type QualityTier = PoolQuality;

export interface QualitySettings {
  readonly tier: QualityTier;
  readonly maxPixelRatio: number;
  readonly particles: number;
  readonly shadows: boolean;
  readonly antialias: boolean;
}

const QUALITY_SETTINGS: Readonly<Record<QualityTier, QualitySettings>> = {
  alta: { tier: 'alta', maxPixelRatio: 2, particles: 1, shadows: true, antialias: true },
  media: { tier: 'media', maxPixelRatio: 1.5, particles: 0.6, shadows: true, antialias: false },
  baja: { tier: 'baja', maxPixelRatio: 1, particles: 0.3, shadows: false, antialias: false },
};

export function qualitySettings(tier: QualityTier): QualitySettings {
  return QUALITY_SETTINGS[tier];
}

/**
 * Ajuste con histéresis: evita que la calidad parpadee cuando los FPS rondan
 * el umbral. La decisión se toma como máximo una vez por segundo.
 */
export function chooseQuality(fps: number, current: QualityTier = 'alta'): QualityTier {
  if (!Number.isFinite(fps) || fps <= 0) return current;
  if (current === 'alta') {
    if (fps < 42) return 'baja';
    if (fps < 54) return 'media';
    return 'alta';
  }
  if (current === 'media') {
    if (fps < 38) return 'baja';
    if (fps > 72) return 'alta';
    return 'media';
  }
  if (fps > 78) return 'alta';
  if (fps > 52) return 'media';
  return 'baja';
}
