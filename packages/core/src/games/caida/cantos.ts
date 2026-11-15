import {
  caidaPoints,
  rankOrder,
  type SpanishCard,
  type SpanishRank,
  sortCards,
} from '../common/spanish-deck.js';
import type { CaidaCanto } from './types.js';

function canto(kind: CaidaCanto['kind'], label: string, value: number): CaidaCanto {
  return { kind, label, value, instantWin: false };
}

function findPair(ranks: readonly SpanishRank[]): SpanishRank | null {
  for (let i = 0; i < ranks.length - 1; i += 1) {
    if (ranks[i] === ranks[i + 1]) return ranks[i] ?? null;
  }
  return null;
}

/**
 * Detecta el mejor canto de una mano de 3 cartas.
 * Incluye las seis familias solicitadas: caída (en mesa), ronda, patrulla,
 * vigía, registro y casilla, más trivilín y registrico como variantes.
 */
export function detectHandCanto(cards: readonly SpanishCard[]): CaidaCanto | null {
  if (cards.length !== 3) return null;
  const sorted = sortCards(cards);
  const ranks = sorted.map((card) => card.rank);
  const [first, second, third] = ranks;
  if (first === undefined || second === undefined || third === undefined) return null;

  if (first === second && second === third) {
    return {
      kind: 'trivilin',
      label: first === 12 ? 'Trivilín de reyes' : 'Trivilín',
      value: 5,
      instantWin: first === 12,
    };
  }

  if (first === 1 && second === 12 && third === 12) {
    return canto('casilla', 'Casilla grande', 12);
  }
  if (first === 1 && second === 11 && third === 11) {
    return canto('casilla', 'Casilla chica', 11);
  }
  if (first === 1 && second === 11 && third === 12) {
    return canto('registro', 'Registro', 8);
  }
  if (first === 1 && second === 10 && third === 11) {
    return canto('registrico', 'Registrico', 10);
  }

  const positions = ranks.map(rankOrder);
  const consecutive =
    positions[1] === (positions[0] ?? -1) + 1 &&
    positions[2] === (positions[1] ?? -1) + 1;
  if (consecutive) {
    return canto('patrulla', 'Patrulla', 6);
  }

  const pair = findPair(ranks);
  if (pair !== null) {
    const thirdRank = ranks.find((rank) => rank !== pair);
    if (thirdRank !== undefined) {
      const distance = Math.abs(rankOrder(thirdRank) - rankOrder(pair));
      if (distance === 1) {
        return canto('vigia', 'Vigía', 7);
      }
      return canto('ronda', 'Ronda', caidaPoints(pair));
    }
  }

  return null;
}

/** Puntos de una caída al capturar la última carta jugada en la mesa. */
export function caidaCapturePoints(rank: SpanishRank): number {
  return caidaPoints(rank);
}
