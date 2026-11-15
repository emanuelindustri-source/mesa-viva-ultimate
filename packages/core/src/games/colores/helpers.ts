import { createRng } from '../../engine/rng.js';
import { shuffle } from '../common/shuffle.js';
import type { ColorsCard, ColorsState } from './types.js';

export function topCard(state: ColorsState): ColorsCard {
  const card = state.discard[state.discard.length - 1];
  if (!card) throw new Error('La pila de descarte está vacía');
  return card;
}

export function isPlayable(
  state: ColorsState,
  card: ColorsCard,
  hand: readonly ColorsCard[],
): boolean {
  if (card.color === 'negro') {
    if (
      card.symbol === 'roba4' &&
      state.strictWild4 &&
      hand.some((other) => other.color === state.currentColor)
    ) {
      return false;
    }
    return true;
  }
  return card.color === state.currentColor || card.symbol === topCard(state).symbol;
}

export function handScore(cards: readonly ColorsCard[]): number {
  return cards.reduce((total, card) => total + card.value, 0);
}

export function nextIndex(state: ColorsState, steps: number): number {
  const count = state.players.length;
  return (state.turnIndex + state.direction * steps + count * 100) % count;
}

export function advanceTurn(state: ColorsState, steps = 1): void {
  state.turnIndex = nextIndex(state, steps);
}

export function ensureDrawPile(state: ColorsState): void {
  if (state.drawPile.length > 0) return;
  const top = state.discard[state.discard.length - 1];
  const rest = state.discard.slice(0, -1);
  if (!top || rest.length === 0) return;
  state.drawPile = shuffle(
    rest,
    createRng(state.seed + state.round * 7919 + state.turn * 31 + state.drawPile.length),
  );
  state.discard = [top];
  state.log.push('Se rebaraja el descarte');
}

export function drawTo(
  state: ColorsState,
  targetIndex: number,
  count: number,
): number {
  const target = state.players[targetIndex];
  if (!target) return 0;
  let drawn = 0;
  for (let i = 0; i < count; i += 1) {
    ensureDrawPile(state);
    const card = state.drawPile.shift();
    if (!card) break;
    target.hand.push(card);
    drawn += 1;
  }
  return drawn;
}

export function canDraw(state: ColorsState): boolean {
  return state.drawPile.length > 0 || state.discard.length > 1;
}
