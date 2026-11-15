import { dampFactor } from '../math/easing.js';
import { clamp } from '../math/vec3.js';
import type { CameraPreset } from './presets.js';
import type { Projector } from './projector.js';

export interface CameraRigOptions {
  readonly preset: CameraPreset;
  readonly width: number;
  readonly height: number;
  readonly reducedMotion?: boolean;
}

/**
 * Estado vivo de la cámara: inclinación por giroscopio, paralaje, zoom y
 * sacudida breve. No toca PixiJS para poder probarse sin GPU.
 */
export class CameraRig {
  private preset: CameraPreset;
  private width: number;
  private height: number;
  private reducedMotion: boolean;
  private tiltTarget = 0;
  private yawTarget = 0;
  private tiltOffset = 0;
  private yawOffset = 0;
  private parallaxTargetX = 0;
  private parallaxTargetY = 0;
  private parallaxX = 0;
  private parallaxY = 0;
  private shakeAmplitude = 0;
  private shakeTime = 0;

  constructor(options: CameraRigOptions) {
    this.preset = options.preset;
    this.width = Math.max(1, options.width);
    this.height = Math.max(1, options.height);
    this.reducedMotion = options.reducedMotion ?? false;
  }

  resize(width: number, height: number, preset: CameraPreset = this.preset): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.preset = preset;
  }

  setPreset(preset: CameraPreset): void {
    this.preset = preset;
  }

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
    if (reduced) this.reset();
  }

  /** roll/pitch normalizados en [-1, 1] procedentes del sensor de movimiento. */
  setGyro(roll: number, pitch: number): void {
    if (this.reducedMotion) return;
    const sensitivity = this.preset.parallax;
    this.tiltTarget = clamp(pitch, -1, 1) * 3.5;
    this.yawTarget = clamp(roll, -1, 1) * 2.5;
    this.parallaxTargetX = clamp(roll, -1, 1) * this.width * 0.012 * sensitivity;
    this.parallaxTargetY = clamp(pitch, -1, 1) * this.height * 0.008 * sensitivity;
  }

  /** Paralaje por puntero/ratón, independiente del giroscopio. */
  setPointer(normalizedX: number, normalizedY: number): void {
    if (this.reducedMotion) return;
    const sensitivity = this.preset.parallax;
    this.parallaxTargetX = clamp(normalizedX, -1, 1) * this.width * 0.008 * sensitivity;
    this.parallaxTargetY = clamp(normalizedY, -1, 1) * this.height * 0.006 * sensitivity;
  }

  shake(intensity = 1): void {
    if (this.reducedMotion) return;
    this.shakeAmplitude = Math.max(this.shakeAmplitude, clamp(intensity, 0, 1) * 14);
  }

  reset(): void {
    this.tiltTarget = 0;
    this.yawTarget = 0;
    this.tiltOffset = 0;
    this.yawOffset = 0;
    this.parallaxTargetX = 0;
    this.parallaxTargetY = 0;
    this.parallaxX = 0;
    this.parallaxY = 0;
    this.shakeAmplitude = 0;
    this.shakeTime = 0;
  }

  /** Avanza el suavizado. Devuelve true si el estado visible cambió. */
  update(dtSeconds: number): boolean {
    const dt = clamp(dtSeconds, 0, 0.1);
    const factor = dampFactor(0.1, dt);
    const previous = this.tiltOffset + this.yawOffset + this.parallaxX + this.parallaxY + this.shakeAmplitude;
    this.tiltOffset += (this.tiltTarget - this.tiltOffset) * factor;
    this.yawOffset += (this.yawTarget - this.yawOffset) * factor;
    this.parallaxX += (this.parallaxTargetX - this.parallaxX) * factor;
    this.parallaxY += (this.parallaxTargetY - this.parallaxY) * factor;
    this.shakeAmplitude *= 2 ** (-dt / 0.16);
    if (this.shakeAmplitude < 0.05) this.shakeAmplitude = 0;
    this.shakeTime += dt;
    const current = this.tiltOffset + this.yawOffset + this.parallaxX + this.parallaxY + this.shakeAmplitude;
    return Math.abs(current - previous) > 0.0005;
  }

  applyTo(projector: Projector): void {
    const shakeX = this.shakeAmplitude === 0 ? 0 : Math.sin(this.shakeTime * 57) * this.shakeAmplitude;
    const shakeY = this.shakeAmplitude === 0 ? 0 : Math.cos(this.shakeTime * 43) * this.shakeAmplitude * 0.6;
    projector.setPose(
      this.preset.tiltDeg + this.tiltOffset,
      this.preset.yawDeg + this.yawOffset,
      this.preset.zoom,
    );
    projector.setParallax(this.parallaxX + shakeX, this.parallaxY + shakeY);
  }

  get state(): {
    readonly tilt: number;
    readonly yaw: number;
    readonly parallaxX: number;
    readonly parallaxY: number;
    readonly shaking: boolean;
  } {
    return {
      tilt: this.tiltOffset,
      yaw: this.yawOffset,
      parallaxX: this.parallaxX,
      parallaxY: this.parallaxY,
      shaking: this.shakeAmplitude > 0,
    };
  }

  get parallaxOffsetX(): number {
    return this.parallaxX;
  }

  get parallaxOffsetY(): number {
    return this.parallaxY;
  }
}
