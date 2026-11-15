import { handValue } from '../common/playing-cards.js';
import { drawBlackjackCard } from './shoe.js';
import type { BlackjackState } from './types.js';

function log(state: BlackjackState, message: string): void {
  state.log.push(message);
  if (state.log.length > 60) state.log.splice(0, state.log.length - 60);
}

export function settleBlackjackRound(state: BlackjackState): BlackjackState {
  state.dealer.hidden = false;
  const dealerNatural =
    state.dealer.cards.length === 2 && handValue(state.dealer.cards).total === 21;
  let dealer = handValue(state.dealer.cards);
  while (
    dealer.total < 17 ||
    (state.hitSoft17 && dealer.total === 17 && dealer.soft)
  ) {
    state.dealer.cards.push(drawBlackjackCard(state));
    dealer = handValue(state.dealer.cards);
  }
  const dealerTotal = dealer.total;

  for (const player of state.players) {
    const hand = player.hand;
    if (!hand) continue;
    const playerValue = handValue(hand.cards);
    const playerNatural = playerValue.total === 21 && hand.cards.length === 2;
    if (playerNatural) hand.status = 'blackjack';
    if (hand.status === 'bust') {
      hand.outcome = 'loss';
      hand.payout = 0;
    } else if (playerNatural && dealerNatural) {
      hand.outcome = 'push';
      hand.payout = hand.bet;
    } else if (playerNatural) {
      hand.outcome = 'win';
      hand.payout = hand.bet * 2.5;
    } else if (dealerNatural) {
      hand.outcome = 'loss';
      hand.payout = 0;
    } else if (dealerTotal > 21 || playerValue.total > dealerTotal) {
      hand.outcome = 'win';
      hand.payout = hand.bet * 2;
    } else if (playerValue.total === dealerTotal) {
      hand.outcome = 'push';
      hand.payout = hand.bet;
    } else {
      hand.outcome = 'loss';
      hand.payout = 0;
    }
    player.bankroll += hand.payout;
    log(state, `${player.name}: ${hand.outcome} (${hand.payout} fichas)`);
  }

  state.roundsPlayed += 1;
  log(state, `Crupier termina con ${dealerTotal}`);
  const anySolvent = state.players.some((player) => player.bankroll >= state.minBet);
  if (
    (state.maxRounds > 0 && state.roundsPlayed >= state.maxRounds) ||
    !anySolvent
  ) {
    state.phase = 'session-over';
    log(state, 'Sesión de Blackjack finalizada');
  } else {
    state.phase = 'settled';
  }
  return state;
}
