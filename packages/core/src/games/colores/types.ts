import type { PlayerId } from '../../engine/types.js';

export const COLORS = ['rojo', 'azul', 'verde', 'amarillo'] as const;
export type ColorsColor = (typeof COLORS)[number];

export type ColorsSymbol =
  | number
  | 'salta'
  | 'reversa'
  | 'roba2'
  | 'comodin'
  | 'roba4';

export interface ColorsCard {
  readonly id: string;
  readonly color: ColorsColor | 'negro';
  readonly symbol: ColorsSymbol;
  readonly value: number;
}

export type ColorsPhase = 'playing' | 'round-over' | 'match-over';

export interface ColorsPlayer {
  readonly id: PlayerId;
  readonly name: string;
  hand: ColorsCard[];
  score: number;
}

export interface ColorsRoundSummary {
  readonly round: number;
  readonly winnerId: PlayerId;
  readonly points: number;
}

export interface ColorsState {
  readonly gameId: 'colores';
  players: ColorsPlayer[];
  drawPile: ColorsCard[];
  discard: ColorsCard[];
  currentColor: ColorsColor;
  direction: 1 | -1;
  turnIndex: number;
  phase: ColorsPhase;
  readonly targetScore: number;
  readonly seed: number;
  round: number;
  turn: number;
  drawnCardId: string | null;
  readonly strictWild4: boolean;
  lastRound: ColorsRoundSummary | null;
  matchWinners: PlayerId[];
  endReason: string | null;
  log: string[];
}

export type ColorsAction =
  | {
      readonly type: 'play';
      readonly cardId: string;
      readonly color: ColorsColor | null;
    }
  | { readonly type: 'draw' }
  | { readonly type: 'pass' }
  | { readonly type: 'next-round' };
