import type { GameMeta, IGameModule } from '../../engine/types.js';
import {
  applyDominoAction,
  currentDominoPlayer,
  dominoResult,
  legalDominoActions,
} from './rules.js';
import { createDominoState } from './setup.js';
import type { DominoAction, DominoState } from './types.js';
import { type DominoView, viewDominoState } from './view.js';

export const DOMINO_META: GameMeta = {
  id: 'domino-venezolano',
  name: 'Dominó Venezolano',
  i18nKey: 'games.domino',
  family: 'tablero',
  minPlayers: 2,
  maxPlayers: 4,
  modes: ['solo', 'local', 'online'],
  description:
    'Doble seis para 1v1 o 2v2 con equipos alternos, salida, pases, tranca y puntuación a 100.',
};

export const dominoModule: IGameModule<DominoState, DominoAction, DominoView> = {
  meta: DOMINO_META,
  createInitialState: createDominoState,
  currentPlayer: currentDominoPlayer,
  legalActions: legalDominoActions,
  applyAction: applyDominoAction,
  view: viewDominoState,
  result: dominoResult,
};
