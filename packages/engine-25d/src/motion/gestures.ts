import { clamp } from '../math/vec3.js';
import type { MotionConfig, MotionSample } from './types.js';

interface ShakeEvent {
  readonly time: number;
  readonly magnitude: number;
}

export interface ShakeResult {
  readonly shake: boolean;
  readonly intensity: number;
}

/**
 * Detector de agitado por energía en ventana deslizante. Usa aceleración
 * lineal si existe y, si no, la diferencia entre muestras consecutivas.
 */
export class ShakeDetector {
  private readonly config: MotionConfig;
  private readonly events: ShakeEvent[] = [];
  private lastShake = Number.NEGATIVE_INFINITY;
  private previous: { readonly x: number; readonly y: number; readonly z: number } | null = null;

  constructor(config: MotionConfig) {
    this.config = config;
  }

  push(sample: MotionSample): ShakeResult {
    const magnitude = this.magnitudeFor(sample);
    const time = sample.timestampMs;
    this.events.push({ time, magnitude });
    const cutoff = time - this.config.shakeWindowMs;
    while (this.events.length > 0 && (this.events[0]?.time ?? time) < cutoff) this.events.shift();
    const threshold = Math.max(1, this.config.shakeThreshold);
    let energy = 0;
    for (const event of this.events) energy += event.magnitude * event.magnitude;
    const average = energy / Math.max(1, this.events.length);
    const canShake = time - this.lastShake >= this.config.shakeCooldownMs;
    const shake = canShake && magnitude >= threshold && average >= threshold * threshold * 0.55;
    if (shake) this.lastShake = time;
    return {
      shake,
      intensity: shake ? clamp((magnitude - threshold) / (threshold * 1.5), 0.2, 1) : 0,
    };
  }

  reset(): void {
    this.events.length = 0;
    this.lastShake = Number.NEGATIVE_INFINITY;
    this.previous = null;
  }

  private magnitudeFor(sample: MotionSample): number {
    const linear = sample.linearAcceleration;
    if (linear !== null) {
      return Math.hypot(linear.x ?? 0, linear.y ?? 0, linear.z ?? 0);
    }
    const current = {
      x: sample.acceleration.x ?? 0,
      y: sample.acceleration.y ?? 0,
      z: sample.acceleration.z ?? 0,
    };
    const previous = this.previous;
    this.previous = current;
    if (previous === null) return 0;
    return Math.hypot(current.x - previous.x, current.y - previous.y, current.z - previous.z);
  }
}

export interface FaceDownSnapshot {
  readonly isDown: boolean;
  readonly stableMs: number;
}

/** Detecta el teléfono boca abajo de forma estable, no por un pico aislado. */
export class FaceDownDetector {
  private readonly config: MotionConfig;
  private since: number | null = null;
  private down = false;

  constructor(config: MotionConfig) {
    this.config = config;
  }

  push(sample: MotionSample): FaceDownSnapshot {
    const z = sample.acceleration.z;
    const flat = Math.abs(sample.beta) <= this.config.faceDownTiltDeg &&
      Math.abs(sample.gamma) <= this.config.faceDownTiltDeg;
    const faceDown = z !== null && z <= this.config.faceDownZ && flat;
    if (!faceDown) {
      this.since = null;
      this.down = false;
      return { isDown: false, stableMs: 0 };
    }
    this.since ??= sample.timestampMs;
    const stableMs = Math.max(0, sample.timestampMs - this.since);
    this.down = stableMs >= this.config.faceDownDelayMs;
    return { isDown: this.down, stableMs };
  }

  reset(): void {
    this.since = null;
    this.down = false;
  }
}
