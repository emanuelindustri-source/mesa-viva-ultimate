import { type BotLevel, chooseBest } from '../../ai/types.js';
import { handValue } from '../common/playing-cards.js';
import { legalBlackjackActions } from './flow.js';
import type { BlackjackAction, BlackjackState } from './types.js';

function hiLoCount(state: BlackjackState): number {
  const visibleDealer = state.dealer.hidden
    ? state.dealer.cards.slice(0, 1)
    : state.dealer.cards;
  const cards = [
    ...visibleDealer,
    ...state.players.flatMap((player) => player.hand?.cards ?? []),
  ];
  let count = 0;
  for (const card of cards) {
    if (card.rank === 'A' || card.rank === '10' || card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') {
      count -= 1;
    } else if (card.rank !== '7' && card.rank !== '8' && card.rank !== '9') {
      count += 1;
    }
  }
  return count;
}

function pick(actions: readonly BlackjackAction[], type: BlackjackAction['type']): BlackjackAction | null {
  return actions.find((action) => action.type === type) ?? null;
}

function upcardValue(state: BlackjackState): number {
  const card = state.dealer.cards[0];
  if (!card) return 10;
  if (card.rank === 'A') return 11;
  if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') return 10;
  return Number(card.rank);
}

function chooseBet(
  state: BlackjackState,
  actions: readonly BlackjackAction[],
  level: BotLevel,
): BlackjackAction {
  const bets = actions.filter(
    (action): action is Extract<BlackjackAction, { type: 'bet' }> => action.type === 'bet',
  );
  const minimum = bets[0];
  if (!minimum) throw new Error('No hay apuestas legales');
  if (level === 'novato') return minimum;
  const count = hiLoCount(state);
  const multiplier = level === 'maestro' ? (count >= 3 ? 5 : count <= -1 ? 1 : 2) : 2;
  const target = Math.min(state.maxBet, state.minBet * multiplier);
  return chooseBest(bets, (bet) => -Math.abs(bet.amount - target));
}

export function chooseBlackjackAction(
  state: BlackjackState,
  playerId: string,
  level: BotLevel,
  legal?: readonly BlackjackAction[],
): BlackjackAction {
  const actions = legal ?? legalBlackjackActions(state, playerId);
  if (actions.length === 0) throw new Error('El Blackjack no tiene acciones legales');
  const nextRound = pick(actions, 'next-round');
  if (nextRound) return nextRound;
  if (state.phase === 'betting') return chooseBet(state, actions, level);

  const me = state.players.find((player) => player.id === playerId);
  const hand = me?.hand;
  const hit = pick(actions, 'hit');
  const stand = pick(actions, 'stand');
  const double = pick(actions, 'double');
  if (!hand || !hit || !stand) throw new Error('No hay una mano jugable');
  const value = handValue(hand.cards);
  const dealer = upcardValue(state);

  if (level === 'novato') {
    return value.total < 17 ? hit : stand;
  }
  if (level === 'competitivo') {
    if (double && value.total === 11 && !value.soft) return double;
    if (value.total >= 17) return stand;
    if (value.total >= 12 && value.total <= 16 && dealer >= 2 && dealer <= 6) return stand;
    return hit;
  }

  const count = hiLoCount(state);
  if (value.soft) {
    if (double && value.total >= 13 && value.total <= 18 && dealer >= 4 && dealer <= 6) {
      return double;
    }
    if (value.total >= 19) return stand;
    if (value.total === 18) return dealer >= 2 && dealer <= 8 ? stand : hit;
    return hit;
  }
  if (double) {
    if (value.total === 11) return double;
    if (value.total === 10 && dealer <= 9) return double;
    if (value.total === 9 && dealer >= 3 && dealer <= 6) return double;
  }
  if (value.total >= 17) return stand;
  if (value.total >= 13 && value.total <= 16) {
    if (dealer >= 2 && dealer <= 6) return stand;
    if (value.total === 16 && dealer >= 10 && count > 0) return stand;
    return hit;
  }
  if (value.total === 12) {
    if (dealer >= 4 && dealer <= 6) return stand;
    if (dealer === 3 && count < 0) return hit;
    return dealer === 2 || dealer === 3 ? hit : stand;
  }
  return hit;
}
