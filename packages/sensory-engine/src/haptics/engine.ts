import type { HapticGesture } from '../version.js';
import { createCapacitorHapticsBridge, type NativeHapticBridge } from './capacitor.js';
import { hapticPattern, toVibrationPattern } from './patterns.js';
import type {
  CapacitorHapticsPlugin,
  HapticCapabilities,
  HapticEngineOptions,
  HapticPlayback,
} from './types.js';
import { detectWebVibration } from './web.js';

type CancelFn = (handle: unknown) => void;
type ScheduleFn = (callback: () => void, delayMs: number) => unknown;

function defaultSchedule(callback: () => void, delayMs: number): unknown {
  return setTimeout(callback, Math.max(0, delayMs));
}

function defaultCancel(handle: unknown): void {
  clearTimeout(handle as ReturnType<typeof setTimeout>);
}

/**
 * Háptica de precisión con dos salidas: plugin nativo de Capacitor y
 * `navigator.vibrate`. Si no hay hardware o el usuario lo desactiva, no falla.
 */
export class HapticEngine {
  private readonly native: NativeHapticBridge | null;
  private readonly webVibrate: ((pattern: number | readonly number[]) => boolean) | null;
  private readonly schedule: ScheduleFn;
  private readonly cancel: CancelFn;
  private timers = new Set<unknown>();
  private enabled: boolean;
  private reducedMotion: boolean;
  private silent: boolean;
  private intensity: number;

  constructor(options: HapticEngineOptions = {}) {
    this.native = options.plugin !== undefined && options.plugin !== null
      ? createCapacitorHapticsBridge(options.plugin)
      : null;
    this.webVibrate = options.vibrate ?? (this.native === null ? detectWebVibration() : null);
    this.schedule = options.schedule ?? defaultSchedule;
    this.cancel = options.cancel ?? defaultCancel;
    this.enabled = options.enabled ?? true;
    this.reducedMotion = options.reducedMotion ?? false;
    this.silent = options.silent ?? false;
    this.intensity = Math.min(1, Math.max(0, options.intensity ?? 0.8));
  }

  get capabilities(): HapticCapabilities {
    if (this.native !== null) return { available: true, source: 'capacitor', supportsPatterns: true };
    if (this.webVibrate !== null) return { available: true, source: 'web', supportsPatterns: true };
    return { available: false, source: 'ninguna', supportsPatterns: false };
  }

  get canPlay(): boolean {
    return this.enabled && !this.reducedMotion && !this.silent && this.intensity > 0.01 && this.capabilities.available;
  }

  configure(patch: {
    readonly enabled?: boolean;
    readonly reducedMotion?: boolean;
    readonly silent?: boolean;
    readonly intensity?: number;
  }): void {
    if (patch.enabled !== undefined) this.enabled = patch.enabled;
    if (patch.reducedMotion !== undefined) this.reducedMotion = patch.reducedMotion;
    if (patch.silent !== undefined) this.silent = patch.silent;
    if (patch.intensity !== undefined) this.intensity = Math.min(1, Math.max(0, patch.intensity));
    if (!this.canPlay) this.stop();
  }

  /** Dispara un gesto; devuelve null si la háptica está desactivada. */
  play(gesture: HapticGesture): HapticPlayback | null {
    if (!this.canPlay) return null;
    const pattern = hapticPattern(gesture);
    try {
      if (this.native !== null) {
        this.playNative(gesture);
      } else {
        const accepted = this.webVibrate?.(toVibrationPattern(pattern, this.intensity)) ?? false;
        if (!accepted) return null;
      }
      return { gesture, source: this.capabilities.source, totalMs: pattern.totalMs };
    } catch {
      return null;
    }
  }

  /** Mensaje nativo de sistema para victoria, derrota o aviso. */
  celebrate(kind: 'victoria' | 'derrota' | 'alerta'): HapticPlayback | null {
    if (!this.canPlay || this.native === null) return this.play(kind === 'derrota' ? 'derrota' : 'victoria');
    try {
      this.native.celebrate(kind);
      return { gesture: kind === 'derrota' ? 'derrota' : 'victoria', source: 'capacitor', totalMs: 80 };
    } catch {
      return null;
    }
  }

  stop(): void {
    for (const timer of this.timers) this.cancel(timer);
    this.timers.clear();
    try {
      this.webVibrate?.(0);
    } catch {
      // Ignorar navegadores que rechazan la cancelación.
    }
  }

  dispose(): void {
    this.stop();
  }

  private playNative(gesture: HapticGesture): void {
    const pattern = hapticPattern(gesture);
    let elapsed = 0;
    for (const pulse of pattern.pulses) {
      elapsed += pulse.delayMs;
      const fire = (): void => {
        if (this.canPlay) this.native?.playPulse(pulse, this.intensity);
      };
      if (elapsed === 0) {
        fire();
      } else {
        const handle = this.schedule(() => {
          this.timers.delete(handle);
          fire();
        }, elapsed);
        this.timers.add(handle);
      }
      elapsed += pulse.durationMs;
    }
  }
}

export type { CapacitorHapticsPlugin };
