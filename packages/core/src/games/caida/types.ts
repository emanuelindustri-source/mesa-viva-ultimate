import type { PlayerId } from '../../engine/types.js';
import type { SpanishCard } from '../common/spanish-deck.js';

export type CaidaCantoKind =
  | 'caida'
  | 'ronda'
  | 'patrulla'
  | 'vigia'
  | 'registro'
  | 'registrico'
  | 'casilla'
  | 'trivilin';

export interface CaidaCanto {
  readonly kind: CaidaCantoKind;
  readonly label: string;
  readonly value: number;
  readonly instantWin: boolean;
}

export type CaidaPhase = 'playing' | 'round-over' | 'match-over';

export interface CaidaPlayer {
  readonly id: PlayerId;
  readonly name: string;
  hand: SpanishCard[];
  captured: SpanishCard[];
  score: number;
  roundPoints: number;
  canto: CaidaCanto | null;
}

export interface CaidaRoundLine {
  readonly id: PlayerId;
  readonly canto: number;
  readonly captures: number;
  readonly leftovers: number;
  readonly total: number;
}

export interface CaidaRoundSummary {
  readonly round: number;
  readonly dealerId: PlayerId;
  readonly lines: readonly CaidaRoundLine[];
  readonly mesaPoints: number;
  readonly malEchada: boolean;
}

export interface CaidaState {
  readonly gameId: 'caida';
  players: CaidaPlayer[];
  deck: SpanishCard[];
  table: SpanishCard[];
  turnIndex: number;
  dealerIndex: number;
  phase: CaidaPhase;
  readonly targetScore: number;
  readonly seed: number;
  round: number;
  turn: number;
  readonly mesaOrder: 'asc' | 'desc';
  mesaPoints: number;
  malEchada: boolean;
  tiebreakDeck: SpanishCard[];
  lastRound: CaidaRoundSummary | null;
  matchWinners: PlayerId[];
  endReason: string | null;
  log: string[];
}

export type CaidaAction =
  | { readonly type: 'play'; readonly cardId: string; readonly captureIndex: number | null }
  | { readonly type: 'next-round' };
