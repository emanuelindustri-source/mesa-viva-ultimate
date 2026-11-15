import type { PlayerId } from '../../engine/types.js';
import type { PlayingCard } from '../common/playing-cards.js';

export type BlackjackPhase = 'betting' | 'playing' | 'settled' | 'session-over';
export type HandStatus = 'active' | 'stood' | 'bust' | 'blackjack';
export type HandOutcome = 'pending' | 'win' | 'loss' | 'push';

export interface BlackjackHand {
  readonly cards: PlayingCard[];
  bet: number;
  doubled: boolean;
  status: HandStatus;
  outcome: HandOutcome;
  payout: number;
}

export interface BlackjackPlayer {
  readonly id: PlayerId;
  readonly name: string;
  bankroll: number;
  hand: BlackjackHand | null;
}

export interface BlackjackState {
  readonly gameId: 'blackjack';
  players: BlackjackPlayer[];
  dealer: { cards: PlayingCard[]; hidden: boolean };
  shoe: PlayingCard[];
  phase: BlackjackPhase;
  turnIndex: number;
  betIndex: number;
  round: number;
  roundsPlayed: number;
  readonly maxRounds: number;
  readonly minBet: number;
  readonly maxBet: number;
  readonly decks: number;
  readonly hitSoft17: boolean;
  readonly seed: number;
  shoeCycle: number;
  log: string[];
}

export type BlackjackAction =
  | { readonly type: 'bet'; readonly amount: number }
  | { readonly type: 'hit' }
  | { readonly type: 'stand' }
  | { readonly type: 'double' }
  | { readonly type: 'next-round' };
