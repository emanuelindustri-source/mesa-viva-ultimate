import type { AudioEngineState, AudioEngineStatus } from '../types.js';
import { AUDIO_SAMPLE_RATE } from '../version.js';
import type { AudioContextFactory, AudioContextLike } from './contracts.js';
import { AudioGraph, type AudioGraphOptions } from './graph.js';

type AudioContextConstructor = new (options?: {
  readonly sampleRate?: number;
  readonly latencyHint?: 'interactive' | 'balanced' | 'playback';
}) => unknown;

/** Crea el AudioContext real a 48 kHz; el import nunca toca el DOM. */
export function defaultAudioContextFactory(sampleRate = AUDIO_SAMPLE_RATE): AudioContextLike {
  const scope = globalThis as {
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: AudioContextConstructor;
  };
  const Constructor = scope.AudioContext ?? scope.webkitAudioContext;
  if (Constructor === undefined) throw new Error('Web Audio API no disponible');
  const context = new Constructor({ sampleRate, latencyHint: 'interactive' });
  return context as AudioContextLike;
}

export interface AudioRuntimeOptions {
  readonly factory?: AudioContextFactory;
  readonly requestedSampleRate?: number;
  readonly graph?: AudioGraphOptions;
}

/**
 * Ciclo de vida perezoso del audio. Se construye al primer gesto del usuario,
 * se reanuda tras segundo plano y se cierra sin dejar nodos vivos.
 */
export class AudioRuntime {
  private readonly factory: AudioContextFactory;
  private readonly requestedSampleRate: number;
  private readonly graphOptions: AudioGraphOptions;
  private audioGraph: AudioGraph | null = null;
  private ctx: AudioContextLike | null = null;
  private reason = 'El audio espera un gesto del usuario';
  private disposed = false;
  private unavailable = false;

  constructor(options: AudioRuntimeOptions = {}) {
    this.factory = options.factory ?? defaultAudioContextFactory;
    this.requestedSampleRate = options.requestedSampleRate ?? AUDIO_SAMPLE_RATE;
    this.graphOptions = options.graph ?? {};
  }

  get context(): AudioContextLike | null {
    return this.ctx;
  }

  get graph(): AudioGraph | null {
    return this.audioGraph;
  }

  get status(): AudioEngineStatus {
    let state: AudioEngineState = 'sin-iniciar';
    if (this.disposed) state = 'cerrado';
    else if (this.unavailable) state = 'no-disponible';
    else if (this.ctx !== null) {
      state = this.ctx.state === 'running' ? 'activo' : this.ctx.state === 'closed' ? 'cerrado' : 'suspendido';
    }
    return {
      state,
      sampleRate: this.ctx?.sampleRate ?? this.requestedSampleRate,
      requestedSampleRate: this.requestedSampleRate,
      contextTime: this.ctx?.currentTime ?? 0,
      reason: this.reason,
    };
  }

  get isReady(): boolean {
    return !this.disposed && this.ctx !== null && this.audioGraph !== null && this.ctx.state === 'running';
  }

  /** Debe llamarse desde un clic, toque o tecla para vencer el autoplay. */
  async unlock(): Promise<AudioEngineStatus> {
    if (this.disposed) return this.status;
    if (this.ctx === null) {
      try {
        this.ctx = this.factory(this.requestedSampleRate);
        this.audioGraph = new AudioGraph(this.ctx, this.graphOptions);
      } catch (error) {
        this.unavailable = true;
        this.reason = error instanceof Error ? error.message : 'Audio no disponible';
        if (this.ctx !== null) {
          try {
            await this.ctx.close();
          } catch {
            // El contexto nunca llegó a estar operativo.
          }
          this.ctx = null;
        }
        return this.status;
      }
    }
    try {
      await this.ctx.resume();
      this.reason = this.ctx.sampleRate === this.requestedSampleRate
        ? `Audio activo a ${Math.round(this.ctx.sampleRate / 1000)} kHz`
        : `Audio activo a ${Math.round(this.ctx.sampleRate / 1000)} kHz (ajustado por el dispositivo)`;
    } catch {
      this.reason = 'El navegador mantiene el audio suspendido; se reintentará al tocar';
    }
    return this.status;
  }

  async suspend(): Promise<void> {
    if (this.ctx === null || this.ctx.state === 'closed') return;
    try {
      await this.ctx.suspend();
      this.reason = 'Audio en pausa';
    } catch {
      // Segundo plano agresivo: la partida sigue sin audio.
    }
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;
    this.audioGraph?.dispose();
    this.audioGraph = null;
    const context = this.ctx;
    this.ctx = null;
    if (context === null) return;
    try {
      await context.close();
    } catch {
      // Cerrar dos veces no debe romper la salida.
    }
  }
}
