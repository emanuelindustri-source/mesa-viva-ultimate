import type { GameResult, PlayerId } from '../../engine/types.js';
import { colorsResult } from './rules.js';
import type {
  ColorsCard,
  ColorsColor,
  ColorsPhase,
  ColorsRoundSummary,
  ColorsState,
} from './types.js';

export interface ColorsPlayerView {
  readonly id: PlayerId;
  readonly name: string;
  readonly score: number;
  readonly handCount: number;
  readonly hand: readonly ColorsCard[] | null;
}

export interface ColorsView {
  readonly gameId: 'colores';
  readonly phase: ColorsPhase;
  readonly round: number;
  readonly targetScore: number;
  readonly currentColor: ColorsColor;
  readonly direction: 1 | -1;
  readonly topCard: ColorsCard | null;
  readonly drawCount: number;
  readonly players: readonly ColorsPlayerView[];
  readonly turnPlayer: PlayerId | null;
  readonly drawnCardId: string | null;
  readonly lastRound: ColorsRoundSummary | null;
  readonly result: GameResult | null;
  readonly log: readonly string[];
}

export function viewColorsState(state: ColorsState, viewer: PlayerId): ColorsView {
  const top = state.discard[state.discard.length - 1] ?? null;
  return {
    gameId: 'colores',
    phase: state.phase,
    round: state.round,
    targetScore: state.targetScore,
    currentColor: state.currentColor,
    direction: state.direction,
    topCard: top,
    drawCount: state.drawPile.length,
    players: state.players.map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      handCount: player.hand.length,
      hand: player.id === viewer ? player.hand : null,
    })),
    turnPlayer: state.phase === 'playing' ? (state.players[state.turnIndex]?.id ?? null) : null,
    drawnCardId: state.drawnCardId,
    lastRound: state.lastRound,
    result: colorsResult(state),
    log: state.log,
  };
}
