import type { PlayerId } from '../../engine/types.js';

export type DominoMode = '1v1' | '2v2';
export type DominoPhase = 'playing' | 'round-over' | 'match-over';
export type DominoSide = 'left' | 'right';

export interface DominoTile {
  readonly id: string;
  readonly a: number;
  readonly b: number;
}

export interface DominoPlayer {
  readonly id: PlayerId;
  readonly name: string;
  hand: DominoTile[];
  score: number;
}

export interface DominoPlacement {
  readonly tile: DominoTile;
  readonly side: DominoSide;
  readonly flipped: boolean;
}

export interface DominoRoundSummary {
  readonly round: number;
  readonly winnerIds: readonly PlayerId[];
  readonly points: number;
  readonly blocked: boolean;
  readonly teamScores: readonly number[];
}

export interface DominoState {
  readonly gameId: 'domino';
  readonly mode: DominoMode;
  players: DominoPlayer[];
  boneyard: DominoTile[];
  leftEnd: number | null;
  rightEnd: number | null;
  board: DominoPlacement[];
  started: boolean;
  turnIndex: number;
  passesInRow: number;
  phase: DominoPhase;
  readonly targetScore: number;
  readonly seed: number;
  round: number;
  readonly teamScores: number[];
  consecutiveVoidRounds: number;
  lastRound: DominoRoundSummary | null;
  matchWinners: PlayerId[];
  endReason: string | null;
  log: string[];
}

export type DominoAction =
  | { readonly type: 'play'; readonly tileId: string; readonly side: DominoSide | null }
  | { readonly type: 'draw' }
  | { readonly type: 'pass' }
  | { readonly type: 'next-round' };
