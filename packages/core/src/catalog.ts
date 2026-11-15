import type { GameMeta } from './engine/types.js';
import { BLACKJACK_META } from './games/blackjack/module.js';
import { CAIDA_META } from './games/caida/module.js';
import { CHESS_META } from './games/chess/module.js';
import { COLORS_META } from './games/colores/module.js';
import { DOMINO_META } from './games/domino/module.js';

/** Catálogo de juegos disponibles en el cliente. */
export const GAME_CATALOG: readonly GameMeta[] = [
  CAIDA_META,
  DOMINO_META,
  BLACKJACK_META,
  COLORS_META,
  CHESS_META,
];

export function findGameMeta(id: string): GameMeta | null {
  return GAME_CATALOG.find((game) => game.id === id) ?? null;
}

export function gamesByFamily(family: GameMeta['family']): GameMeta[] {
  return GAME_CATALOG.filter((game) => game.family === family);
}
