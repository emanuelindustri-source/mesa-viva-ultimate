import { clamp } from '../math/vec3.js';
import type { MotionConfig, MotionSample, TiltReading } from './types.js';

const MAX_TILT_DEG = 45;

export function clampTilt(value: number): number {
  return clamp(Number.isFinite(value) ? value : 0, -MAX_TILT_DEG, MAX_TILT_DEG);
}

export function tiltReading(rollDeg: number, pitchDeg: number, deadZoneDeg = 2): TiltReading {
  const roll = applyDeadZone(clampTilt(rollDeg), deadZoneDeg);
  const pitch = applyDeadZone(clampTilt(pitchDeg), deadZoneDeg);
  return {
    rollDeg: roll,
    pitchDeg: pitch,
    x: clamp(roll / MAX_TILT_DEG, -1, 1),
    y: clamp(pitch / MAX_TILT_DEG, -1, 1),
    magnitude: Math.hypot(roll, pitch),
  };
}

function applyDeadZone(value: number, deadZone: number): number {
  const zone = Math.max(0, deadZone);
  if (Math.abs(value) <= zone) return 0;
  return value - Math.sign(value) * zone;
}

/**
 * Suavizado exponencial del giroscopio. Mantiene el paralaje estable aunque el
 * sensor entregue muestras irregulares o con ruido.
 */
export class TiltSmoother {
  private current: TiltReading = { rollDeg: 0, pitchDeg: 0, x: 0, y: 0, magnitude: 0 };
  private readonly config: MotionConfig;

  constructor(config: MotionConfig) {
    this.config = config;
  }

  update(sample: MotionSample): TiltReading {
    const target = tiltReading(sample.gamma, sample.beta, this.config.deadZoneDeg);
    const dt = Math.max(1, Math.min(250, sample.intervalMs));
    const factor = 1 - 2 ** (-dt / Math.max(8, this.config.smoothingHalfLifeMs));
    this.current = {
      rollDeg: this.current.rollDeg + (target.rollDeg - this.current.rollDeg) * factor,
      pitchDeg: this.current.pitchDeg + (target.pitchDeg - this.current.pitchDeg) * factor,
      x: this.current.x + (target.x - this.current.x) * factor,
      y: this.current.y + (target.y - this.current.y) * factor,
      magnitude: this.current.magnitude + (target.magnitude - this.current.magnitude) * factor,
    };
    return this.current;
  }

  reset(): void {
    this.current = { rollDeg: 0, pitchDeg: 0, x: 0, y: 0, magnitude: 0 };
  }

  get value(): TiltReading {
    return this.current;
  }
}

/** Orientación estimada para luces y cámara, sin exigir brújula. */
export function tiltToLight(reading: TiltReading): { x: number; y: number } {
  return {
    x: clamp(0.5 + reading.x * 0.35, 0.15, 0.85),
    y: clamp(0.35 + reading.y * 0.25, 0.1, 0.7),
  };
}
