/** Generador determinista para partículas y pruebas visuales. */
export interface SeededRandom {
  next(): number;
  range(min: number, max: number): number;
  integer(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
}

export function createSeededRandom(seed: number): SeededRandom {
  let state = Math.trunc(seed) >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min, max) => min + next() * (max - min),
    integer: (min, max) => Math.floor(min + next() * (max - min + 1)),
    pick: <T>(items: readonly T[]): T => {
      if (items.length === 0) throw new Error('No se puede elegir de una lista vacía');
      const item = items[Math.min(items.length - 1, Math.floor(next() * items.length))];
      if (item === undefined) throw new Error('Índice fuera de rango');
      return item;
    },
  };
}
