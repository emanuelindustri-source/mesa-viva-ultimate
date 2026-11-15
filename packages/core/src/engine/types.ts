import type { Rng } from './rng.js';

export type PlayerId = string;
export type GameFamily = 'cartas' | 'tablero' | 'original';
export type GameMode = 'solo' | 'local' | 'online';

export interface PlayerConfig {
  readonly id: PlayerId;
  readonly name: string;
  readonly kind: 'human' | 'bot';
}

export type GameOptions = Readonly<Record<string, unknown>>;

export interface GameConfig {
  readonly players: readonly PlayerConfig[];
  readonly seed: number;
  readonly options?: GameOptions;
}

export interface GameMeta {
  readonly id: string;
  readonly name: string;
  readonly i18nKey: string;
  readonly family: GameFamily;
  readonly minPlayers: number;
  readonly maxPlayers: number;
  readonly modes: readonly GameMode[];
  readonly description: string;
}

export interface GameResult {
  readonly winners: readonly PlayerId[];
  readonly scores: Readonly<Record<PlayerId, number>>;
  readonly reason: string;
}

/**
 * Contrato universal de un juego. Todo estado y toda acción deben ser
 * serializables a JSON; el motor no guarda funciones, red ni UI.
 */
export interface IGameModule<S, A, V> {
  readonly meta: GameMeta;
  createInitialState(config: GameConfig, rng: Rng): S;
  currentPlayer(state: S): PlayerId | null;
  legalActions(state: S, player: PlayerId): readonly A[];
  applyAction(state: S, player: PlayerId, action: A): S;
  view(state: S, viewer: PlayerId): V;
  result(state: S): GameResult | null;
}

export interface BotPolicy<S, A> {
  choose(state: S, player: PlayerId, legal: readonly A[]): A;
}
