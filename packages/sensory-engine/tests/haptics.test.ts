import { describe, expect, it } from 'vitest';
import {
  HAPTIC_GESTURES,
  HAPTIC_PRIMITIVES,
} from '../src/version.js';

describe('motor sensorial', () => {
  it('define las cuatro primitivas hápticas', () => {
    expect(HAPTIC_PRIMITIVES).toEqual(['tick', 'click', 'thud', 'spin']);
  });

  it('cada gesto usa solo primitivas válidas', () => {
    const validas = new Set<string>(HAPTIC_PRIMITIVES);
    for (const gesto of Object.values(HAPTIC_GESTURES)) {
      for (const primitiva of gesto) {
        expect(validas.has(primitiva)).toBe(true);
      }
    }
    expect(HAPTIC_GESTURES.lanzarDados).toContain('spin');
  });
});
