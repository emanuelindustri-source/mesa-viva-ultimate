import { describe, expect, it } from 'vitest';
import { createRng } from '../src/engine/rng.js';
import { act, playToEnd } from '../src/engine/runtime.js';
import { chooseBlackjackAction } from '../src/games/blackjack/ai.js';
import { blackjackModule } from '../src/games/blackjack/module.js';
import { createBlackjackState } from '../src/games/blackjack/setup.js';
import { handValue } from '../src/games/common/playing-cards.js';
import { makeConfig } from './helpers.js';

function playingCard(rank: string, suit = 'picas') {
  return {
    id: `${rank}-${suit}`,
    rank: rank as 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K',
    suit: suit as 'corazones' | 'diamantes' | 'treboles' | 'picas',
  };
}

describe('valor de mano de Blackjack', () => {
  it('cuenta ases flexibles y se pasa correctamente', () => {
    expect(handValue([playingCard('A'), playingCard('K')]).total).toBe(21);
    expect(handValue([playingCard('A'), playingCard('A'), playingCard('9')]).total).toBe(21);
    expect(handValue([playingCard('A'), playingCard('5')])).toMatchObject({ total: 16, soft: true });
    expect(handValue([playingCard('10'), playingCard('10'), playingCard('5')]).total).toBe(25);
  });
});

describe('partida de Blackjack', () => {
  it('apuesta, reparte y respeta el turno', () => {
    const config = makeConfig(1, 3, { maxRounds: 3, startingBankroll: 500 });
    const state = createBlackjackState(config, createRng(config.seed));
    expect(state.phase).toBe('betting');
    const player = blackjackModule.currentPlayer(state);
    const bets = blackjackModule.legalActions(state, player ?? '');
    expect(bets.length).toBeGreaterThan(0);
    const firstBet = bets[0];
    if (firstBet?.type !== 'bet') throw new Error('Sin apuesta inicial');
    const after = act(blackjackModule, state, player ?? '', firstBet);
    expect(after.players[0]?.bankroll).toBe(500 - firstBet.amount);
    expect(['playing', 'settled', 'session-over']).toContain(after.phase);
  });

  it('rechaza acciones fuera de fase', () => {
    const config = makeConfig(1, 3);
    const state = createBlackjackState(config, createRng(config.seed));
    expect(() => act(blackjackModule, state, 'p0', { type: 'hit' })).toThrow();
  });

  it('oculta la carta de hoyo del crupier durante los turnos', () => {
    for (let seed = 1; seed < 30; seed += 1) {
      const config = makeConfig(1, seed, { maxRounds: 2 });
      let state = createBlackjackState(config, createRng(seed));
      const player = blackjackModule.currentPlayer(state);
      const bet = blackjackModule.legalActions(state, player ?? '').find(
        (action) => action.type === 'bet',
      );
      if (!bet) continue;
      state = act(blackjackModule, state, player ?? '', bet);
      if (state.phase === 'playing') {
        const view = blackjackModule.view(state, 'p0');
        expect(view.dealer.hidden).toBe(true);
        expect(view.dealer.cards).toHaveLength(1);
        return;
      }
    }
    throw new Error('No se encontró una mano jugable para la prueba');
  });

  it('simula sesiones completas con los tres niveles', () => {
    for (const level of ['novato', 'competitivo', 'maestro'] as const) {
      const config = makeConfig(2, 909, { maxRounds: 4 });
      const initial = createBlackjackState(config, createRng(config.seed));
      const report = playToEnd(
        blackjackModule,
        initial,
        (state, player, legal) => chooseBlackjackAction(state, player, level, legal),
        2000,
      );
      expect(report.finished).toBe(true);
      expect(blackjackModule.result(report.state)).not.toBeNull();
    }
  });

  it('el resultado no depende de la UI ni de la red', () => {
    const config = makeConfig(2, 5150, { maxRounds: 5 });
    const initial = createBlackjackState(config, createRng(config.seed));
    const run = () =>
      playToEnd(
        blackjackModule,
        initial,
        (state, player, legal) => chooseBlackjackAction(state, player, 'maestro', legal),
        2000,
      );
    expect(blackjackModule.result(run().state)).toEqual(blackjackModule.result(run().state));
  });
});
