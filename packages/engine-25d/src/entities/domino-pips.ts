export interface DominoPip {
  readonly x: number;
  readonly y: number;
}

/**
 * Distribución de pips 0–12 en media ficha. Determinista y simétrica para que
 * Dominó y Mahjong compartan la misma entidad de ficha.
 */
export function dominoPips(value: number): readonly DominoPip[] {
  const count = Math.max(0, Math.min(12, Math.round(Number.isFinite(value) ? value : 0)));
  if (count === 0) return [];
  if (count === 1) return [{ x: 0.5, y: 0.5 }];
  const rows = Math.ceil(count / 2);
  const pips: DominoPip[] = [];
  for (let index = 0; index < count; index += 1) {
    const pair = index % 2;
    const row = Math.floor(index / 2);
    const centered = count % 2 === 1 && index === count - 1;
    pips.push({
      x: centered ? 0.5 : pair === 0 ? 0.3 : 0.7,
      y: (row + 0.5) / rows,
    });
  }
  return pips;
}
