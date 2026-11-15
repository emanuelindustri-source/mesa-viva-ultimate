import { sameAction } from '../../engine/action-key.js';
import { IllegalActionError } from '../../engine/errors.js';
import type { GameResult, PlayerId } from '../../engine/types.js';
import { nextDominoRound, scoreDominoRound } from './setup.js';
import { canPlayOn, exposedEnd } from './tiles.js';
import type { DominoAction, DominoState } from './types.js';

function log(state: DominoState, message: string): void {
  state.log.push(message);
  if (state.log.length > 60) state.log.splice(0, state.log.length - 60);
}

export function currentDominoPlayer(state: DominoState): PlayerId | null {
  if (state.phase === 'match-over') return null;
  if (state.phase === 'round-over') return state.players[0]?.id ?? null;
  return state.players[state.turnIndex]?.id ?? null;
}

function playableActions(state: DominoState, hand: DominoState['players'][number]['hand']): DominoAction[] {
  const actions: DominoAction[] = [];
  for (const tile of hand) {
    if (!state.started) {
      actions.push({ type: 'play', tileId: tile.id, side: null });
      continue;
    }
    if (tile.a === state.leftEnd || tile.b === state.leftEnd) {
      actions.push({ type: 'play', tileId: tile.id, side: 'left' });
    }
    if (tile.a === state.rightEnd || tile.b === state.rightEnd) {
      actions.push({ type: 'play', tileId: tile.id, side: 'right' });
    }
  }
  return actions;
}

export function legalDominoActions(
  state: DominoState,
  player: PlayerId,
): DominoAction[] {
  if (state.phase === 'match-over') return [];
  if (state.phase === 'round-over') {
    return player === state.players[0]?.id ? [{ type: 'next-round' }] : [];
  }
  if (player !== currentDominoPlayer(state)) return [];
  const me = state.players.find((candidate) => candidate.id === player);
  if (!me) return [];
  const plays = playableActions(state, me.hand);
  if (plays.length > 0) return plays;
  return state.boneyard.length > 0 ? [{ type: 'draw' }] : [{ type: 'pass' }];
}

function advance(state: DominoState): void {
  state.turnIndex = (state.turnIndex + 1) % state.players.length;
}

function afterPass(state: DominoState): DominoState {
  state.passesInRow += 1;
  if (state.passesInRow >= state.players.length) {
    return scoreDominoRound(state, null, true);
  }
  advance(state);
  return state;
}

export function applyDominoAction(
  state: DominoState,
  player: PlayerId,
  action: DominoAction,
): DominoState {
  if (!legalDominoActions(state, player).some((candidate) => sameAction(candidate, action))) {
    throw new IllegalActionError(`Acción de dominó ilegal para ${player}`);
  }
  if (action.type === 'next-round') {
    return nextDominoRound(structuredClone(state));
  }
  const next = structuredClone(state);
  if (action.type === 'pass') {
    return afterPass(next);
  }
  if (action.type === 'draw') {
    const tile = next.boneyard.shift();
    if (!tile) throw new IllegalActionError('No quedan fichas para robar');
    const me = next.players[next.turnIndex];
    if (!me) throw new IllegalActionError('Turno inválido');
    me.hand.push(tile);
    log(next, `${me.name} roba una ficha`);
    if (canPlayOn(tile, next.started ? next.leftEnd : null) ||
        canPlayOn(tile, next.started ? next.rightEnd : null)) {
      return next;
    }
    return afterPass(next);
  }

  const meIndex = next.players.findIndex((candidate) => candidate.id === player);
  const me = next.players[meIndex];
  if (!me) throw new IllegalActionError('Jugador desconocido');
  const handIndex = me.hand.findIndex((tile) => tile.id === action.tileId);
  const tile = me.hand[handIndex];
  if (handIndex < 0 || !tile) throw new IllegalActionError('La ficha no está en la mano');
  me.hand.splice(handIndex, 1);

  if (!next.started) {
    next.board.push({ tile, side: 'left', flipped: false });
    next.leftEnd = tile.a;
    next.rightEnd = tile.b;
    next.started = true;
    log(next, `${me.name} abre con la ficha ${tile.a}-${tile.b}`);
  } else {
    const side = action.side ?? 'left';
    const end = side === 'left' ? next.leftEnd : next.rightEnd;
    if (end === null) throw new IllegalActionError('La mesa no está iniciada');
    const newEnd = exposedEnd(tile, end);
    next.board.push({ tile, side, flipped: tile.a !== end });
    if (side === 'left') next.leftEnd = newEnd;
    else next.rightEnd = newEnd;
    log(next, `${me.name} coloca ${tile.a}-${tile.b} a la ${side === 'left' ? 'izquierda' : 'derecha'}`);
  }

  next.passesInRow = 0;
  if (me.hand.length === 0) {
    return scoreDominoRound(next, meIndex, false);
  }
  advance(next);
  return next;
}

export function dominoResult(state: DominoState): GameResult | null {
  if (state.phase !== 'match-over') return null;
  const scores: Record<PlayerId, number> = {};
  state.players.forEach((player, index) => {
    scores[player.id] = state.mode === '2v2' ? (state.teamScores[index % 2] ?? 0) : player.score;
  });
  return {
    winners: state.matchWinners,
    scores,
    reason: state.endReason ?? 'puntos',
  };
}
