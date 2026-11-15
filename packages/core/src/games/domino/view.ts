import type { GameResult, PlayerId } from '../../engine/types.js';
import { dominoResult } from './rules.js';
import type {
  DominoMode,
  DominoPhase,
  DominoPlacement,
  DominoRoundSummary,
  DominoState,
  DominoTile,
} from './types.js';

export interface DominoPlayerView {
  readonly id: PlayerId;
  readonly name: string;
  readonly handCount: number;
  readonly totalPips: number;
  readonly score: number;
  readonly hand: readonly DominoTile[] | null;
}

export interface DominoView {
  readonly gameId: 'domino';
  readonly mode: DominoMode;
  readonly phase: DominoPhase;
  readonly leftEnd: number | null;
  readonly rightEnd: number | null;
  readonly board: readonly DominoPlacement[];
  readonly boneyardCount: number;
  readonly players: readonly DominoPlayerView[];
  readonly turnPlayer: PlayerId | null;
  readonly round: number;
  readonly targetScore: number;
  readonly teamScores: readonly number[];
  readonly lastRound: DominoRoundSummary | null;
  readonly result: GameResult | null;
  readonly log: readonly string[];
}

export function viewDominoState(state: DominoState, viewer: PlayerId): DominoView {
  return {
    gameId: 'domino',
    mode: state.mode,
    phase: state.phase,
    leftEnd: state.leftEnd,
    rightEnd: state.rightEnd,
    board: state.board,
    boneyardCount: state.boneyard.length,
    players: state.players.map((player, index) => ({
      id: player.id,
      name: player.name,
      handCount: player.hand.length,
      totalPips: player.hand.reduce((total, tile) => total + tile.a + tile.b, 0),
      score: state.mode === '2v2' ? (state.teamScores[index % 2] ?? 0) : player.score,
      hand: player.id === viewer ? player.hand : null,
    })),
    turnPlayer: state.phase === 'playing' ? (state.players[state.turnIndex]?.id ?? null) : null,
    round: state.round,
    targetScore: state.targetScore,
    teamScores: state.teamScores,
    lastRound: state.lastRound,
    result: dominoResult(state),
    log: state.log,
  };
}
