export interface TriggerSample {
  readonly kind: string;
  readonly latencyMs: number;
  readonly voices: number;
  readonly atMs: number;
}

export interface TriggerReport {
  readonly count: number;
  readonly averageMs: number;
  readonly p95Ms: number;
  readonly maxMs: number;
  readonly peakVoices: number;
  readonly withinBudget: boolean;
  readonly samples: readonly TriggerSample[];
}

const DEFAULT_BUDGET_MS = 50;
const MAX_SAMPLES = 240;

export class SensoryBenchmark {
  private readonly budgetMs: number;
  private samples: TriggerSample[] = [];
  private peak = 0;

  constructor(budgetMs = DEFAULT_BUDGET_MS) {
    this.budgetMs = Math.max(1, budgetMs);
  }

  note(kind: string, startedAtMs: number, endedAtMs: number, voices: number): TriggerSample {
    const sample: TriggerSample = {
      kind,
      latencyMs: Math.max(0, endedAtMs - startedAtMs),
      voices: Math.max(0, Math.floor(voices)),
      atMs: endedAtMs,
    };
    this.samples.push(sample);
    if (this.samples.length > MAX_SAMPLES) this.samples.shift();
    this.peak = Math.max(this.peak, sample.voices);
    return sample;
  }

  report(): TriggerReport {
    if (this.samples.length === 0) {
      return { count: 0, averageMs: 0, p95Ms: 0, maxMs: 0, peakVoices: this.peak, withinBudget: true, samples: [] };
    }
    const latencies = this.samples.map((sample) => sample.latencyMs).sort((a, b) => a - b);
    const total = latencies.reduce((sum, value) => sum + value, 0);
    const p95Index = Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95));
    return {
      count: latencies.length,
      averageMs: total / latencies.length,
      p95Ms: latencies[p95Index] ?? 0,
      maxMs: latencies[latencies.length - 1] ?? 0,
      peakVoices: this.peak,
      withinBudget: (latencies[p95Index] ?? 0) <= this.budgetMs,
      samples: [...this.samples],
    };
  }

  reset(): void {
    this.samples = [];
    this.peak = 0;
  }
}

/** Memoria aproximada de un buffer PCM de 32 bits. */
export function pcmMemoryBytes(sampleRate: number, seconds: number, channels = 1): number {
  return Math.max(0, Math.floor(sampleRate * seconds * channels * 4));
}

export const SENSORY_BUDGET = Object.freeze({
  maxHrtfVoices: 8,
  maxVoices: 28,
  triggerBudgetMs: DEFAULT_BUDGET_MS,
  packageBudgetBytes: 10 * 1024 * 1024,
});
