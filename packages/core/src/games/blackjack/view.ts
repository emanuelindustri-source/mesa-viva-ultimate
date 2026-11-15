import type { GameResult, PlayerId } from '../../engine/types.js';
import { handValue, type PlayingCard } from '../common/playing-cards.js';
import { blackjackResult } from './rules.js';
import type {
  BlackjackHand,
  BlackjackPhase,
  BlackjackState,
  HandOutcome,
  HandStatus,
} from './types.js';

export interface BlackjackHandView {
  readonly cards: readonly PlayingCard[];
  readonly total: number;
  readonly soft: boolean;
  readonly bet: number;
  readonly doubled: boolean;
  readonly status: HandStatus;
  readonly outcome: HandOutcome;
  readonly payout: number;
}

export interface BlackjackPlayerView {
  readonly id: PlayerId;
  readonly name: string;
  readonly bankroll: number;
  readonly hand: BlackjackHandView | null;
}

function handView(hand: BlackjackHand | null): BlackjackHandView | null {
  if (!hand) return null;
  const value = handValue(hand.cards);
  return {
    cards: hand.cards,
    total: value.total,
    soft: value.soft,
    bet: hand.bet,
    doubled: hand.doubled,
    status: hand.status,
    outcome: hand.outcome,
    payout: hand.payout,
  };
}

export interface BlackjackView {
  readonly gameId: 'blackjack';
  readonly phase: BlackjackPhase;
  readonly round: number;
  readonly roundsPlayed: number;
  readonly maxRounds: number;
  readonly dealer: {
    readonly cards: readonly PlayingCard[];
    readonly hidden: boolean;
    readonly total: number;
  };
  readonly players: readonly BlackjackPlayerView[];
  readonly turnPlayer: PlayerId | null;
  readonly betPlayer: PlayerId | null;
  readonly minBet: number;
  readonly maxBet: number;
  readonly shoeCount: number;
  readonly result: GameResult | null;
  readonly log: readonly string[];
}

export function viewBlackjackState(state: BlackjackState, _viewer: PlayerId): BlackjackView {
  const visibleDealer = state.dealer.hidden
    ? state.dealer.cards.slice(0, 1)
    : state.dealer.cards;
  return {
    gameId: 'blackjack',
    phase: state.phase,
    round: state.round,
    roundsPlayed: state.roundsPlayed,
    maxRounds: state.maxRounds,
    dealer: {
      cards: visibleDealer,
      hidden: state.dealer.hidden,
      total: handValue(visibleDealer).total,
    },
    players: state.players.map((player) => ({
      id: player.id,
      name: player.name,
      bankroll: player.bankroll,
      hand: handView(player.hand),
    })),
    turnPlayer: state.phase === 'playing' ? (state.players[state.turnIndex]?.id ?? null) : null,
    betPlayer: state.phase === 'betting' ? (state.players[state.betIndex]?.id ?? null) : null,
    minBet: state.minBet,
    maxBet: state.maxBet,
    shoeCount: state.shoe.length,
    result: blackjackResult(state),
    log: state.log,
  };
}
