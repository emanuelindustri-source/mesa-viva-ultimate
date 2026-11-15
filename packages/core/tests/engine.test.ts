import { describe, expect, it } from 'vitest';
import { actionKey } from '../src/engine/action-key.js';
import {
  readBoolean,
  readInt,
  readNumber,
  readString,
  validatePlayers,
} from '../src/engine/config.js';
import { IllegalActionError, InvalidConfigError } from '../src/engine/errors.js';
import { createRng } from '../src/engine/rng.js';
import { act, playToEnd } from '../src/engine/runtime.js';
import { chooseCaidaAction } from '../src/games/caida/ai.js';
import { caidaModule } from '../src/games/caida/module.js';
import { takeCards } from '../src/games/common/shuffle.js';
import { makeConfig } from './helpers.js';

describe('configuración del motor', () => {
  it('lee opciones con valores por defecto y valida tipos', () => {
    expect(readNumber(undefined, 'x', 3)).toBe(3);
    expect(readNumber({ x: 4 }, 'x', 3)).toBe(4);
    expect(() => readNumber({ x: '4' }, 'x', 3)).toThrow(InvalidConfigError);
    expect(readInt({ x: 5 }, 'x', 1, 1, 10)).toBe(5);
    expect(() => readInt({ x: 1.5 }, 'x', 1, 1, 10)).toThrow();
    expect(() => readInt({ x: 20 }, 'x', 1, 1, 10)).toThrow();
    expect(readBoolean({ x: true }, 'x', false)).toBe(true);
    expect(() => readBoolean({ x: 1 }, 'x', false)).toThrow();
    expect(readString({ x: 'asc' }, 'x', 'asc', ['asc', 'desc'] as const)).toBe('asc');
    expect(() => readString({ x: 'otro' }, 'x', 'asc', ['asc', 'desc'] as const)).toThrow();
  });

  it('valida cantidad, unicidad y semilla de jugadores', () => {
    expect(() => validatePlayers(makeConfig(3), 2, 2)).toThrow();
    const duplicated = {
      ...makeConfig(2),
      players: [
        { id: 'p0', name: 'A', kind: 'human' as const },
        { id: 'p0', name: 'B', kind: 'human' as const },
      ],
    };
    expect(() => validatePlayers(duplicated, 2, 2)).toThrow();
    const fractional = { ...makeConfig(2), seed: 1.5 };
    expect(() => validatePlayers(fractional, 2, 2)).toThrow();
  });

  it('convierte acciones a claves canónicas', () => {
    expect(actionKey(7)).toBe('7');
    expect(actionKey({ b: 2, a: 1 })).toBe(actionKey({ a: 1, b: 2 }));
    expect(actionKey(null)).toBe('null');
  });

  it('expone errores tipados', () => {
    expect(new IllegalActionError('x').name).toBe('IllegalActionError');
    expect(new InvalidConfigError('y').name).toBe('InvalidConfigError');
  });
});

describe('runtime universal', () => {
  it('rechaza acciones que no están en la lista legal', () => {
    const state = caidaModule.createInitialState(makeConfig(2, 4), createRng(4));
    expect(() => act(caidaModule, state, 'p0', { type: 'next-round' })).toThrow();
  });

  it('detiene partidas que superan el límite de pasos', () => {
    const state = caidaModule.createInitialState(makeConfig(2, 4), createRng(4));
    expect(() =>
      playToEnd(
        caidaModule,
        state,
        (current, player, legal) => chooseCaidaAction(current, player, 'novato', legal),
        1,
      ),
    ).toThrow();
  });

  it('extrae cartas sin mutar la pila original', () => {
    const pile = [1, 2, 3];
    expect(takeCards(pile, 2)).toEqual({ drawn: [1, 2], rest: [3] });
    expect(takeCards(pile, 9).drawn).toHaveLength(3);
    expect(takeCards(pile, -1).drawn).toHaveLength(0);
    expect(pile).toEqual([1, 2, 3]);
  });
});
