/**
 * Generador pseudoaleatorio determinista (Mulberry32).
 * Misma semilla => misma secuencia. Base de las partidas reproducibles
 * y de los tests "golden replay" del motor universal.
 */
export interface Rng {
  /** Número decimal en el rango [0, 1). */
  next(): number;
  /** Entero en el rango [0, maxExclusive). */
  int(maxExclusive: number): number;
  /** Elemento aleatorio de una lista no vacía. */
  pick<T>(items: readonly T[]): T;
}

const UINT32_RANGE = 0x100000000;

export function createRng(seed: number): Rng {
  if (!Number.isFinite(seed)) {
    throw new Error('La semilla debe ser un número finito');
  }

  let state = Math.trunc(seed) >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE;
  };

  const int = (maxExclusive: number): number => {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new Error('maxExclusive debe ser un entero mayor que cero');
    }
    return Math.floor(next() * maxExclusive);
  };

  const pick = <T>(items: readonly T[]): T => {
    if (items.length === 0) {
      throw new Error('No se puede elegir un elemento de una lista vacía');
    }
    const item = items[int(items.length)];
    if (item === undefined) {
      throw new Error('Índice fuera de rango');
    }
    return item;
  };

  return { next, int, pick };
}
