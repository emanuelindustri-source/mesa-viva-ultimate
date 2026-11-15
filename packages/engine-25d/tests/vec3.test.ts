import { describe, expect, it } from 'vitest';
import { clamp, lerpVec3, ZERO_VEC3 } from '../src/math/vec3.js';

describe('matemáticas del motor 2.5D', () => {
  it('limita valores al rango indicado', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(4, 0, 10)).toBe(4);
    expect(clamp(42, 0, 10)).toBe(10);
    expect(() => clamp(1, 5, 2)).toThrow();
  });

  it('interpola vectores y acota el factor a [0, 1]', () => {
    const destino = { x: 10, y: 20, z: 5 };
    expect(lerpVec3(ZERO_VEC3, destino, 0.5)).toEqual({ x: 5, y: 10, z: 2.5 });
    expect(lerpVec3(ZERO_VEC3, destino, 2)).toEqual(destino);
    expect(lerpVec3(ZERO_VEC3, destino, -1)).toEqual(ZERO_VEC3);
  });
});
