export const SPANISH_SUITS = ['oro', 'copa', 'espada', 'basto'] as const;
export type SpanishSuit = (typeof SPANISH_SUITS)[number];

export const SPANISH_RANKS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12] as const;
export type SpanishRank = (typeof SPANISH_RANKS)[number];

export interface SpanishCard {
  readonly id: string;
  readonly rank: SpanishRank;
  readonly suit: SpanishSuit;
}

export function createSpanishDeck(): SpanishCard[] {
  const deck: SpanishCard[] = [];
  for (const suit of SPANISH_SUITS) {
    for (const rank of SPANISH_RANKS) {
      deck.push({ id: `${rank}-${suit}`, rank, suit });
    }
  }
  return deck;
}

/** Valor de una caída según la fuente de reglas venezolana. */
export function caidaPoints(rank: SpanishRank): number {
  if (rank <= 7) return 1;
  return rank - 8;
}

/** Orden real de la baraja española, sin ochos ni nueves. */
export function rankOrder(rank: SpanishRank): number {
  return SPANISH_RANKS.indexOf(rank);
}

export function compareCards(a: SpanishCard, b: SpanishCard): number {
  const byRank = rankOrder(a.rank) - rankOrder(b.rank);
  return byRank !== 0 ? byRank : a.suit.localeCompare(b.suit);
}

export function sortCards(cards: readonly SpanishCard[]): SpanishCard[] {
  return [...cards].sort(compareCards);
}
