import type { CameraRig } from '../../camera/camera-rig.js';
import type { MotionSensorEngine } from '../../motion/sensor-engine.js';
import type { MotionStatus } from '../../motion/types.js';

export interface StageMotionOptions {
  readonly engine: MotionSensorEngine;
  readonly camera: CameraRig;
  readonly canvas: HTMLCanvasElement;
  readonly reducedMotion: boolean;
  readonly autoStart?: boolean;
  readonly onShake?: (intensity: number) => void;
  readonly onFaceDown?: (down: boolean) => void;
  readonly onStatus?: (status: MotionStatus) => void;
}

/**
 * Une sensores, cámara y puntero. Si no hay hardware, el watchdog apaga el
 * motor y la mesa queda 100% usable con ratón, teclado o D-pad.
 */
export class StageMotionBinding {
  private readonly options: StageMotionOptions;
  private readonly unsubscribe: readonly (() => void)[];
  private started = false;

  constructor(options: StageMotionOptions) {
    this.options = options;
    const { engine, camera } = options;
    this.unsubscribe = [
      engine.onTilt((tilt) => camera.setGyro(tilt.x, tilt.y)),
      engine.onShake((intensity) => {
        camera.shake(intensity);
        options.onShake?.(intensity);
      }),
      engine.onFaceDown((down) => options.onFaceDown?.(down)),
      engine.onStatus((status) => options.onStatus?.(status)),
    ];
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    options.canvas.addEventListener('pointermove', this.onPointerMove, { passive: true });
    options.canvas.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
    if (options.autoStart !== false) void this.start();
  }

  async start(): Promise<MotionStatus> {
    if (this.started) return this.options.engine.currentStatus;
    this.started = true;
    const status = await this.options.engine.start();
    this.options.engine.armWatchdog(1800);
    return status;
  }

  private onPointerMove(event: PointerEvent): void {
    if (this.options.reducedMotion) return;
    const rect = this.options.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    this.options.camera.setPointer(x * 2, y * 2);
  }

  private onPointerLeave(): void {
    this.options.camera.setPointer(0, 0);
  }

  destroy(): void {
    for (const off of this.unsubscribe) off();
    this.options.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.options.canvas.removeEventListener('pointerleave', this.onPointerLeave);
    this.options.engine.dispose();
  }
}
