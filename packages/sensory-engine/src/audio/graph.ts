import type { AudioContextLike, AudioNodeLike, CompressorNodeLike, GainNodeLike } from './contracts.js';
import { setParam } from './params.js';

export type AudioBusName = 'music' | 'effects' | 'ambience' | 'ui';

export interface AudioGraphOptions {
  readonly masterVolume?: number;
  readonly musicVolume?: number;
  readonly effectsVolume?: number;
  readonly ambienceVolume?: number;
  readonly uiVolume?: number;
  readonly limiterThresholdDb?: number;
}

export interface AudioBusLevels {
  readonly master: number;
  readonly music: number;
  readonly effects: number;
  readonly ambience: number;
  readonly ui: number;
}

/**
 * Mezcladora maestra: cuatro buses, compresor-limitador y salida protegida.
 * Ningún bus conecta directo al destino; todo pasa por el limitador.
 */
export class AudioGraph {
  private readonly context: AudioContextLike;
  private readonly master: GainNodeLike;
  private readonly mix: GainNodeLike;
  private readonly limiter: CompressorNodeLike;
  private readonly gains: Readonly<Record<AudioBusName, GainNodeLike>>;
  private masterLevel: number;
  private muted = false;
  private disposed = false;

  constructor(context: AudioContextLike, options: AudioGraphOptions = {}) {
    this.context = context;
    this.masterLevel = options.masterVolume ?? 0.82;
    this.master = context.createGain();
    this.mix = context.createGain();
    this.limiter = context.createDynamicsCompressor();
    this.limiter.threshold.value = options.limiterThresholdDb ?? -8;
    this.limiter.knee.value = 0;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.003;
    this.limiter.release.value = 0.24;
    this.master.gain.value = this.masterLevel;
    this.mix.gain.value = 0.9;
    this.mix.connect(this.limiter);
    this.limiter.connect(this.master);
    this.master.connect(context.destination);
    this.gains = {
      music: this.makeBus(options.musicVolume ?? 0.55),
      effects: this.makeBus(options.effectsVolume ?? 0.8),
      ambience: this.makeBus(options.ambienceVolume ?? 0.34),
      ui: this.makeBus(options.uiVolume ?? 0.5),
    };
  }

  get buses(): readonly AudioBusName[] {
    return ['music', 'effects', 'ambience', 'ui'];
  }

  get masterNode(): AudioNodeLike {
    return this.master;
  }

  get limiterReduction(): number {
    return this.limiter.reduction;
  }

  get levels(): AudioBusLevels {
    return {
      master: this.muted ? 0 : this.master.gain.value,
      music: this.gains.music.gain.value,
      effects: this.gains.effects.gain.value,
      ambience: this.gains.ambience.gain.value,
      ui: this.gains.ui.gain.value,
    };
  }

  bus(name: AudioBusName): AudioNodeLike {
    return this.gains[name];
  }

  setBusVolume(name: AudioBusName, volume: number, fadeSeconds = 0.12): void {
    const target = Math.min(1, Math.max(0, volume));
    const time = this.context.currentTime;
    const param = this.gains[name].gain;
    if (fadeSeconds <= 0) {
      setParam(param, target, time);
      return;
    }
    try {
      param.cancelScheduledValues(time);
      param.setValueAtTime(param.value, time);
      param.linearRampToValueAtTime(target, time + fadeSeconds);
    } catch {
      param.value = target;
    }
  }

  setMasterVolume(volume: number): void {
    this.masterLevel = Math.min(1, Math.max(0, volume));
    setParam(this.master.gain, this.muted ? 0 : this.masterLevel, this.context.currentTime);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    setParam(this.master.gain, muted ? 0 : this.masterLevel, this.context.currentTime);
  }

  get isMuted(): boolean {
    return this.muted;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const name of this.buses) this.gains[name].disconnect();
    this.mix.disconnect();
    this.limiter.disconnect();
    this.master.disconnect();
  }

  private makeBus(volume: number): GainNodeLike {
    const gain = this.context.createGain();
    gain.gain.value = Math.min(1, Math.max(0, volume));
    gain.connect(this.mix);
    return gain;
  }
}
