import { describe, expect, it } from 'vitest';
import { createRng } from '../src/engine/rng.js';
import { playToEnd } from '../src/engine/runtime.js';
import { chooseColorsAction } from '../src/games/colores/ai.js';
import { createColorsDeck } from '../src/games/colores/deck.js';
import { colorsModule } from '../src/games/colores/module.js';
import { createColorsState } from '../src/games/colores/setup.js';
import { makeConfig } from './helpers.js';

describe('Cartas de Colores', () => {
  it('construye la baraja original de 108 cartas', () => {
    const deck = createColorsDeck();
    expect(deck).toHaveLength(108);
    expect(new Set(deck.map((card) => card.id)).size).toBe(108);
    expect(deck.filter((card) => card.color === 'rojo')).toHaveLength(25);
    expect(deck.filter((card) => card.symbol === 'roba4')).toHaveLength(4);
    expect(deck.filter((card) => card.color === 'negro')).toHaveLength(8);
  });

  it('reparte 7 cartas y deja una carta numérica inicial', () => {
    const state = createColorsState(makeConfig(2, 11), createRng(11));
    expect(state.players.every((player) => player.hand.length === 7)).toBe(true);
    expect(state.discard).toHaveLength(1);
    expect(state.drawPile).toHaveLength(93);
    expect(typeof state.discard[0]?.symbol).toBe('number');
    expect(state.currentColor).not.toBe('negro');
  });

  it('oculta las manos ajenas y ofrece acciones legales', () => {
    const state = createColorsState(makeConfig(3, 12), createRng(12));
    const view = colorsModule.view(state, 'p0');
    expect(view.players[0]?.hand).toHaveLength(7);
    expect(view.players[1]?.hand).toBeNull();
    const player = colorsModule.currentPlayer(state);
    expect(colorsModule.legalActions(state, player ?? '').length).toBeGreaterThan(0);
  });

  it('simula partidas completas con los tres niveles de bots', () => {
    for (const level of ['novato', 'competitivo', 'maestro'] as const) {
      const config = makeConfig(3, 880, { targetScore: 50 });
      const initial = createColorsState(config, createRng(config.seed));
      const report = playToEnd(
        colorsModule,
        initial,
        (state, player, legal) => chooseColorsAction(state, player, level, legal),
        20_000,
      );
      expect(report.finished).toBe(true);
      const result = colorsModule.result(report.state);
      expect(result).not.toBeNull();
      expect(result?.winners.length).toBeGreaterThan(0);
    }
  });

  it('es determinista con la misma semilla y los mismos bots', () => {
    const config = makeConfig(4, 31337, { targetScore: 50 });
    const run = () => {
      const initial = createColorsState(config, createRng(config.seed));
      return playToEnd(
        colorsModule,
        initial,
        (state, player, legal) => chooseColorsAction(state, player, 'maestro', legal),
        20_000,
      );
    };
    expect(colorsModule.result(run().state)).toEqual(colorsModule.result(run().state));
  });
});
