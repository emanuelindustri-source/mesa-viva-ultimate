import { type BotLevel, chooseBest } from '../../ai/types.js';
import { legalColorsActions } from './rules.js';
import { COLORS, type ColorsAction, type ColorsColor, type ColorsState } from './types.js';

function nextPlayerIndex(state: ColorsState): number {
  const count = state.players.length;
  return (state.turnIndex + state.direction + count * 100) % count;
}

function colorCount(state: ColorsState, playerId: string, color: ColorsColor): number {
  const me = state.players.find((player) => player.id === playerId);
  return me?.hand.filter((card) => card.color === color).length ?? 0;
}

function seenColorCount(state: ColorsState, playerId: string, color: ColorsColor): number {
  const me = state.players.find((player) => player.id === playerId);
  const seen = [
    ...state.discard,
    ...(me?.hand ?? []),
  ];
  return seen.filter((card) => card.color === color).length;
}

function actionScore(
  state: ColorsState,
  playerId: string,
  action: Extract<ColorsAction, { type: 'play' }>,
  level: BotLevel,
): number {
  const me = state.players.find((player) => player.id === playerId);
  const card = me?.hand.find((candidate) => candidate.id === action.cardId);
  if (!card) return -1000;
  const nextCount = state.players[nextPlayerIndex(state)]?.hand.length ?? 7;
  const lowNext = nextCount <= 2;
  const color = action.color ?? (card.color === 'negro' ? 'rojo' : card.color);
  let score = 0;
  if (card.symbol === 'roba4') score += lowNext ? 60 : 18;
  else if (card.symbol === 'roba2') score += lowNext ? 50 : 20;
  else if (card.symbol === 'salta') score += lowNext ? 45 : 16;
  else if (card.symbol === 'reversa') score += lowNext ? 38 : 14;
  else if (card.symbol === 'comodin') score += 8;
  else if (typeof card.symbol === 'number') score += 10 + card.symbol * 0.3;
  if (card.color === 'negro') score -= level === 'maestro' && !lowNext ? 18 : 6;
  score += colorCount(state, playerId, color) * 3;
  if (level === 'maestro') {
    const seen = seenColorCount(state, playerId, color);
    score += (25 - seen) * 0.35;
  }
  return score;
}

export function chooseColorsAction(
  state: ColorsState,
  playerId: string,
  level: BotLevel,
  legal?: readonly ColorsAction[],
): ColorsAction {
  const actions = legal ?? legalColorsActions(state, playerId);
  if (actions.length === 0) throw new Error('Cartas de Colores no tiene acciones legales');
  const nextRound = actions.find((action) => action.type === 'next-round');
  if (nextRound) return nextRound;
  const plays = actions.filter(
    (action): action is Extract<ColorsAction, { type: 'play' }> => action.type === 'play',
  );
  const firstPlay = plays[0];
  if (!firstPlay) {
    const draw = actions.find((action) => action.type === 'draw');
    const pass = actions.find((action) => action.type === 'pass');
    const fallback = draw ?? pass;
    if (!fallback) throw new Error('Cartas de Colores no tiene acciones legales');
    return fallback;
  }
  if (level === 'novato') return firstPlay;
  return chooseBest(plays, (action) => actionScore(state, playerId, action, level));
}

export const COLORS_ORDER = COLORS;
