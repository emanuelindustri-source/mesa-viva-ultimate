import { clamp } from '../math/vec3.js';

export interface PointerSample {
  readonly x: number;
  readonly y: number;
  readonly timeMs: number;
}

export interface GestureVelocity {
  readonly x: number;
  readonly y: number;
}

export interface GestureEndResult {
  readonly dragged: boolean;
  readonly velocity: GestureVelocity;
  readonly start: PointerSample;
  readonly end: PointerSample;
}

export interface DragGestureOptions {
  readonly thresholdPx?: number;
  readonly sampleWindow?: number;
}

/** Máquina de estados pura para arrastre táctil/ratón con velocidad estable. */
export class DragGesture {
  private readonly threshold: number;
  private readonly windowSize: number;
  private readonly samples: PointerSample[] = [];
  private startSample: PointerSample | null = null;
  private lastSample: PointerSample | null = null;
  private active = false;
  private moved = false;

  constructor(options: DragGestureOptions = {}) {
    this.threshold = Math.max(1, options.thresholdPx ?? 6);
    this.windowSize = clamp(Math.round(options.sampleWindow ?? 5), 2, 12);
  }

  get isActive(): boolean {
    return this.active;
  }

  get hasMoved(): boolean {
    return this.moved;
  }

  begin(sample: PointerSample): void {
    this.active = true;
    this.moved = false;
    this.startSample = sample;
    this.lastSample = sample;
    this.samples.length = 0;
    this.samples.push(sample);
  }

  move(sample: PointerSample): boolean {
    if (!this.active || this.startSample === null) return false;
    this.lastSample = sample;
    this.samples.push(sample);
    if (this.samples.length > this.windowSize) this.samples.shift();
    if (!this.moved) {
      const distance = Math.hypot(sample.x - this.startSample.x, sample.y - this.startSample.y);
      this.moved = distance >= this.threshold;
    }
    return this.moved;
  }

  velocity(): GestureVelocity {
    const last = this.lastSample;
    const first = this.samples[0];
    if (last === null || first === undefined || this.samples.length < 2) return { x: 0, y: 0 };
    const dt = Math.max(1, last.timeMs - first.timeMs) / 1000;
    return {
      x: clamp((last.x - first.x) / dt, -6000, 6000),
      y: clamp((last.y - first.y) / dt, -6000, 6000),
    };
  }

  end(sample: PointerSample): GestureEndResult | null {
    if (!this.active || this.startSample === null) return null;
    this.move(sample);
    const result: GestureEndResult = {
      dragged: this.moved,
      velocity: this.velocity(),
      start: this.startSample,
      end: this.lastSample ?? sample,
    };
    this.active = false;
    this.startSample = null;
    this.lastSample = null;
    this.samples.length = 0;
    return result;
  }

  cancel(): void {
    this.active = false;
    this.moved = false;
    this.startSample = null;
    this.lastSample = null;
    this.samples.length = 0;
  }
}
