import { readBoolean, readInt, validatePlayers } from '../../engine/config.js';
import { createRng, type Rng } from '../../engine/rng.js';
import type { GameConfig } from '../../engine/types.js';
import { createStandardShoe } from '../common/playing-cards.js';
import type { BlackjackPlayer, BlackjackState } from './types.js';

export function createBlackjackState(config: GameConfig, rng: Rng): BlackjackState {
  validatePlayers(config, 1, 4);
  const decks = readInt(config.options, 'decks', 6, 1, 8);
  const startingBankroll = readInt(config.options, 'startingBankroll', 1000, 100, 1_000_000);
  const minBet = readInt(config.options, 'minBet', 10, 1, 10_000);
  const maxBet = readInt(config.options, 'maxBet', 500, minBet, 100_000);
  const maxRounds = readInt(config.options, 'maxRounds', 10, 0, 10_000);
  const hitSoft17 = readBoolean(config.options, 'hitSoft17', false);
  const players: BlackjackPlayer[] = config.players.map((player) => ({
    id: player.id,
    name: player.name,
    bankroll: startingBankroll,
    hand: null,
  }));
  return {
    gameId: 'blackjack',
    players,
    dealer: { cards: [], hidden: true },
    shoe: createStandardShoe(decks, rng),
    phase: 'betting',
    turnIndex: 0,
    betIndex: 0,
    round: 1,
    roundsPlayed: 0,
    maxRounds,
    minBet,
    maxBet,
    decks,
    hitSoft17,
    seed: config.seed,
    shoeCycle: 0,
    log: ['Mesa de Blackjack 21 lista'],
  };
}

export function nextRoundShoe(state: BlackjackState): void {
  state.shoeCycle += 1;
  state.shoe = createStandardShoe(state.decks, createRng(state.seed + state.shoeCycle * 104729));
}
