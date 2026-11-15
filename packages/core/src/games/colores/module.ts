import type { GameMeta, IGameModule } from '../../engine/types.js';
import {
  applyColorsAction,
  colorsResult,
  currentColorsPlayer,
  legalColorsActions,
} from './rules.js';
import { createColorsState } from './setup.js';
import type { ColorsAction, ColorsState } from './types.js';
import { type ColorsView, viewColorsState } from './view.js';

export const COLORS_META: GameMeta = {
  id: 'cartas-de-colores',
  name: 'Cartas de Colores',
  i18nKey: 'games.colores',
  family: 'cartas',
  minPlayers: 2,
  maxPlayers: 4,
  modes: ['solo', 'local', 'online'],
  description:
    'Juego original de colores y símbolos: salta, reversa, roba dos y comodines. Gana quien llegue a 500.',
};

export const colorsModule: IGameModule<ColorsState, ColorsAction, ColorsView> = {
  meta: COLORS_META,
  createInitialState: createColorsState,
  currentPlayer: currentColorsPlayer,
  legalActions: legalColorsActions,
  applyAction: applyColorsAction,
  view: viewColorsState,
  result: colorsResult,
};
