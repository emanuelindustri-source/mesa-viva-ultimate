import type { GameConfig } from '../src/engine/types.js';

export function makeConfig(
  count: number,
  seed = 20261114,
  options?: Record<string, unknown>,
): GameConfig {
  return {
    players: Array.from({ length: count }, (_, index) => ({
      id: `p${index}`,
      name: `Jugador ${index + 1}`,
      kind: 'bot' as const,
    })),
    seed,
    ...(options ? { options } : {}),
  };
}

export function card(rank: number, suit: 'oro' | 'copa' | 'espada' | 'basto' = 'oro') {
  return { id: `${rank}-${suit}`, rank, suit } as const;
}
