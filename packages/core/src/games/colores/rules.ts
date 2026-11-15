import { sameAction } from '../../engine/action-key.js';
import { IllegalActionError } from '../../engine/errors.js';
import type { GameResult, PlayerId } from '../../engine/types.js';
import {
  advanceTurn,
  canDraw,
  drawTo,
  handScore,
  isPlayable,
  nextIndex,
  topCard,
} from './helpers.js';
import { nextColorsRound } from './setup.js';
import { COLORS, type ColorsAction, type ColorsCard, type ColorsState } from './types.js';

const SYMBOL_NAMES: Record<string, string> = {
  salta: 'Salta',
  reversa: 'Reversa',
  roba2: 'Roba dos',
  comodin: 'Comodín',
  roba4: 'Comodín roba cuatro',
};

function log(state: ColorsState, message: string): void {
  state.log.push(message);
  if (state.log.length > 60) state.log.splice(0, state.log.length - 60);
}

export function currentColorsPlayer(state: ColorsState): PlayerId | null {
  if (state.phase === 'match-over') return null;
  if (state.phase === 'round-over') return state.players[0]?.id ?? null;
  return state.players[state.turnIndex]?.id ?? null;
}

function playActions(state: ColorsState, hand: readonly ColorsCard[]): ColorsAction[] {
  const actions: ColorsAction[] = [];
  for (const card of hand) {
    if (!isPlayable(state, card, hand)) continue;
    if (card.color === 'negro') {
      for (const color of COLORS) actions.push({ type: 'play', cardId: card.id, color });
    } else {
      actions.push({ type: 'play', cardId: card.id, color: null });
    }
  }
  return actions;
}

export function legalColorsActions(
  state: ColorsState,
  player: PlayerId,
): ColorsAction[] {
  if (state.phase === 'match-over') return [];
  if (state.phase === 'round-over') {
    return player === state.players[0]?.id ? [{ type: 'next-round' }] : [];
  }
  if (player !== currentColorsPlayer(state)) return [];
  const me = state.players.find((candidate) => candidate.id === player);
  if (!me) return [];
  if (state.drawnCardId !== null) {
    const drawn = me.hand.find((card) => card.id === state.drawnCardId);
    const actions = drawn
      ? playActions(state, me.hand).filter(
          (candidate) => candidate.type === 'play' && candidate.cardId === drawn.id,
        )
      : [];
    return [...actions, { type: 'pass' }];
  }
  const actions = playActions(state, me.hand);
  if (actions.length > 0) return actions;
  if (canDraw(state)) return [{ type: 'draw' }];
  return [{ type: 'pass' }];
}

function finishRound(state: ColorsState, winnerIndex: number): ColorsState {
  const winner = state.players[winnerIndex];
  if (!winner) throw new IllegalActionError('Ganador inválido');
  const points = state.players.reduce(
    (total, player, index) => (index === winnerIndex ? total : total + handScore(player.hand)),
    0,
  );
  winner.score += points;
  state.lastRound = { round: state.round, winnerId: winner.id, points };
  log(state, `${winner.name} gana la ronda con ${points} puntos`);
  const max = Math.max(...state.players.map((player) => player.score));
  if (max >= state.targetScore) {
    state.phase = 'match-over';
    state.endReason = 'puntos';
    state.matchWinners = state.players.filter((p) => p.score === max).map((p) => p.id);
    log(state, `Partida ganada por ${state.matchWinners.join(', ')}`);
  } else {
    state.phase = 'round-over';
  }
  return state;
}

export function applyColorsAction(
  state: ColorsState,
  player: PlayerId,
  action: ColorsAction,
): ColorsState {
  if (!legalColorsActions(state, player).some((candidate) => sameAction(candidate, action))) {
    throw new IllegalActionError(`Acción de Colores ilegal para ${player}`);
  }
  if (action.type === 'next-round') {
    return nextColorsRound(structuredClone(state));
  }
  const next = structuredClone(state);
  const meIndex = next.players.findIndex((candidate) => candidate.id === player);
  const me = next.players[meIndex];
  if (!me) throw new IllegalActionError('Jugador desconocido');
  next.turn += 1;

  if (action.type === 'draw') {
    const drawn = drawTo(next, meIndex, 1);
    if (drawn === 0) {
      advanceTurn(next);
      return next;
    }
    const card = me.hand[me.hand.length - 1];
    if (!card) throw new IllegalActionError('No se pudo robar');
    if (isPlayable(next, card, me.hand)) {
      next.drawnCardId = card.id;
      log(next, `${me.name} roba una carta`);
    } else {
      next.drawnCardId = null;
      log(next, `${me.name} roba y pasa`);
      advanceTurn(next);
    }
    return next;
  }

  if (action.type === 'pass') {
    next.drawnCardId = null;
    log(next, `${me.name} pasa`);
    advanceTurn(next);
    return next;
  }

  const handIndex = me.hand.findIndex((card) => card.id === action.cardId);
  const card = me.hand[handIndex];
  if (handIndex < 0 || !card) throw new IllegalActionError('La carta no está en la mano');
  me.hand.splice(handIndex, 1);
  next.discard.push(card);
  next.currentColor =
    card.color === 'negro'
      ? (action.color ?? 'rojo')
      : card.color;
  next.drawnCardId = null;
  const name = SYMBOL_NAMES[String(card.symbol)] ?? String(card.symbol);
  log(next, `${me.name} juega ${name} (${next.currentColor})`);

  if (card.symbol === 'roba2' || card.symbol === 'roba4') {
    const count = card.symbol === 'roba2' ? 2 : 4;
    drawTo(next, nextIndex(next, 1), count);
    advanceTurn(next, 2);
  } else if (card.symbol === 'salta') {
    advanceTurn(next, 2);
  } else if (card.symbol === 'reversa') {
    if (next.players.length === 2) {
      next.direction = next.direction === 1 ? -1 : 1;
    } else {
      next.direction = next.direction === 1 ? -1 : 1;
      advanceTurn(next);
    }
  } else {
    advanceTurn(next);
  }

  if (me.hand.length === 0) return finishRound(next, meIndex);
  return next;
}

export function colorsResult(state: ColorsState): GameResult | null {
  if (state.phase !== 'match-over') return null;
  const scores: Record<PlayerId, number> = {};
  for (const player of state.players) scores[player.id] = player.score;
  return { winners: state.matchWinners, scores, reason: state.endReason ?? 'puntos' };
}

export function colorsTop(state: ColorsState): ColorsCard {
  return topCard(state);
}
