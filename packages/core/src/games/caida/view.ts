import type { GameResult, PlayerId } from '../../engine/types.js';
import type { SpanishCard } from '../common/spanish-deck.js';
import { caidaResult } from './rules.js';
import type {
  CaidaCanto,
  CaidaPhase,
  CaidaRoundSummary,
  CaidaState,
} from './types.js';

export interface CaidaPlayerView {
  readonly id: PlayerId;
  readonly name: string;
  readonly handCount: number;
  readonly capturedCount: number;
  readonly score: number;
  readonly roundPoints: number;
  readonly canto: CaidaCanto | null;
  readonly hand: readonly SpanishCard[] | null;
}

export interface CaidaView {
  readonly gameId: 'caida';
  readonly phase: CaidaPhase;
  readonly round: number;
  readonly targetScore: number;
  readonly dealerId: PlayerId | null;
  readonly turnPlayer: PlayerId | null;
  readonly table: readonly SpanishCard[];
  readonly deckCount: number;
  readonly mesaPoints: number;
  readonly malEchada: boolean;
  readonly players: readonly CaidaPlayerView[];
  readonly lastRound: CaidaRoundSummary | null;
  readonly result: GameResult | null;
  readonly log: readonly string[];
}

export function viewCaidaState(state: CaidaState, viewer: PlayerId): CaidaView {
  return {
    gameId: 'caida',
    phase: state.phase,
    round: state.round,
    targetScore: state.targetScore,
    dealerId: state.players[state.dealerIndex]?.id ?? null,
    turnPlayer: state.phase === 'playing' ? (state.players[state.turnIndex]?.id ?? null) : null,
    table: state.table,
    deckCount: state.deck.length,
    mesaPoints: state.mesaPoints,
    malEchada: state.malEchada,
    players: state.players.map((player) => ({
      id: player.id,
      name: player.name,
      handCount: player.hand.length,
      capturedCount: player.captured.length,
      score: player.score,
      roundPoints: player.roundPoints,
      canto: player.canto,
      hand: player.id === viewer ? player.hand : null,
    })),
    lastRound: state.lastRound,
    result: caidaResult(state),
    log: state.log,
  };
}
