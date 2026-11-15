import { clamp } from '../types.js';
import type {
  AudioBufferLike,
  AudioContextLike,
  AudioNodeLike,
  AudioScheduledSourceLike,
  GainNodeLike,
  OscillatorNodeLike,
} from './contracts.js';
import { envelope } from './params.js';
import { mulberry32 } from './random.js';

export interface ToneOptions {
  readonly when: number;
  readonly frequency: number;
  readonly duration: number;
  readonly destination: AudioNodeLike;
  readonly type?: string;
  readonly volume?: number;
  readonly detune?: number;
  readonly attack?: number;
  readonly release?: number;
  readonly filterHz?: number;
  readonly filterType?: string;
  readonly glideTo?: number;
}

export interface NoiseOptions {
  readonly when: number;
  readonly duration: number;
  readonly destination: AudioNodeLike;
  readonly volume?: number;
  readonly filterHz?: number;
  readonly filterType?: string;
  readonly playbackRate?: number;
}

export interface SynthVoice {
  readonly source: AudioScheduledSourceLike;
  stop(when?: number): void;
}

/** Banco de síntesis procedural: osciladores, ruido determinista y envolventes. */
export class SynthKit {
  private readonly context: AudioContextLike;
  private readonly random: () => number;
  private noise: AudioBufferLike | null = null;

  constructor(context: AudioContextLike, seed = 1) {
    this.context = context;
    this.random = mulberry32(seed);
  }

  get noiseBuffer(): AudioBufferLike {
    if (this.noise !== null) return this.noise;
    const length = Math.max(1, Math.floor(this.context.sampleRate * 0.75));
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = this.random() * 2 - 1;
    this.noise = buffer;
    return buffer;
  }

  tone(options: ToneOptions): SynthVoice {
    const when = Math.max(this.context.currentTime, options.when);
    const duration = Math.max(0.03, options.duration);
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = options.type ?? 'sine';
    oscillator.frequency.setValueAtTime(Math.max(20, options.frequency), when);
    if (options.glideTo !== undefined) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, options.glideTo), when + duration);
    }
    oscillator.detune.value = options.detune ?? 0;
    envelope(gain.gain, clamp(options.volume ?? 0.2, 0.0001, 1), when, options.attack ?? 0.01, options.release ?? duration);
    return this.connectVoice(oscillator, gain, options, when, duration);
  }

  noiseBurst(options: NoiseOptions): SynthVoice {
    const when = Math.max(this.context.currentTime, options.when);
    const duration = Math.max(0.02, options.duration);
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = this.noiseBuffer;
    source.playbackRate.value = options.playbackRate ?? 1;
    envelope(gain.gain, clamp(options.volume ?? 0.15, 0.0001, 1), when, 0.006, duration);
    return this.connectVoice(source, gain, options, when, duration);
  }

  private connectVoice(
    source: OscillatorNodeLike | ReturnType<AudioContextLike['createBufferSource']>,
    gain: GainNodeLike,
    options: ToneOptions | NoiseOptions,
    when: number,
    duration: number,
  ): SynthVoice {
    const nodes: AudioNodeLike[] = [source, gain];
    if (options.filterHz !== undefined && options.filterHz > 0) {
      const filter = this.context.createBiquadFilter();
      filter.type = options.filterType ?? 'lowpass';
      filter.frequency.value = options.filterHz;
      filter.Q.value = 0.8;
      source.connect(filter);
      filter.connect(gain);
      nodes.push(filter);
    } else {
      source.connect(gain);
    }
    gain.connect(options.destination);
    source.start(when);
    source.stop(when + duration + 0.08);
    source.onended = () => {
      for (const node of nodes) {
        try {
          node.disconnect();
        } catch {
          // La voz ya se liberó.
        }
      }
    };
    let stopped = false;
    return {
      source,
      stop: (at = when) => {
        if (stopped) return;
        stopped = true;
        try {
          source.stop(Math.max(this.context.currentTime, at));
        } catch {
          // Una fuente que nunca arrancó no se puede detener.
        }
      },
    };
  }
}
