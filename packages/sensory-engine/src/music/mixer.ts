import type { AudioContextLike, GainNodeLike } from '../audio/contracts.js';
import type { AudioGraph } from '../audio/graph.js';
import { rampParam, setParam } from '../audio/params.js';
import { effectiveStemGain } from './stems.js';
import type { FestivalProfile, StemId } from './types.js';
import { STEM_IDS } from './types.js';

/** Mezcla de los ocho stems: un solo punto de salida y crossfades cortos. */
export class StemMixer {
  private readonly context: AudioContextLike;
  private readonly stems = new Map<StemId, GainNodeLike>();
  private readonly output: GainNodeLike;
  private volume: number;
  private muted: boolean;

  constructor(context: AudioContextLike, graph: AudioGraph, volume = 1, muted = false) {
    this.context = context;
    this.volume = volume;
    this.muted = muted;
    this.output = context.createGain();
    this.output.gain.value = muted ? 0 : volume;
    this.output.connect(graph.bus('music'));
  }

  ensureStems(): void {
    if (this.stems.size > 0) return;
    for (const stem of STEM_IDS) {
      const gain = this.context.createGain();
      gain.gain.value = 0.0001;
      gain.connect(this.output);
      this.stems.set(stem, gain);
    }
  }

  node(stem: StemId): GainNodeLike | undefined {
    return this.stems.get(stem);
  }

  applyLevels(tension: number, profile: FestivalProfile, fadeSeconds: number): void {
    this.ensureStems();
    const time = this.context.currentTime;
    for (const [stem, gain] of this.stems) {
      const target = effectiveStemGain(stem, tension, profile);
      if (fadeSeconds <= 0) setParam(gain.gain, target, time);
      else rampParam(gain.gain, target, time, fadeSeconds);
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    rampParam(this.output.gain, this.muted ? 0 : this.volume, this.context.currentTime, 0.12);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    rampParam(this.output.gain, muted ? 0 : this.volume, this.context.currentTime, 0.16);
  }

  dispose(): void {
    for (const gain of this.stems.values()) {
      try {
        gain.disconnect();
      } catch {
        // Nodo ya liberado.
      }
    }
    this.stems.clear();
    try {
      this.output.disconnect();
    } catch {
      // Salida ya liberada.
    }
  }
}
