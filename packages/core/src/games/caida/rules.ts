import { sameAction } from '../../engine/action-key.js';
import { IllegalActionError } from '../../engine/errors.js';
import type { GameResult, PlayerId } from '../../engine/types.js';
import { caidaPoints } from '../common/spanish-deck.js';
import { endCaidaRound, nextCaidaRound } from './setup.js';
import type { CaidaAction, CaidaState } from './types.js';

function pushLog(state: CaidaState, message: string): void {
  state.log.push(message);
  if (state.log.length > 60) state.log.splice(0, state.log.length - 60);
}

export function currentCaidaPlayer(state: CaidaState): PlayerId | null {
  if (state.phase === 'match-over') return null;
  if (state.phase === 'round-over') return state.players[0]?.id ?? null;
  return state.players[state.turnIndex]?.id ?? null;
}

export function legalCaidaActions(
  state: CaidaState,
  player: PlayerId,
): CaidaAction[] {
  if (state.phase === 'match-over') return [];
  if (state.phase === 'round-over') {
    return player === state.players[0]?.id ? [{ type: 'next-round' }] : [];
  }
  if (player !== currentCaidaPlayer(state)) return [];
  const me = state.players.find((candidate) => candidate.id === player);
  if (!me) return [];
  const actions: CaidaAction[] = [];
  for (const card of me.hand) {
    actions.push({ type: 'play', cardId: card.id, captureIndex: null });
    for (let index = 0; index < state.table.length; index += 1) {
      if (state.table[index]?.rank === card.rank) {
        actions.push({ type: 'play', cardId: card.id, captureIndex: index });
      }
    }
  }
  return actions;
}

function advanceTurn(state: CaidaState): CaidaState {
  if (state.players.every((player) => player.hand.length === 0)) {
    return endCaidaRound(state);
  }
  const total = state.players.length;
  let index = state.turnIndex;
  for (let step = 0; step < total; step += 1) {
    index = (index + 1) % total;
    if ((state.players[index]?.hand.length ?? 0) > 0) break;
  }
  state.turnIndex = index;
  return state;
}

export function applyCaidaAction(
  state: CaidaState,
  player: PlayerId,
  action: CaidaAction,
): CaidaState {
  if (!legalCaidaActions(state, player).some((candidate) => sameAction(candidate, action))) {
    throw new IllegalActionError(`Acción de Caída ilegal para ${player}`);
  }
  if (action.type === 'next-round') {
    return nextCaidaRound(structuredClone(state));
  }
  const next = structuredClone(state);
  const me = next.players.find((candidate) => candidate.id === player);
  if (!me) throw new IllegalActionError(`Jugador desconocido: ${player}`);
  const handIndex = me.hand.findIndex((card) => card.id === action.cardId);
  const card = me.hand[handIndex];
  if (handIndex < 0 || !card) throw new IllegalActionError('La carta no está en la mano');
  me.hand.splice(handIndex, 1);

  if (action.captureIndex !== null) {
    const index = action.captureIndex;
    const target = next.table[index];
    if (!target || target.rank !== card.rank) {
      throw new IllegalActionError('La captura no coincide con la mesa');
    }
    const wasLast = index === next.table.length - 1;
    const removed = next.table.slice(index);
    next.table = next.table.slice(0, index);
    me.captured.push(card, ...removed);
    let points = 0;
    if (next.table.length === 0) {
      points = wasLast ? 5 : 4;
      pushLog(
        next,
        `${me.name} ${wasLast ? 'hace caída con mesa' : 'deja la mesa limpia'} (+${points})`,
      );
    } else if (wasLast) {
      points = caidaPoints(card.rank);
      pushLog(next, `${me.name} hace caída (+${points})`);
    } else {
      pushLog(next, `${me.name} recoge ${removed.length} cartas de la mesa`);
    }
    me.score += points;
    me.roundPoints += points;
  } else {
    next.table.push(card);
    pushLog(next, `${me.name} juega una carta a la mesa`);
  }

  if (next.deck.length > 0 && me.hand.length < 3) {
    const recharge = next.deck.shift();
    if (recharge) me.hand.push(recharge);
  }
  next.turn += 1;
  return advanceTurn(next);
}

export function caidaResult(state: CaidaState): GameResult | null {
  if (state.phase !== 'match-over') return null;
  const scores: Record<PlayerId, number> = {};
  for (const player of state.players) scores[player.id] = player.score;
  return {
    winners: state.matchWinners,
    scores,
    reason: state.endReason ?? 'puntos',
  };
}
