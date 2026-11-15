import type { Rng } from '../../engine/rng.js';

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = rng.int(i + 1);
    const current = copy[i];
    const other = copy[j];
    if (current === undefined || other === undefined) {
      throw new Error('Índice de mezcla fuera de rango');
    }
    copy[i] = other;
    copy[j] = current;
  }
  return copy;
}

export interface DrawResult<T> {
  readonly drawn: readonly T[];
  readonly rest: readonly T[];
}

/** Extrae hasta `count` cartas del inicio del mazo, sin mutar la entrada. */
export function takeCards<T>(pile: readonly T[], count: number): DrawResult<T> {
  const size = Math.max(0, Math.min(count, pile.length));
  return { drawn: pile.slice(0, size), rest: pile.slice(size) };
}
