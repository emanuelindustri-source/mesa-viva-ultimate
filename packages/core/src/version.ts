export const CORE_VERSION = '0.2.0';

/**
 * Identificador de un juego registrado en el catálogo universal.
 * El contrato completo vive en engine/types.ts.
 */
export type GameId = string;

export interface GameSummary {
  readonly id: GameId;
  readonly name: string;
  readonly family: 'cartas' | 'tablero' | 'original';
  readonly minPlayers: number;
  readonly maxPlayers: number;
}
