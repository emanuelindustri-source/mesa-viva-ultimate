import { describe, expect, it } from 'vitest';
import { createRng } from '../src/engine/rng.js';
import { act, playToEnd } from '../src/engine/runtime.js';
import { chooseDominoAction } from '../src/games/domino/ai.js';
import { dominoModule } from '../src/games/domino/module.js';
import { createDominoState } from '../src/games/domino/setup.js';
import { createDominoSet } from '../src/games/domino/tiles.js';
import { makeConfig } from './helpers.js';

describe('dominó venezolano', () => {
  it('crea las 28 fichas de doble seis', () => {
    const set = createDominoSet();
    expect(set).toHaveLength(28);
    expect(new Set(set.map((tile) => tile.id)).size).toBe(28);
    expect(set).toContainEqual({ id: '6-6', a: 6, b: 6 });
  });

  it('reparte 1v1 y 2v2 con sus boneyards correctos', () => {
    const one = createDominoState(makeConfig(2, 5), createRng(5));
    expect(one.mode).toBe('1v1');
    expect(one.players.every((player) => player.hand.length === 7)).toBe(true);
    expect(one.boneyard).toHaveLength(14);
    const two = createDominoState(makeConfig(4, 5), createRng(5));
    expect(two.mode).toBe('2v2');
    expect(two.boneyard).toHaveLength(0);
    expect(two.teamScores).toEqual([0, 0]);
  });

  it('abre la mesa con una ficha y permite continuar por los extremos', () => {
    const state = createDominoState(makeConfig(2, 77), createRng(77));
    const player = dominoModule.currentPlayer(state);
    const actions = dominoModule.legalActions(state, player ?? '');
    expect(actions.every((action) => action.type === 'play' && action.side === null)).toBe(true);
    const first = actions[0];
    if (first?.type !== 'play') throw new Error('Sin jugada inicial');
    const after = act(dominoModule, state, player ?? '', first);
    expect(after.started).toBe(true);
    expect(after.board).toHaveLength(1);
    expect(after.leftEnd).not.toBeNull();
    expect(after.rightEnd).not.toBeNull();
    const nextPlayer = dominoModule.currentPlayer(after);
    const nextActions = dominoModule.legalActions(after, nextPlayer ?? '');
    for (const action of nextActions) {
      if (action.type === 'play') {
        expect(action.side).not.toBeNull();
      }
    }
  });

  it('oculta las fichas de los rivales', () => {
    const state = createDominoState(makeConfig(4, 8), createRng(8));
    const view = dominoModule.view(state, 'p0');
    expect(view.players[0]?.hand).toHaveLength(7);
    expect(view.players[1]?.hand).toBeNull();
    expect(view.players[2]?.hand).toBeNull();
  });

  it('completa partidas 1v1 y 2v2 con resultado determinista', () => {
    for (const count of [2, 4]) {
      const play = () => {
        const config = makeConfig(count, 4242, { targetScore: 20 });
        const initial = createDominoState(config, createRng(config.seed));
        return playToEnd(
          dominoModule,
          initial,
          (state, player, legal) => chooseDominoAction(state, player, 'maestro', legal),
          10_000,
        );
      };
      const first = play();
      const second = play();
      expect(first.finished).toBe(true);
      expect(dominoModule.result(first.state)).not.toBeNull();
      expect(dominoModule.result(first.state)).toEqual(dominoModule.result(second.state));
    }
  });
});
