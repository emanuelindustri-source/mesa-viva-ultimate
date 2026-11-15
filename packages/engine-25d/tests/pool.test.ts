import { describe, expect, it } from 'vitest';
import { POOL_BUDGETS, poolBudget } from '../src/pool/budgets.js';
import { ObjectPool } from '../src/pool/object-pool.js';

interface Particle {
  alive: boolean;
}

describe('object pooling', () => {
  it('precalienta, reutiliza y contabiliza objetos', () => {
    const pool = new ObjectPool<Particle>({
      initial: 3,
      max: 4,
      create: () => ({ alive: true }),
      reset: (item) => { item.alive = false; },
    });
    expect(pool.stats).toMatchObject({ created: 3, free: 3, inUse: 0 });
    const first = pool.acquire();
    expect(first.alive).toBe(false);
    first.alive = true;
    expect(pool.stats.inUse).toBe(1);
    expect(pool.release(first)).toBe(true);
    expect(first.alive).toBe(false);
    const second = pool.acquire();
    expect(second).toBe(first);
    expect(pool.stats.reuses).toBe(2);
    expect(pool.stats.releases).toBe(1);
    expect(pool.stats.peakInUse).toBe(1);
  });

  it('rechaza dobles liberaciones y respeta el máximo', () => {
    let created = 0;
    const pool = new ObjectPool<{ id: number }>({
      initial: 0,
      max: 2,
      create: () => {
        const item = { id: created };
        created += 1;
        return item;
      },
    });
    const a = pool.acquire();
    const b = pool.acquire();
    expect(pool.release(a)).toBe(true);
    expect(pool.release(a)).toBe(false);
    const reused = pool.acquire();
    expect(reused).toBe(a);
    expect(() => pool.acquire()).toThrow(/límite/);
    expect(pool.stats.rejected).toBe(1);
    expect(pool.stats.inUse).toBe(2);
    pool.release(b);
    pool.release(reused);
    expect(pool.stats.free).toBe(2);
  });

  it('destruye recursos al limpiar el pool', () => {
    let destroyed = 0;
    const pool = new ObjectPool<{ id: number }>({
      initial: 2,
      create: () => ({ id: destroyed }),
      destroy: () => { destroyed += 1; },
    });
    const item = pool.acquire();
    pool.release(item);
    pool.clear();
    expect(destroyed).toBe(2);
    expect(pool.size).toBe(0);
    expect(pool.stats.inUse).toBe(0);
  });

  it('reduce presupuestos en calidad baja', () => {
    expect(poolBudget('particula', 'alta').max).toBeGreaterThan(poolBudget('particula', 'media').max);
    expect(poolBudget('particula', 'media').max).toBeGreaterThan(poolBudget('particula', 'baja').max);
    expect(POOL_BUDGETS.baja.carta.max).toBeLessThan(POOL_BUDGETS.alta.carta.max);
  });
});
