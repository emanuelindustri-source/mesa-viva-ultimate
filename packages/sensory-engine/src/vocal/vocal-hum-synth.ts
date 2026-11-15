import { connectToParam } from '../audio/connect-param.js';
import type {
  AudioContextLike,
  AudioNodeLike,
  BiquadFilterLike,
  GainNodeLike,
  OscillatorNodeLike,
} from '../audio/contracts.js';
import { createNoiseBuffer } from '../audio/noise.js';
import { envelope, setParam } from '../audio/params.js';
import { clamp } from '../types.js';
import { midiHz, vocalFormants } from './formants.js';
import type { VocalNote, VocalVoice } from './types.js';

export interface VocalHumOptions {
  readonly seed?: number;
  readonly vibratoHz?: number;
  readonly breathVolume?: number;
}

/**
 * Voz tarareando expresiva: formantes /m/, /u/, /o/, portamento, respiración
 * suave y vibrato que aparece progresivamente después del ataque.
 */
export class VocalHumSynth {
  private readonly context: AudioContextLike;
  private readonly seed: number;
  private readonly vibratoHz: number;
  private readonly breathVolume: number;

  constructor(context: AudioContextLike, options: VocalHumOptions = {}) {
    this.context = context;
    this.seed = options.seed ?? 31;
    this.vibratoHz = options.vibratoHz ?? 5.2;
    this.breathVolume = options.breathVolume ?? 0.022;
  }

  play(note: VocalNote, destination: AudioNodeLike): VocalVoice {
    const when = Math.max(this.context.currentTime, note.when);
    const duration = Math.max(0.25, note.duration);
    const vowel = note.vowel ?? 'm';
    const targetHz = midiHz(note.midi);
    const fromHz = midiHz(note.previousMidi ?? note.midi - 2);
    const portamento = Math.min(duration * 0.4, note.portamentoSeconds ?? 0.09);
    const velocity = clamp(note.velocity, 0.05, 1);
    const oscillator = this.context.createOscillator();
    oscillator.type = 'sawtooth';
    setParam(oscillator.frequency, fromHz, when);
    oscillator.frequency.exponentialRampToValueAtTime(targetHz, when + portamento);
    const amp = this.context.createGain();
    envelope(amp.gain, velocity * 0.22, when, 0.08, duration * 0.88);
    oscillator.connect(amp);
    amp.connect(destination);
    const formants = vocalFormants(vowel);
    const filters: BiquadFilterLike[] = [];
    for (const spec of formants) {
      const filter = this.context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = spec.frequency;
      filter.Q.value = spec.q;
      const formantGain = this.context.createGain();
      formantGain.gain.value = spec.gain * 0.75;
      oscillator.connect(filter);
      filter.connect(formantGain);
      formantGain.connect(amp);
      filters.push(filter);
    }
    const body = this.context.createGain();
    body.gain.value = 0.035;
    oscillator.connect(body);
    body.connect(amp);
    const lfo = this.context.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = this.vibratoHz;
    const vibratoDepth = this.context.createGain();
    const depth = note.vibratoCents ?? 14;
    vibratoDepth.gain.setValueAtTime(0.001, when);
    vibratoDepth.gain.linearRampToValueAtTime(depth, when + Math.min(0.42, duration * 0.7));
    lfo.connect(vibratoDepth);
    connectToParam(vibratoDepth, oscillator.detune);
    lfo.start(when);
    lfo.stop(when + duration + 0.1);
    const breath = this.buildBreath(note, when, velocity, destination);
    oscillator.start(when);
    oscillator.stop(when + duration + 0.12);
    const nodes: AudioNodeLike[] = [oscillator, amp, body, lfo, vibratoDepth, ...filters, ...breath.nodes];
    let stopped = false;
    return {
      vowel,
      targetHz,
      fromHz,
      formants,
      endsAt: when + duration + 0.15,
      stop: (at = this.context.currentTime) => {
        if (stopped) return;
        stopped = true;
        try {
          oscillator.stop(Math.max(this.context.currentTime, at));
          lfo.stop(Math.max(this.context.currentTime, at));
          breath.source.stop(Math.max(this.context.currentTime, at));
        } catch {
          // Las fuentes ya terminaron.
        }
        for (const node of nodes) {
          try {
            node.disconnect();
          } catch {
            // Nodo liberado.
          }
        }
      },
    };
  }

  private buildBreath(
    note: VocalNote,
    when: number,
    velocity: number,
    destination: AudioNodeLike,
  ): { readonly source: ReturnType<AudioContextLike['createBufferSource']>; readonly nodes: AudioNodeLike[] } {
    const source = this.context.createBufferSource();
    source.buffer = createNoiseBuffer(this.context, this.seed + note.midi, 0.3);
    const high = this.context.createBiquadFilter();
    high.type = 'highpass';
    high.frequency.value = 900;
    high.Q.value = 0.6;
    const gain: GainNodeLike = this.context.createGain();
    envelope(gain.gain, this.breathVolume * velocity, when, 0.02, 0.18);
    source.connect(high);
    high.connect(gain);
    gain.connect(destination);
    source.start(when);
    source.stop(when + 0.24);
    return { source, nodes: [source, high, gain] };
  }
}

export type { OscillatorNodeLike, VocalNote, VocalVoice };
