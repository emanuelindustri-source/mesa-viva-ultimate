import type { PlayerId } from '../../engine/types.js';
import { handValue } from '../common/playing-cards.js';
import { settleBlackjackRound } from './settle.js';
import { nextRoundShoe } from './setup.js';
import { canBet, drawBlackjackCard } from './shoe.js';
import type { BlackjackAction, BlackjackState } from './types.js';

function log(state: BlackjackState, message: string): void {
  state.log.push(message);
  if (state.log.length > 60) state.log.splice(0, state.log.length - 60);
}

export function currentBlackjackPlayer(state: BlackjackState): PlayerId | null {
  if (state.phase === 'session-over') return null;
  if (state.phase === 'settled') return state.players[0]?.id ?? null;
  if (state.phase === 'betting') return state.players[state.betIndex]?.id ?? null;
  return state.players[state.turnIndex]?.id ?? null;
}

export function nextBetIndex(state: BlackjackState): number {
  return state.players.findIndex(
    (player) => player.hand === null && player.bankroll >= state.minBet,
  );
}

function allBetsPlaced(state: BlackjackState): boolean {
  return state.players.every(
    (player) => player.hand !== null || player.bankroll < state.minBet,
  );
}

export function legalBlackjackActions(
  state: BlackjackState,
  player: PlayerId,
): BlackjackAction[] {
  if (state.phase === 'session-over') return [];
  const me = state.players.find((candidate) => candidate.id === player);
  if (!me) return [];
  if (state.phase === 'betting') {
    if (player !== currentBlackjackPlayer(state)) return [];
    return canBet(state, me.bankroll).map((amount) => ({ type: 'bet', amount }));
  }
  if (state.phase === 'settled') {
    const canContinue =
      (state.maxRounds === 0 || state.roundsPlayed < state.maxRounds) &&
      state.players.some((candidate) => candidate.bankroll >= state.minBet);
    return player === state.players[0]?.id && canContinue ? [{ type: 'next-round' }] : [];
  }
  if (player !== currentBlackjackPlayer(state) || !me.hand) return [];
  if (me.hand.status !== 'active') return [];
  const actions: BlackjackAction[] = [{ type: 'hit' }, { type: 'stand' }];
  if (me.hand.cards.length === 2 && me.bankroll >= me.hand.bet) {
    actions.push({ type: 'double' });
  }
  return actions;
}

function dealRound(state: BlackjackState): BlackjackState {
  if (state.shoe.length < 15) {
    nextRoundShoe(state);
    log(state, 'Se baraja un zapato nuevo');
  }
  for (const player of state.players) {
    if (!player.hand) continue;
    player.hand.cards.push(drawBlackjackCard(state), drawBlackjackCard(state));
  }
  state.dealer.cards = [drawBlackjackCard(state), drawBlackjackCard(state)];
  state.dealer.hidden = true;
  state.phase = 'playing';

  if (handValue(state.dealer.cards).total === 21) {
    log(state, 'El crupier tiene Blackjack natural');
    return settleBlackjackRound(state);
  }
  for (const player of state.players) {
    if (player.hand && handValue(player.hand.cards).total === 21) {
      player.hand.status = 'blackjack';
      log(state, `${player.name} tiene Blackjack natural`);
    }
  }
  const active = state.players.findIndex((player) => player.hand?.status === 'active');
  if (active < 0) return settleBlackjackRound(state);
  state.turnIndex = active;
  return state;
}

export function advanceBlackjackTurn(state: BlackjackState): BlackjackState {
  const total = state.players.length;
  for (let step = 1; step <= total; step += 1) {
    const index = (state.turnIndex + step) % total;
    if (state.players[index]?.hand?.status === 'active') {
      state.turnIndex = index;
      return state;
    }
  }
  return settleBlackjackRound(state);
}

export function triggerDeal(state: BlackjackState): BlackjackState {
  return allBetsPlaced(state) ? dealRound(state) : state;
}

export function prepareNextRound(state: BlackjackState): BlackjackState {
  state.round += 1;
  state.dealer = { cards: [], hidden: true };
  for (const player of state.players) player.hand = null;
  state.phase = 'betting';
  const index = nextBetIndex(state);
  if (index < 0) {
    state.phase = 'session-over';
    log(state, 'Nadie puede apostar: sesión terminada');
    return state;
  }
  state.betIndex = index;
  log(state, `Comienza la ronda ${state.round}`);
  return state;
}
