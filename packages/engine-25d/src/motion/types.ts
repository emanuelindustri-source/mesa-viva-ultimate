export interface AccelerationSample {
  readonly x: number | null;
  readonly y: number | null;
  readonly z: number | null;
}

export interface RotationRateSample {
  readonly alpha: number | null;
  readonly beta: number | null;
  readonly gamma: number | null;
}

export interface MotionSample {
  readonly alpha: number;
  readonly beta: number;
  readonly gamma: number;
  /** Aceleración con gravedad, en m/s². */
  readonly acceleration: AccelerationSample;
  /** Aceleración sin gravedad cuando el dispositivo la ofrece. */
  readonly linearAcceleration: AccelerationSample | null;
  readonly rotationRate: RotationRateSample | null;
  readonly intervalMs: number;
  readonly timestampMs: number;
}

export type MotionPermission = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface MotionSource {
  readonly kind: 'dom' | 'capacitor' | 'mock';
  isAvailable(): boolean;
  requestPermission(): Promise<MotionPermission>;
  subscribe(handler: (sample: MotionSample) => void): () => void;
}

export interface TiltReading {
  readonly rollDeg: number;
  readonly pitchDeg: number;
  /** Normalizado [-1, 1] para paralaje. */
  readonly x: number;
  readonly y: number;
  readonly magnitude: number;
}

export interface MotionConfig {
  readonly smoothingHalfLifeMs: number;
  readonly deadZoneDeg: number;
  readonly shakeThreshold: number;
  readonly shakeWindowMs: number;
  readonly shakeCooldownMs: number;
  readonly faceDownDelayMs: number;
  readonly faceDownZ: number;
  readonly faceDownTiltDeg: number;
}

export const DEFAULT_MOTION_CONFIG: MotionConfig = {
  smoothingHalfLifeMs: 90,
  deadZoneDeg: 2,
  shakeThreshold: 14,
  shakeWindowMs: 420,
  shakeCooldownMs: 900,
  faceDownDelayMs: 650,
  faceDownZ: -6.5,
  faceDownTiltDeg: 38,
};

export interface MotionFrame {
  readonly tilt: TiltReading;
  readonly shake: boolean;
  readonly shakeIntensity: number;
  readonly faceDown: boolean;
}

export interface MotionStatus {
  readonly available: boolean;
  readonly permission: MotionPermission;
  readonly reason: string;
}
