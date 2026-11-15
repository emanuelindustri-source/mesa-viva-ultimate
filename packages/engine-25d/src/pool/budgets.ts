export type PoolKind = 'carta' | 'ficha' | 'particula' | 'peon' | 'sombra';

export type PoolQuality = 'alta' | 'media' | 'baja';

export interface PoolBudget {
  readonly initial: number;
  readonly max: number;
}

/**
 * Presupuestos conservadores para un Android de gama media. La calidad baja
 * reduce partículas y sombras sin tocar las cartas de la partida.
 */
export const POOL_BUDGETS: Readonly<Record<PoolQuality, Readonly<Record<PoolKind, PoolBudget>>>> = {
  alta: {
    carta: { initial: 64, max: 160 },
    ficha: { initial: 32, max: 96 },
    particula: { initial: 96, max: 256 },
    peon: { initial: 16, max: 48 },
    sombra: { initial: 24, max: 96 },
  },
  media: {
    carta: { initial: 48, max: 128 },
    ficha: { initial: 24, max: 72 },
    particula: { initial: 48, max: 128 },
    peon: { initial: 12, max: 32 },
    sombra: { initial: 16, max: 64 },
  },
  baja: {
    carta: { initial: 32, max: 80 },
    ficha: { initial: 16, max: 48 },
    particula: { initial: 16, max: 48 },
    peon: { initial: 8, max: 24 },
    sombra: { initial: 8, max: 32 },
  },
};

export function poolBudget(kind: PoolKind, quality: PoolQuality): PoolBudget {
  return POOL_BUDGETS[quality][kind];
}
