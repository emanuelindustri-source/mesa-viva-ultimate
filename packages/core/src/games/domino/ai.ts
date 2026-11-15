import { type BotLevel, chooseBest } from '../../ai/types.js';
import { legalDominoActions } from './rules.js';
import { canPlayOn, createDominoSet, exposedEnd, tilePips } from './tiles.js';
import type { DominoAction, DominoState, DominoTile } from './types.js';

function unseenTiles(state: DominoState, playerId: string): DominoTile[] {
  const me = state.players.find((player) => player.id === playerId);
  const visible = new Set<string>([
    ...(me?.hand.map((tile) => tile.id) ?? []),
    ...state.board.map((placement) => placement.tile.id),
  ]);
  return createDominoSet().filter((tile) => !visible.has(tile.id));
}

function endRisk(state: DominoState, playerId: string, ends: readonly number[]): number {
  const unseen = unseenTiles(state, playerId);
  return ends.reduce(
    (total, end) => total + unseen.filter((tile) => canPlayOn(tile, end)).length,
    0,
  );
}

function resultingEnds(
  state: DominoState,
  tile: DominoTile,
  side: 'left' | 'right' | null,
): { left: number; right: number } {
  if (!state.started || side === null) return { left: tile.a, right: tile.b };
  if (side === 'left') {
    return {
      left: exposedEnd(tile, state.leftEnd ?? 0),
      right: state.rightEnd ?? 0,
    };
  }
  return {
    left: state.leftEnd ?? 0,
    right: exposedEnd(tile, state.rightEnd ?? 0),
  };
}

export function chooseDominoAction(
  state: DominoState,
  playerId: string,
  level: BotLevel,
  legal?: readonly DominoAction[],
): DominoAction {
  const actions = legal ?? legalDominoActions(state, playerId);
  if (actions.length === 0) throw new Error('El dominó no tiene acciones legales');
  const playActions = actions.filter(
    (action): action is Extract<DominoAction, { type: 'play' }> => action.type === 'play',
  );
  const firstPlay = playActions[0];
  if (!firstPlay) {
    const draw = actions.find((action) => action.type === 'draw');
    if (draw) return draw;
    const fallback = actions[0];
    if (!fallback) throw new Error('El dominó no tiene acciones legales');
    return fallback;
  }
  if (level === 'novato') {
    return firstPlay;
  }
  const me = state.players.find((player) => player.id === playerId);
  return chooseBest(playActions, (action) => {
    const tile = me?.hand.find((candidate) => candidate.id === action.tileId);
    if (!tile) return -1000;
    const ends = resultingEnds(state, tile, action.side);
    const risk = endRisk(state, playerId, [ends.left, ends.right]);
    const doubleBonus = tile.a === tile.b ? 2 : 0;
    if (level === 'competitivo') {
      return tilePips(tile) * 2 - risk + doubleBonus;
    }
    return tilePips(tile) * 1.5 - risk * 3 + doubleBonus;
  });
}
