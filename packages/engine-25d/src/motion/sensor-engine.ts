import { FaceDownDetector, ShakeDetector } from './gestures.js';
import { TiltSmoother } from './tilt.js';
import {
  DEFAULT_MOTION_CONFIG,
  type MotionConfig,
  type MotionFrame,
  type MotionPermission,
  type MotionSample,
  type MotionSource,
  type MotionStatus,
  type TiltReading,
} from './types.js';

export interface MotionEngineOptions {
  readonly config?: MotionConfig;
}

type Listener<T> = (value: T) => void;

/**
 * Orquesta giroscopio, acelerómetro y gestos. Nunca lanza errores hacia la
 * interfaz: si no hay sensores, la mesa sigue funcionando con ratón y D-pad.
 */
export class MotionSensorEngine {
  private readonly source: MotionSource;
  private readonly config: MotionConfig;
  private readonly smoother: TiltSmoother;
  private readonly shakeDetector: ShakeDetector;
  private readonly faceDownDetector: FaceDownDetector;
  private readonly tiltListeners = new Set<Listener<TiltReading>>();
  private readonly shakeListeners = new Set<Listener<number>>();
  private readonly faceDownListeners = new Set<Listener<boolean>>();
  private readonly statusListeners = new Set<Listener<MotionStatus>>();
  private unsubscribe: (() => void) | null = null;
  private status: MotionStatus;
  private wasFaceDown = false;
  private started = false;
  private sampleCount = 0;
  private watchdog: ReturnType<typeof setTimeout> | null = null;

  constructor(source: MotionSource, options: MotionEngineOptions = {}) {
    this.source = source;
    this.config = options.config ?? DEFAULT_MOTION_CONFIG;
    this.smoother = new TiltSmoother(this.config);
    this.shakeDetector = new ShakeDetector(this.config);
    this.faceDownDetector = new FaceDownDetector(this.config);
    this.status = {
      available: source.isAvailable(),
      permission: source.isAvailable() ? 'prompt' : 'unsupported',
      reason: source.isAvailable() ? 'Sensores listos para iniciar' : 'Dispositivo sin sensores de movimiento',
    };
  }

  get currentStatus(): MotionStatus {
    return this.status;
  }

  get tilt(): TiltReading {
    return this.smoother.value;
  }

  async start(): Promise<MotionStatus> {
    if (this.started) return this.status;
    if (!this.source.isAvailable()) {
      this.updateStatus(false, 'unsupported', 'Dispositivo sin sensores: modo ratón o D-pad');
      return this.status;
    }
    let permission: MotionPermission = 'granted';
    try {
      permission = await this.source.requestPermission();
    } catch {
      permission = 'denied';
    }
    if (permission === 'denied' || permission === 'unsupported') {
      this.updateStatus(false, permission, 'Permiso de sensores no concedido');
      return this.status;
    }
    try {
      this.unsubscribe = this.source.subscribe((sample) => this.ingest(sample));
      this.started = true;
      this.updateStatus(true, permission, 'Sensores activos');
    } catch {
      this.updateStatus(false, 'denied', 'Los sensores no pudieron iniciarse');
    }
    return this.status;
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.started = false;
    if (this.watchdog !== null) {
      clearTimeout(this.watchdog);
      this.watchdog = null;
    }
    this.smoother.reset();
    this.shakeDetector.reset();
    this.faceDownDetector.reset();
    this.wasFaceDown = false;
  }

  /**
   * Si no llega ninguna muestra en el plazo, apaga los sensores en silencio.
   * Cubre PC, laptops y televisores que exponen la API pero no tienen hardware.
   */
  armWatchdog(timeoutMs = 1800): void {
    if (!this.status.available) return;
    if (this.watchdog !== null) clearTimeout(this.watchdog);
    const initial = this.sampleCount;
    this.watchdog = setTimeout(() => {
      this.watchdog = null;
      if (this.sampleCount === initial) {
        this.stop();
        this.updateStatus(false, 'unsupported', 'Sin datos de sensores: se usa ratón o D-pad');
      }
    }, Math.max(200, timeoutMs));
  }

  /** Procesa una muestra; separado de `start` para pruebas deterministas. */
  ingest(sample: MotionSample): MotionFrame {
    this.sampleCount += 1;
    const tilt = this.smoother.update(sample);
    const shake = this.shakeDetector.push(sample);
    const faceDown = this.faceDownDetector.push(sample);
    for (const listener of this.tiltListeners) listener(tilt);
    if (shake.shake) {
      for (const listener of this.shakeListeners) listener(shake.intensity);
    }
    if (faceDown.isDown !== this.wasFaceDown) {
      this.wasFaceDown = faceDown.isDown;
      for (const listener of this.faceDownListeners) listener(faceDown.isDown);
    }
    return { tilt, shake: shake.shake, shakeIntensity: shake.intensity, faceDown: faceDown.isDown };
  }

  onTilt(listener: Listener<TiltReading>): () => void {
    this.tiltListeners.add(listener);
    return () => this.tiltListeners.delete(listener);
  }

  onShake(listener: Listener<number>): () => void {
    this.shakeListeners.add(listener);
    return () => this.shakeListeners.delete(listener);
  }

  onFaceDown(listener: Listener<boolean>): () => void {
    this.faceDownListeners.add(listener);
    return () => this.faceDownListeners.delete(listener);
  }

  onStatus(listener: Listener<MotionStatus>): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  dispose(): void {
    this.stop();
    this.tiltListeners.clear();
    this.shakeListeners.clear();
    this.faceDownListeners.clear();
    this.statusListeners.clear();
  }

  private updateStatus(available: boolean, permission: MotionPermission, reason: string): void {
    this.status = { available, permission, reason };
    for (const listener of this.statusListeners) listener(this.status);
  }
}
