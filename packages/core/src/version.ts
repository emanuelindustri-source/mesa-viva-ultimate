export const CORE_VERSION = '0.1.0';

/**
 * Identificador de un juego registrado en el catálogo universal.
 * En la Fase 1 se ampliará con el contrato IGameModule completo.
 */
export type GameId = string;

export interface GameSummary {
  readonly id: GameId;
  readonly nombre: string;
  readonly familia: 'cartas' | 'tablero' | 'original';
  readonly jugadoresMin: number;
  readonly jugadoresMax: number;
}
