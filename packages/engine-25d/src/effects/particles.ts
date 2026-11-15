import type { ParticleKind, Theme } from '@mesa-viva/design-system';
import type { QualityTier } from '../perf/quality.js';

export type ParticleBehavior = 'caer' | 'subir' | 'estallar' | 'flotar';

export interface ParticleProfile {
  readonly kind: ParticleKind;
  readonly colors: readonly string[];
  readonly behavior: ParticleBehavior;
  readonly gravity: number;
  readonly drag: number;
  readonly spin: number;
  readonly lifetimeMs: number;
  readonly size: number;
  readonly glow: boolean;
}

const PROFILES: Readonly<Record<Exclude<ParticleKind, 'none'>, Omit<ParticleProfile, 'kind' | 'colors'>>> = {
  snow: { behavior: 'caer', gravity: 28, drag: 0.2, spin: 40, lifetimeMs: 6200, size: 7, glow: false },
  confetti: { behavior: 'caer', gravity: 240, drag: 1.4, spin: 520, lifetimeMs: 3200, size: 8, glow: false },
  hearts: { behavior: 'subir', gravity: -30, drag: 0.6, spin: 18, lifetimeMs: 4200, size: 10, glow: true },
  leaves: { behavior: 'caer', gravity: 55, drag: 1.1, spin: 120, lifetimeMs: 5200, size: 9, glow: false },
  fireworks: { behavior: 'estallar', gravity: 180, drag: 2.2, spin: 90, lifetimeMs: 1800, size: 5, glow: true },
  petals: { behavior: 'caer', gravity: 32, drag: 0.7, spin: 70, lifetimeMs: 6000, size: 8, glow: false },
  stars: { behavior: 'flotar', gravity: -8, drag: 0.4, spin: 60, lifetimeMs: 3800, size: 7, glow: true },
  bubbles: { behavior: 'subir', gravity: -18, drag: 0.3, spin: 24, lifetimeMs: 4600, size: 9, glow: true },
  bats: { behavior: 'flotar', gravity: -4, drag: 0.5, spin: 30, lifetimeMs: 4400, size: 10, glow: false },
  clovers: { behavior: 'caer', gravity: 40, drag: 0.8, spin: 80, lifetimeMs: 4800, size: 7, glow: false },
  sun: { behavior: 'flotar', gravity: -6, drag: 0.4, spin: 20, lifetimeMs: 5000, size: 11, glow: true },
};

const FALLBACK: Omit<ParticleProfile, 'kind' | 'colors'> = {
  behavior: 'caer',
  gravity: 60,
  drag: 0.8,
  spin: 60,
  lifetimeMs: 4000,
  size: 7,
  glow: false,
};

export function particleProfile(kind: ParticleKind, theme: Theme): ParticleProfile {
  if (kind === 'none') {
    return { kind, colors: [theme.scheme.primary], behavior: 'caer', gravity: 0, drag: 0, spin: 0, lifetimeMs: 1, size: 1, glow: false };
  }
  const profile = PROFILES[kind] ?? FALLBACK;
  const festive = theme.festive;
  return {
    kind,
    ...profile,
    colors: [
      festive?.accent ?? theme.scheme.tertiary,
      theme.scheme.primary,
      theme.scheme.secondary,
      theme.scheme['tertiary-container'],
    ],
  };
}

/** Presupuesto de partículas por calidad, acotado para móviles de gama media. */
export function particleBudget(kind: ParticleKind, quality: QualityTier, base = 36): number {
  if (kind === 'none') return 0;
  const factor = quality === 'alta' ? 1 : quality === 'media' ? 0.6 : 0.28;
  return Math.max(0, Math.round(base * factor));
}
