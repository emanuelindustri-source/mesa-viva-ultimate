import { type EffectDefinition, type EffectId, effectDefinition } from './effect-sounds.js';
import type { SpatialPoint } from './params.js';
import type { AudioRuntime } from './runtime.js';
import type { SpatialAudioEngine, SpatialMode } from './spatial.js';
import { SynthKit, type SynthVoice } from './synth.js';

export interface EffectPlayOptions {
  readonly position?: SpatialPoint | null;
  readonly sourceId?: string | null;
  readonly volume?: number;
  readonly delaySeconds?: number;
}

export interface EffectPlayback {
  readonly id: EffectId;
  readonly startedAt: number;
  readonly endsAt: number;
  readonly mode: SpatialMode;
  readonly voices: number;
  stop(): void;
}

export interface EffectStats {
  readonly active: number;
  readonly activeVoices: number;
  readonly hrtf: number;
  readonly stereo: number;
}

/**
 * Reproductor de efectos procedurales con salida espacial y pooling de voces.
 * Cada disparo devuelve un control para cortarlo al cambiar de escena.
 */
export class SpatialEffectPlayer {
  private readonly runtime: AudioRuntime;
  private readonly spatial: SpatialAudioEngine;
  private readonly playbacks = new Set<EffectPlayback & { dispose(): void }>();
  private readonly seed: number;
  private kit: SynthKit | null = null;
  private disposed = false;

  constructor(runtime: AudioRuntime, spatial: SpatialAudioEngine, seed = 7) {
    this.runtime = runtime;
    this.spatial = spatial;
    this.seed = seed;
  }

  get stats(): EffectStats {
    let voices = 0;
    let hrtf = 0;
    let stereo = 0;
    for (const playback of this.playbacks) {
      voices += playback.voices;
      if (playback.mode === 'hrtf') hrtf += 1;
      if (playback.mode === 'estereo') stereo += 1;
    }
    return { active: this.playbacks.size, activeVoices: voices, hrtf, stereo };
  }

  play(id: EffectId, options: EffectPlayOptions = {}): EffectPlayback | null {
    if (this.disposed) return null;
    const context = this.runtime.context;
    if (context === null) return null;
    this.prune();
    const definition: EffectDefinition = effectDefinition(id);
    const spatialPosition = definition.spatial ? options.position ?? null : null;
    const output = this.spatial.createOutput({
      position: spatialPosition,
      sourceId: definition.spatial ? options.sourceId ?? null : null,
      volume: options.volume ?? 1,
      bus: definition.bus,
    });
    if (output === null) return null;
    try {
      if (this.kit === null) this.kit = new SynthKit(context, this.seed);
      const when = context.currentTime + Math.max(0, options.delaySeconds ?? 0);
      const voices: readonly SynthVoice[] = definition.synthesize(this.kit, output.input, {
        when,
        volume: Math.min(1.4, Math.max(0, options.volume ?? 1)),
      });
      let stopped = false;
      const playback = {
        id,
        startedAt: when,
        endsAt: when + definition.durationMs / 1000,
        mode: output.mode,
        voices: voices.length,
        stop: () => {
          if (stopped) return;
          stopped = true;
          for (const voice of voices) voice.stop();
          output.dispose();
          this.playbacks.delete(playback);
        },
        dispose: () => {
          if (stopped) return;
          stopped = true;
          for (const voice of voices) voice.stop();
          output.dispose();
        },
      };
      this.playbacks.add(playback);
      return playback;
    } catch {
      output.dispose();
      return null;
    }
  }

  stopAll(): void {
    for (const playback of [...this.playbacks]) playback.dispose();
    this.playbacks.clear();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stopAll();
    this.kit = null;
  }

  private prune(): void {
    const now = this.runtime.context?.currentTime ?? 0;
    for (const playback of [...this.playbacks]) {
      if (playback.endsAt + 0.1 <= now) {
        playback.dispose();
        this.playbacks.delete(playback);
      }
    }
  }
}

export type { EffectDefinition, EffectId };
