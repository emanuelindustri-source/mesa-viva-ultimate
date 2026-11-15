import type { BotLevel } from '../../ai/types.js';
import { PIECE_VALUE } from './board.js';
import type { ChessAction, ChessState } from './types.js';

function scoreMove(state: ChessState, action: ChessAction, level: BotLevel): number {
  const target = state.board[action.to] ?? null;
  const piece = state.board[action.from] ?? null;
  let score = target === null ? 0 : PIECE_VALUE[target.kind] * 10;
  if (action.promotion !== undefined) score += PIECE_VALUE[action.promotion];
  const center = Math.abs(3.5 - (action.to % 8)) + Math.abs(3.5 - Math.floor(action.to / 8));
  score += (7 - center) * (level === 'maestro' ? 0.6 : 0.3);
  if (piece?.kind === 'peon') score += 0.4;
  if (level === 'novato') score = Math.abs(Math.sin(state.fullmove + action.from * 3 + action.to)) * 4;
  return score;
}

/** Bot de ajedrez determinista: prioriza capturas, coronación y centro. */
export function chooseChessAction(
  state: ChessState,
  _player: string,
  level: BotLevel,
  legal: readonly unknown[],
): ChessAction {
  const actions = legal as readonly ChessAction[];
  let best = actions[0];
  if (best === undefined) throw new Error('El ajedrez no tiene movimientos legales');
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const action of actions) {
    const score = scoreMove(state, action, level);
    if (score > bestScore) {
      best = action;
      bestScore = score;
    }
  }
  return best;
}
