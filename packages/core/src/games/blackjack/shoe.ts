import type { PlayingCard } from '../common/playing-cards.js';
import { nextRoundShoe } from './setup.js';
import type { BlackjackState } from './types.js';

export function drawBlackjackCard(state: BlackjackState): PlayingCard {
  if (state.shoe.length === 0) nextRoundShoe(state);
  const card = state.shoe.shift();
  if (!card) throw new Error('No quedan cartas en el zapato de Blackjack');
  return card;
}

export function canBet(state: BlackjackState, bankroll: number): number[] {
  const max = Math.min(state.maxBet, bankroll);
  if (max < state.minBet) return [];
  const amounts = new Set<number>([max]);
  for (let multiple = 1; multiple <= 10; multiple += 1) {
    const amount = state.minBet * multiple;
    if (amount <= max) amounts.add(amount);
  }
  return [...amounts].sort((a, b) => a - b);
}
