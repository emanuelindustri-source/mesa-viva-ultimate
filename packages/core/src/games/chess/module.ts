import type { GameMeta, IGameModule } from '../../engine/types.js';
import { applyChessAction, chessResult, currentChessPlayer, legalChessActions } from './rules.js';
import { createChessState } from './setup.js';
import type { ChessAction, ChessState } from './types.js';
import { type ChessView, viewChessState } from './view.js';

export const CHESS_META: GameMeta = {
  id: 'ajedrez-club',
  name: 'Ajedrez de Club',
  i18nKey: 'games.chess',
  family: 'tablero',
  minPlayers: 2,
  maxPlayers: 2,
  modes: ['solo', 'local', 'online'],
  description:
    'Ajedrez clásico con reglas completas, jaque mate, enroque, al paso y coronación.',
};

export const chessModule: IGameModule<ChessState, ChessAction, ChessView> = {
  meta: CHESS_META,
  createInitialState: createChessState,
  currentPlayer: currentChessPlayer,
  legalActions: legalChessActions,
  applyAction: applyChessAction,
  view: viewChessState,
  result: chessResult,
};
