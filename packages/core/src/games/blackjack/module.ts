import type { GameMeta, IGameModule } from '../../engine/types.js';
import { currentBlackjackPlayer, legalBlackjackActions } from './flow.js';
import {
  applyBlackjackAction,
  blackjackResult,
} from './rules.js';
import { createBlackjackState } from './setup.js';
import type { BlackjackAction, BlackjackState } from './types.js';
import { type BlackjackView, viewBlackjackState } from './view.js';

export const BLACKJACK_META: GameMeta = {
  id: 'blackjack-21',
  name: 'Blackjack 21',
  i18nKey: 'games.blackjack',
  family: 'cartas',
  minPlayers: 1,
  maxPlayers: 4,
  modes: ['solo', 'local', 'online'],
  description:
    'Veintiuno contra el crupier: apuesta, pide, plántate o dobla. Blackjack paga 3:2.',
};

export const blackjackModule: IGameModule<BlackjackState, BlackjackAction, BlackjackView> = {
  meta: BLACKJACK_META,
  createInitialState: createBlackjackState,
  currentPlayer: currentBlackjackPlayer,
  legalActions: legalBlackjackActions,
  applyAction: applyBlackjackAction,
  view: viewBlackjackState,
  result: blackjackResult,
};
