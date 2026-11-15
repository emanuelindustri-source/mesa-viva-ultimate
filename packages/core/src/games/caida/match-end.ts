import { createRng } from '../../engine/rng.js';
import type { PlayerId } from '../../engine/types.js';
import { shuffle } from '../common/shuffle.js';
import {
  compareCards,
  createSpanishDeck,
  type SpanishCard,
} from '../common/spanish-deck.js';
import { logCaida } from './log.js';
import type { CaidaPlayer, CaidaState } from './types.js';

function resolveTiebreak(state: CaidaState, tied: readonly CaidaPlayer[]): PlayerId[] {
  if (state.tiebreakDeck.length < tied.length) {
    state.tiebreakDeck = shuffle(createSpanishDeck(), createRng(state.seed + state.round * 31));
  }
  let best: { id: PlayerId; card: SpanishCard } | null = null;
  for (const player of tied) {
    const card = state.tiebreakDeck.shift();
    if (!card) break;
    if (best === null || compareCards(card, best.card) > 0) {
      best = { id: player.id, card };
    }
  }
  return [best?.id ?? tied[0]?.id ?? state.players[0]?.id ?? 'p0'];
}

export function finishMatchIfNeeded(state: CaidaState): boolean {
  const max = Math.max(...state.players.map((player) => player.score));
  if (max < state.targetScore) return false;
  const tied = state.players.filter((player) => player.score === max);
  let winners: PlayerId[];
  if (tied.length === 1) {
    winners = [tied[0]?.id ?? state.players[0]?.id ?? 'p0'];
  } else {
    winners = resolveTiebreak(state, tied);
    state.endReason = 'desempate';
  }
  state.matchWinners = winners;
  state.phase = 'match-over';
  if (state.endReason === null) state.endReason = 'puntos';
  logCaida(state, `Fin de partida: gana ${winners.join(', ')} con ${max} puntos`);
  return true;
}
