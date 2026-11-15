import type { AudioContextLike, AudioNodeLike, ChannelMergerNodeLike, GainNodeLike, OscillatorNodeLike } from '../audio/contracts.js';
import { rampParam } from '../audio/params.js';

export type BinauralBand = 'theta' | 'alpha' | 'beta';

export interface BinauralBandSpec {
  readonly band: BinauralBand;
  readonly carrierHz: number;
  readonly beatHz: number;
  readonly gain: number;
}

export const BINAURAL_BANDS: readonly BinauralBandSpec[] = Object.freeze([
  { band: 'theta', carrierHz: 180, beatHz: 6, gain: 0.009 },
  { band: 'alpha', carrierHz: 210, beatHz: 10, gain: 0.012 },
  { band: 'beta', carrierHz: 240, beatHz: 18, gain: 0.006 },
]);

/**
 * Capa de ondas binaurales para audífonos: el mismo portador llega a cada oído
 * con una diferencia de pocos hercios. Nivel muy bajo y desactivable.
 */
export class BinauralLayer {
  private readonly context: AudioContextLike;
  private readonly merger: ChannelMergerNodeLike;
  private readonly output: GainNodeLike;
  private readonly left: GainNodeLike;
  private readonly right: GainNodeLike;
  private readonly oscillators: OscillatorNodeLike[] = [];
  private enabled: boolean;
  private intensity: number;

  constructor(context: AudioContextLike, destination: AudioNodeLike, options: { enabled?: boolean; intensity?: number } = {}) {
    this.context = context;
    this.enabled = options.enabled ?? true;
    this.intensity = Math.min(1, Math.max(0, options.intensity ?? 0.7));
    this.merger = context.createChannelMerger(2);
    this.merger.channelInterpretation = 'discrete';
    this.output = context.createGain();
    this.output.gain.value = this.enabled ? this.intensity : 0;
    this.left = context.createGain();
    this.right = context.createGain();
    this.left.connect(this.merger, 0, 0);
    this.right.connect(this.merger, 0, 1);
    this.merger.connect(this.output);
    this.output.connect(destination);
    for (const spec of BINAURAL_BANDS) {
      this.buildBand(spec);
    }
  }

  get bandFrequencies(): Readonly<Record<BinauralBand, readonly [number, number]>> {
    return {
      theta: [180, 186],
      alpha: [210, 220],
      beta: [240, 258],
    };
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    rampParam(this.output.gain, enabled ? this.intensity : 0, this.context.currentTime, 0.8);
  }

  setIntensity(intensity: number): void {
    this.intensity = Math.min(1, Math.max(0, intensity));
    if (this.enabled) rampParam(this.output.gain, this.intensity, this.context.currentTime, 0.4);
  }

  dispose(): void {
    for (const oscillator of this.oscillators) {
      try {
        oscillator.stop(this.context.currentTime);
      } catch {
        // Ya detenido.
      }
      try {
        oscillator.disconnect();
      } catch {
        // Ya desconectado.
      }
    }
    this.oscillators.length = 0;
    for (const node of [this.left, this.right, this.merger, this.output]) {
      try {
        node.disconnect();
      } catch {
        // Nodo ya liberado.
      }
    }
  }

  private buildBand(spec: BinauralBandSpec): void {
    const leftGain = this.context.createGain();
    const rightGain = this.context.createGain();
    leftGain.gain.value = spec.gain;
    rightGain.gain.value = spec.gain;
    leftGain.connect(this.left);
    rightGain.connect(this.right);
    const leftOsc = this.context.createOscillator();
    const rightOsc = this.context.createOscillator();
    leftOsc.type = 'sine';
    rightOsc.type = 'sine';
    leftOsc.frequency.value = spec.carrierHz;
    rightOsc.frequency.value = spec.carrierHz + spec.beatHz;
    leftOsc.connect(leftGain);
    rightOsc.connect(rightGain);
    leftOsc.start();
    rightOsc.start();
    this.oscillators.push(leftOsc, rightOsc);
  }
}
