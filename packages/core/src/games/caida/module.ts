import type { GameMeta, IGameModule } from '../../engine/types.js';
import { applyCaidaAction, caidaResult, currentCaidaPlayer, legalCaidaActions } from './rules.js';
import { createCaidaState } from './setup.js';
import type { CaidaAction, CaidaState } from './types.js';
import { type CaidaView, viewCaidaState } from './view.js';

export const CAIDA_META: GameMeta = {
  id: 'caida-venezolana',
  name: 'Caída Venezolana',
  i18nKey: 'games.caida',
  family: 'cartas',
  minPlayers: 2,
  maxPlayers: 4,
  modes: ['solo', 'local', 'online'],
  description:
    'Juego de cartas venezolano: entrega de mesa, cantos, caídas y carrera a 24 puntos.',
};

export const caidaModule: IGameModule<CaidaState, CaidaAction, CaidaView> = {
  meta: CAIDA_META,
  createInitialState: createCaidaState,
  currentPlayer: currentCaidaPlayer,
  legalActions: legalCaidaActions,
  applyAction: applyCaidaAction,
  view: viewCaidaState,
  result: caidaResult,
};
