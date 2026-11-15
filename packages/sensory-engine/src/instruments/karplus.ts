import type { AudioContextLike, AudioNodeLike, AudioScheduledSourceLike, DelayNodeLike, GainNodeLike } from '../audio/contracts.js';
import { createNoiseBuffer } from '../audio/noise.js';
import { envelope, setParam } from '../audio/params.js';
import { clamp } from '../types.js';
import { midiHz } from '../vocal/formants.js';
import { type InstrumentNote, type InstrumentVoice, makeVoice } from './types.js';

export interface KarplusOptions {
  readonly seed?: number;
  readonly brightness?: number;
  readonly damping?: number;
  readonly volume?: number;
}

/** Cuerda pulsada Karplus-Strong: ruido corto, línea de retardo y filtro en bucle. */
export class KarplusSynth {
  private readonly context: AudioContextLike;
  private readonly seed: number;
  private readonly brightness: number;
  private readonly damping: number;
  private readonly volume: number;

  constructor(context: AudioContextLike, options: KarplusOptions = {}) {
    this.context = context;
    this.seed = options.seed ?? 41;
    this.brightness = options.brightness ?? 4200;
    this.damping = options.damping ?? 0.94;
    this.volume = options.volume ?? 0.16;
  }

  play(note: InstrumentNote, destination: AudioNodeLike): InstrumentVoice {
    const when = Math.max(this.context.currentTime, note.when);
    const frequency = midiHz(note.midi);
    const delay: DelayNodeLike = this.context.createDelay(0.2);
    delay.delayTime.value = Math.min(0.2, Math.max(0.0004, 1 / frequency));
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = this.brightness;
    filter.Q.value = 0.7;
    const feedback: GainNodeLike = this.context.createGain();
    feedback.gain.value = clamp(this.damping, 0.5, 0.995);
    const output: GainNodeLike = this.context.createGain();
    envelope(output.gain, clamp(this.volume * note.velocity, 0.0001, 1), when, 0.004, note.duration * 0.9);
    const noise = this.context.createBufferSource();
    noise.buffer = createNoiseBuffer(this.context, this.seed + note.midi, 0.06);
    noise.connect(delay);
    delay.connect(filter);
    filter.connect(feedback);
    feedback.connect(delay);
    filter.connect(output);
    output.connect(destination);
    noise.start(when);
    noise.stop(when + 0.06);
    setParam(feedback.gain, 0, when + note.duration);
    const sources: AudioScheduledSourceLike[] = [noise];
    const base = makeVoice(this.context, 'guitar', {
      nodes: [noise, delay, filter, feedback, output],
      sources,
    }, when + note.duration + 0.1);
    return {
      ...base,
      stop: (at = this.context.currentTime) => {
        setParam(feedback.gain, 0, this.context.currentTime);
        base.stop(at);
      },
    };
  }
}
