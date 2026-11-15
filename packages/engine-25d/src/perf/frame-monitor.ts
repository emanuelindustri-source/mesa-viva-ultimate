export interface FrameExtra {
  readonly drawCalls?: number;
  readonly triangles?: number;
  readonly memoryBytes?: number;
}

export interface FrameSummary {
  readonly samples: number;
  readonly fps: number;
  readonly averageFrameMs: number;
  readonly p95FrameMs: number;
  readonly worstFrameMs: number;
  readonly drawCalls: number;
  readonly peakDrawCalls: number;
  readonly triangles: number;
  readonly memoryMB: number;
}

/** Monitor de rendimiento con ventana circular: no asigna memoria por frame. */
export class FrameMonitor {
  private readonly times: Float32Array;
  private readonly windowSize: number;
  private cursor = 0;
  private count = 0;
  private drawCalls = 0;
  private peakDrawCalls = 0;
  private triangles = 0;
  private memoryBytes = 0;

  constructor(windowSize = 180) {
    this.windowSize = Math.max(8, Math.min(600, Math.round(windowSize)));
    this.times = new Float32Array(this.windowSize);
  }

  record(dtMs: number, extra?: FrameExtra): void {
    const safe = Number.isFinite(dtMs) ? Math.min(1000, Math.max(0.1, dtMs)) : 16.67;
    this.times[this.cursor] = safe;
    this.cursor = (this.cursor + 1) % this.windowSize;
    this.count = Math.min(this.windowSize, this.count + 1);
    if (extra !== undefined) this.note(extra);
  }

  /** Actualiza métricas sin añadir una muestra de tiempo. */
  note(extra: FrameExtra): void {
    if (extra.drawCalls !== undefined) {
      this.drawCalls = Math.max(0, Math.round(extra.drawCalls));
      this.peakDrawCalls = Math.max(this.peakDrawCalls, this.drawCalls);
    }
    if (extra.triangles !== undefined) this.triangles = Math.max(0, Math.round(extra.triangles));
    if (extra.memoryBytes !== undefined) this.memoryBytes = Math.max(0, extra.memoryBytes);
  }

  get fps(): number {
    const average = this.averageFrameMs;
    return average <= 0 ? 0 : 1000 / average;
  }

  get averageFrameMs(): number {
    if (this.count === 0) return 0;
    let total = 0;
    for (let index = 0; index < this.count; index += 1) total += this.times[index] ?? 0;
    return total / this.count;
  }

  percentile(percent: number): number {
    if (this.count === 0) return 0;
    const sorted = Array.from(this.times.subarray(0, this.count)).sort((a, b) => a - b);
    const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((percent / 100) * sorted.length) - 1));
    return sorted[index] ?? 0;
  }

  summary(): FrameSummary {
    return {
      samples: this.count,
      fps: Number(this.fps.toFixed(2)),
      averageFrameMs: Number(this.averageFrameMs.toFixed(2)),
      p95FrameMs: Number(this.percentile(95).toFixed(2)),
      worstFrameMs: Number(this.percentile(100).toFixed(2)),
      drawCalls: this.drawCalls,
      peakDrawCalls: this.peakDrawCalls,
      triangles: this.triangles,
      memoryMB: Number((this.memoryBytes / (1024 * 1024)).toFixed(2)),
    };
  }

  reset(): void {
    this.times.fill(0);
    this.cursor = 0;
    this.count = 0;
    this.drawCalls = 0;
    this.peakDrawCalls = 0;
    this.triangles = 0;
    this.memoryBytes = 0;
  }
}

export interface FrameBudget {
  readonly targetFps: number;
  readonly maxFrameMs: number;
  readonly maxDrawCalls: number;
}

export function frameBudget(targetFps = 120): FrameBudget {
  const fps = Math.max(30, Math.min(240, Math.round(targetFps)));
  return {
    targetFps: fps,
    maxFrameMs: Number((1000 / fps).toFixed(2)),
    maxDrawCalls: fps >= 100 ? 90 : 140,
  };
}

export function meetsBudget(summary: FrameSummary, budget: FrameBudget): boolean {
  return summary.fps >= budget.targetFps * 0.9 && summary.p95FrameMs <= budget.maxFrameMs * 1.35;
}
