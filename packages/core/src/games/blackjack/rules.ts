import { sameAction } from '../../engine/action-key.js';
import { IllegalActionError } from '../../engine/errors.js';
import type { GameResult, PlayerId } from '../../engine/types.js';
import { handValue } from '../common/playing-cards.js';
import {
  advanceBlackjackTurn,
  legalBlackjackActions,
  prepareNextRound,
  triggerDeal,
} from './flow.js';
import { drawBlackjackCard } from './shoe.js';
import type { BlackjackAction, BlackjackState } from './types.js';

function log(state: BlackjackState, message: string): void {
  state.log.push(message);
  if (state.log.length > 60) state.log.splice(0, state.log.length - 60);
}

export function applyBlackjackAction(
  state: BlackjackState,
  player: PlayerId,
  action: BlackjackAction,
): BlackjackState {
  if (
    !legalBlackjackActions(state, player).some((candidate) =>
      sameAction(candidate, action),
    )
  ) {
    throw new IllegalActionError(`Acción de Blackjack ilegal para ${player}`);
  }
  const next = structuredClone(state);
  const me = next.players.find((candidate) => candidate.id === player);
  if (!me) throw new IllegalActionError('Jugador desconocido');

  if (action.type === 'next-round') {
    return prepareNextRound(next);
  }

  if (action.type === 'bet') {
    if (me.hand) throw new IllegalActionError('Ya apostaste en esta ronda');
    me.bankroll -= action.amount;
    me.hand = {
      cards: [],
      bet: action.amount,
      doubled: false,
      status: 'active',
      outcome: 'pending',
      payout: 0,
    };
    log(next, `${me.name} apuesta ${action.amount}`);
    const index = next.players.findIndex(
      (candidate) => candidate.hand === null && candidate.bankroll >= next.minBet,
    );
    if (index >= 0) {
      next.betIndex = index;
      return next;
    }
    return triggerDeal(next);
  }

  const hand = me.hand;
  if (hand === null) throw new IllegalActionError('No hay una mano activa');
  if (hand.status !== 'active') {
    throw new IllegalActionError('No hay una mano activa');
  }
  if (action.type === 'hit') {
    hand.cards.push(drawBlackjackCard(next));
    const value = handValue(hand.cards).total;
    if (value > 21) {
      hand.status = 'bust';
      log(next, `${me.name} se pasa con ${value}`);
    } else {
      log(next, `${me.name} pide carta (${value})`);
    }
    return advanceBlackjackTurn(next);
  }
  if (action.type === 'stand') {
    hand.status = 'stood';
    log(next, `${me.name} se planta con ${handValue(hand.cards).total}`);
    return advanceBlackjackTurn(next);
  }

  me.bankroll -= hand.bet;
  hand.bet *= 2;
  hand.doubled = true;
  hand.cards.push(drawBlackjackCard(next));
  const total = handValue(hand.cards).total;
  hand.status = total > 21 ? 'bust' : 'stood';
  log(next, `${me.name} dobla a ${hand.bet} y termina con ${total}`);
  return advanceBlackjackTurn(next);
}

export function blackjackResult(state: BlackjackState): GameResult | null {
  if (state.phase !== 'session-over') return null;
  const scores: Record<PlayerId, number> = {};
  for (const player of state.players) scores[player.id] = player.bankroll;
  const max = Math.max(...state.players.map((player) => player.bankroll));
  const winners = max > 0 ? state.players.filter((p) => p.bankroll === max).map((p) => p.id) : [];
  return { winners, scores, reason: 'sesion' };
}
