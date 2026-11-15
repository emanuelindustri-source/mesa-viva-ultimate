import { describe, expect, it } from 'vitest';
import { createRng } from '../src/engine/rng.js';
import { playToEnd } from '../src/engine/runtime.js';
import { chooseCaidaAction } from '../src/games/caida/ai.js';
import { detectHandCanto } from '../src/games/caida/cantos.js';
import { caidaModule } from '../src/games/caida/module.js';
import { card, makeConfig } from './helpers.js';

describe('cantos de la Caída Venezolana', () => {
  it('detecta patrulla, vigía y ronda', () => {
    expect(detectHandCanto([card(1), card(2, 'copa'), card(3, 'espada')])).toMatchObject({
      kind: 'patrulla',
      value: 6,
    });
    expect(detectHandCanto([card(5), card(5, 'copa'), card(6)])).toMatchObject({
      kind: 'vigia',
      value: 7,
    });
    expect(detectHandCanto([card(10), card(10, 'copa'), card(4)])).toMatchObject({
      kind: 'ronda',
      value: 2,
    });
  });

  it('detecta registro, casillas y trivilín', () => {
    expect(detectHandCanto([card(1), card(11), card(12)])).toMatchObject({
      kind: 'registro',
      value: 8,
    });
    expect(detectHandCanto([card(1), card(11), card(11, 'copa')])).toMatchObject({
      kind: 'casilla',
      value: 11,
    });
    expect(detectHandCanto([card(1), card(12), card(12, 'copa')])).toMatchObject({
      kind: 'casilla',
      value: 12,
    });
    expect(detectHandCanto([card(12), card(12, 'copa'), card(12, 'espada')])).toMatchObject({
      kind: 'trivilin',
      instantWin: true,
    });
  });

  it('devuelve null cuando la mano no tiene canto', () => {
    expect(detectHandCanto([card(1), card(2, 'copa'), card(5, 'espada')])).toBeNull();
  });
});

describe('partida de Caída', () => {
  it('reparte 3 cartas, 4 de mesa y oculta las manos rivales', () => {
    const config = makeConfig(2, 7, { targetScore: 24 });
    const state = caidaModule.createInitialState(config, createRng(config.seed));
    expect(state.players.every((player) => player.hand.length === 3)).toBe(true);
    expect(state.table).toHaveLength(4);
    expect(state.deck).toHaveLength(30);
    const view = caidaModule.view(state, 'p0');
    expect(view.players[0]?.hand).toHaveLength(3);
    expect(view.players[1]?.hand).toBeNull();
  });

  it('las acciones legales pertenecen a la mano del jugador actual', () => {
    const config = makeConfig(3, 99);
    const state = caidaModule.createInitialState(config, createRng(config.seed));
    const player = caidaModule.currentPlayer(state);
    expect(player).not.toBeNull();
    const actions = caidaModule.legalActions(state, player ?? '');
    expect(actions.length).toBeGreaterThan(0);
    const hand = state.players.find((candidate) => candidate.id === player)?.hand ?? [];
    for (const action of actions) {
      if (action.type === 'play') {
        expect(hand.some((item) => item.id === action.cardId)).toBe(true);
      }
    }
  });

  it('los bots maestro completan partidas deterministas', () => {
    const run = () => {
      const config = makeConfig(4, 12345, { targetScore: 24 });
      const state = caidaModule.createInitialState(config, createRng(config.seed));
      return playToEnd(
        caidaModule,
        state,
        (current, player, legal) => chooseCaidaAction(current, player, 'maestro', legal),
        20_000,
      );
    };
    const first = run();
    const second = run();
    expect(first.finished).toBe(true);
    const result = caidaModule.result(first.state);
    expect(result).not.toBeNull();
    expect(result?.winners.length).toBeGreaterThan(0);
    expect(caidaModule.result(second.state)?.winners).toEqual(result?.winners);
  });
});
