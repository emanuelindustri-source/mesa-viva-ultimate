import { describe, expect, it } from 'vitest';
import { createRng } from '../src/engine/rng.js';

describe('createRng', () => {
  it('produce la misma secuencia con la misma semilla', () => {
    const a = createRng(20261114);
    const b = createRng(20261114);
    const secuenciaA = Array.from({ length: 20 }, () => a.next());
    const secuenciaB = Array.from({ length: 20 }, () => b.next());
    expect(secuenciaA).toEqual(secuenciaB);
  });

  it('produce secuencias distintas con semillas distintas', () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a.next()).not.toBe(b.next());
  });

  it('genera enteros dentro del rango solicitado', () => {
    const rng = createRng(42);
    for (let i = 0; i < 500; i += 1) {
      const valor = rng.int(6);
      expect(Number.isInteger(valor)).toBe(true);
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThan(6);
    }
  });

  it('elige elementos existentes de una lista', () => {
    const rng = createRng(7);
    const cartas = ['Caída', 'Ronda', 'Patrulla', 'Vigía'] as const;
    for (let i = 0; i < 100; i += 1) {
      expect(cartas).toContain(rng.pick(cartas));
    }
  });

  it('rechaza semillas no finitas y rangos inválidos', () => {
    expect(() => createRng(Number.NaN)).toThrow();
    expect(() => createRng(1).int(0)).toThrow();
    expect(() => createRng(1).pick([])).toThrow();
  });
});
