import { describe, expect, it } from 'vitest';
import { pcmMemoryBytes, SENSORY_BUDGET, SensoryBenchmark } from '../src/bench.js';

describe('benchmark sensorial', () => {
  it('resume latencias, pico de voces y presupuesto', () => {
    const bench = new SensoryBenchmark(50);
    bench.note('carta', 0, 12, 3);
    bench.note('dados', 10, 40, 9);
    bench.note('turno', 20, 30, 4);
    const report = bench.report();
    expect(report.count).toBe(3);
    expect(report.averageMs).toBeCloseTo((12 + 30 + 10) / 3, 5);
    expect(report.p95Ms).toBeGreaterThanOrEqual(10);
    expect(report.maxMs).toBe(30);
    expect(report.peakVoices).toBe(9);
    expect(report.withinBudget).toBe(true);
    expect(report.samples).toHaveLength(3);
    bench.reset();
    expect(bench.report().count).toBe(0);
  });

  it('marca incumplimiento cuando la latencia supera el presupuesto', () => {
    const bench = new SensoryBenchmark(50);
    bench.note('lento', 0, 120, 1);
    const report = bench.report();
    expect(report.withinBudget).toBe(false);
    expect(report.maxMs).toBe(120);
    expect(report.p95Ms).toBe(120);
  });

  it('calcula memoria PCM y límites del paquete', () => {
    expect(pcmMemoryBytes(48_000, 1, 2)).toBe(48_000 * 2 * 4);
    expect(pcmMemoryBytes(48_000, -1)).toBe(0);
    expect(SENSORY_BUDGET.maxHrtfVoices).toBe(8);
    expect(SENSORY_BUDGET.maxVoices).toBe(28);
    expect(SENSORY_BUDGET.packageBudgetBytes).toBe(10 * 1024 * 1024);
  });
});
