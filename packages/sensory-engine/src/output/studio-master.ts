import type {
  AudioContextLike,
  AudioNodeLike,
  CompressorNodeLike,
  ConvolverNodeLike,
  GainNodeLike,
} from '../audio/contracts.js';
import { rampParam, setParam } from '../audio/params.js';
import { createWoodRoomImpulse, impulseRms } from './room-impulse.js';

export interface StudioMasterOptions {
  readonly volume?: number;
  readonly muted?: boolean;
  readonly seed?: number;
  readonly reverbSeconds?: number;
}

export interface StudioMasterStatus {
  readonly volume: number;
  readonly muted: boolean;
  readonly limiterThresholdDb: number;
  readonly limiterRatio: number;
  readonly reverbSeconds: number;
  readonly reverbRms: number;
}

/**
 * Rack de masterización: entrada suma, limitador brickwall a -1 dBFS, salida
 * controlada y retorno de convolución procedural de sala de madera.
 */
export class StudioMasterBus {
  private readonly context: AudioContextLike;
  readonly input: GainNodeLike;
  readonly reverbSend: GainNodeLike;
  readonly reverbReturn: GainNodeLike;
  readonly limiter: CompressorNodeLike;
  private readonly output: GainNodeLike;
  private readonly convolver: ConvolverNodeLike;
  private readonly reverbRms: number;
  private volume: number;
  private muted: boolean;

  constructor(context: AudioContextLike, destination: AudioNodeLike, options: StudioMasterOptions = {}) {
    this.context = context;
    this.volume = Math.min(1, Math.max(0, options.volume ?? 1));
    this.muted = options.muted ?? false;
    this.input = context.createGain();
    this.input.gain.value = 1;
    this.limiter = context.createDynamicsCompressor();
    this.limiter.threshold.value = -1;
    this.limiter.knee.value = 0;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.002;
    this.limiter.release.value = 0.12;
    this.output = context.createGain();
    setParam(this.output.gain, this.muted ? 0 : this.volume, context.currentTime);
    this.input.connect(this.limiter);
    this.limiter.connect(this.output);
    this.output.connect(destination);
    this.convolver = context.createConvolver();
    this.convolver.buffer = createWoodRoomImpulse(context, options.seed ?? 17, options.reverbSeconds ?? 1.8, 2);
    this.convolver.normalize = false;
    this.reverbRms = impulseRms(this.convolver.buffer);
    this.reverbSend = context.createGain();
    this.reverbSend.gain.value = 0.45;
    this.reverbReturn = context.createGain();
    this.reverbReturn.gain.value = 0.38;
    this.reverbSend.connect(this.convolver);
    this.convolver.connect(this.reverbReturn);
  }

  get status(): StudioMasterStatus {
    return {
      volume: this.volume,
      muted: this.muted,
      limiterThresholdDb: this.limiter.threshold.value,
      limiterRatio: this.limiter.ratio.value,
      reverbSeconds: this.convolver.buffer?.duration ?? 0,
      reverbRms: this.reverbRms,
    };
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    rampParam(this.output.gain, this.muted ? 0 : this.volume, this.context.currentTime, 0.12);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    setParam(this.output.gain, muted ? 0 : this.volume, this.context.currentTime);
  }

  dispose(): void {
    for (const node of [this.input, this.limiter, this.output, this.convolver, this.reverbSend, this.reverbReturn]) {
      try {
        node.disconnect();
      } catch {
        // Nodo ya liberado.
      }
    }
  }
}
