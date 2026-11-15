import {
  type BlackjackAction,
  type BlackjackState,
  type BotLevel,
  blackjackModule,
  type CaidaAction,
  type CaidaState,
  type ColorsAction,
  type ColorsState,
  caidaModule,
  chooseBlackjackAction,
  chooseCaidaAction,
  chooseColorsAction,
  chooseDominoAction,
  colorsModule,
  type DominoAction,
  type DominoState,
  dominoModule,
  type IGameModule,
} from '@mesa-viva/core';
import {
  snapshotFromBlackjack,
  snapshotFromCaida,
  snapshotFromColors,
  snapshotFromDomino,
  type TableSnapshot,
} from '@mesa-viva/engine-25d';

export type GameKey = 'caida' | 'domino' | 'blackjack' | 'colores';

type AnyModule = IGameModule<unknown, unknown, unknown>;

export interface GameDefinition {
  readonly key: GameKey;
  readonly name: string;
  readonly family: 'cartas' | 'tablero';
  readonly module: AnyModule;
  readonly defaultPlayers: number;
  readonly minPlayers: number;
  readonly maxPlayers: number;
  readonly choose: (state: unknown, player: string, level: BotLevel, legal: readonly unknown[]) => unknown;
  readonly snapshot: (view: unknown, viewer: string) => TableSnapshot;
  readonly hook: string;
}

function asModule<S, A, V>(module: IGameModule<S, A, V>): AnyModule {
  return module as unknown as AnyModule;
}

export const GAME_DEFINITIONS: Readonly<Record<GameKey, GameDefinition>> = {
  caida: {
    key: 'caida', name: 'Caída Venezolana', family: 'cartas', module: asModule(caidaModule),
    defaultPlayers: 2, minPlayers: 2, maxPlayers: 4, hook: 'Cantos y mesa limpia',
    choose: (state, player, level, legal) => chooseCaidaAction(state as CaidaState, player, level, legal as readonly CaidaAction[]),
    snapshot: (view, viewer) => snapshotFromCaida(view as never, viewer),
  },
  domino: {
    key: 'domino', name: 'Dominó Venezolano', family: 'tablero', module: asModule(dominoModule),
    defaultPlayers: 2, minPlayers: 2, maxPlayers: 4, hook: 'Tranca y doble seis',
    choose: (state, player, level, legal) => chooseDominoAction(state as DominoState, player, level, legal as readonly DominoAction[]),
    snapshot: (view, viewer) => snapshotFromDomino(view as never, viewer),
  },
  blackjack: {
    key: 'blackjack', name: 'Blackjack 21', family: 'cartas', module: asModule(blackjackModule),
    defaultPlayers: 1, minPlayers: 1, maxPlayers: 4, hook: '21, doblar y plantar',
    choose: (state, player, level, legal) => chooseBlackjackAction(state as BlackjackState, player, level, legal as readonly BlackjackAction[]),
    snapshot: (view, viewer) => snapshotFromBlackjack(view as never, viewer),
  },
  colores: {
    key: 'colores', name: 'Cartas de Colores', family: 'cartas', module: asModule(colorsModule),
    defaultPlayers: 2, minPlayers: 2, maxPlayers: 4, hook: 'Salta, reversa y comodines',
    choose: (state, player, level, legal) => chooseColorsAction(state as ColorsState, player, level, legal as readonly ColorsAction[]),
    snapshot: (view, viewer) => snapshotFromColors(view as never, viewer),
  },
};

export const GAME_KEYS: readonly GameKey[] = ['caida', 'domino', 'blackjack', 'colores'];

export function gameDefinition(key: GameKey): GameDefinition {
  return GAME_DEFINITIONS[key];
}

export function isGameKey(value: string): value is GameKey {
  return GAME_KEYS.includes(value as GameKey);
}
