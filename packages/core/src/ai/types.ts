export type BotLevel = 'novato' | 'competitivo' | 'maestro';

export const BOT_LEVELS: readonly BotLevel[] = ['novato', 'competitivo', 'maestro'];

export function chooseBest<T>(
  items: readonly T[],
  score: (item: T) => number,
): T {
  const first = items[0];
  if (first === undefined) throw new Error('No hay acciones para el bot');
  let best: T = first;
  let bestScore = score(first);
  for (const item of items.slice(1)) {
    const value = score(item);
    if (value > bestScore) {
      best = item;
      bestScore = value;
    }
  }
  return best;
}
