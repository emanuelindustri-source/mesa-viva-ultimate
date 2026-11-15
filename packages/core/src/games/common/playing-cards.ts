import type { Rng } from '../../engine/rng.js';
import { shuffle } from './shuffle.js';

export const PLAYING_SUITS = ['corazones', 'diamantes', 'treboles', 'picas'] as const;
export type PlayingSuit = (typeof PLAYING_SUITS)[number];

export const PLAYING_RANKS = [
  'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K',
] as const;
export type PlayingRank = (typeof PLAYING_RANKS)[number];

export interface PlayingCard {
  readonly id: string;
  readonly rank: PlayingRank;
  readonly suit: PlayingSuit;
}

export function createStandardShoe(decks: number, rng: Rng): PlayingCard[] {
  if (!Number.isInteger(decks) || decks < 1) {
    throw new Error('El número de barajas debe ser un entero positivo');
  }
  const cards: PlayingCard[] = [];
  for (let deck = 1; deck <= decks; deck += 1) {
    for (const suit of PLAYING_SUITS) {
      for (const rank of PLAYING_RANKS) {
        cards.push({ id: `${deck}-${rank}-${suit}`, rank, suit });
      }
    }
  }
  return shuffle(cards, rng);
}

export interface HandValue {
  readonly total: number;
  readonly soft: boolean;
}

export function handValue(cards: readonly PlayingCard[]): HandValue {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    if (card.rank === 'A') {
      aces += 1;
      total += 11;
    } else if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }
  let reduced = aces;
  while (total > 21 && reduced > 0) {
    total -= 10;
    reduced -= 1;
  }
  return { total, soft: reduced > 0 };
}
