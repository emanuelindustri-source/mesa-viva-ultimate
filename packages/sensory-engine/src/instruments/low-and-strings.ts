import type { AudioNodeLike } from '../audio/contracts.js';
import type { SynthKit } from '../audio/synth.js';
import { midiHz } from '../vocal/formants.js';
import { compositeVoice } from './composite.js';
import type { InstrumentNote, InstrumentVoice } from './types.js';

/** Contrabajo cálido, con cuerpo saw y sub para el canal LFE. */
export class DoubleBassSynth {
  private readonly kit: SynthKit;

  constructor(kit: SynthKit) {
    this.kit = kit;
  }

  play(note: InstrumentNote, destination: AudioNodeLike): InstrumentVoice {
    const when = Math.max(0, note.when);
    const frequency = midiHz(note.midi);
    const voices = [
      this.kit.tone({ when, frequency, duration: note.duration, type: 'sawtooth', volume: 0.19 * note.velocity, destination, attack: 0.025, release: note.duration, filterHz: 118, detune: 0 }),
      this.kit.tone({ when, frequency, duration: note.duration, type: 'sine', volume: 0.12 * note.velocity, destination, attack: 0.04, release: note.duration, filterHz: 90, detune: 0 }),
      this.kit.tone({ when, frequency: frequency * 2, duration: note.duration * 0.7, type: 'triangle', volume: 0.035 * note.velocity, destination, attack: 0.01, release: note.duration * 0.7, filterHz: 240 }),
    ];
    return compositeVoice('bass', voices, when + note.duration + 0.15);
  }
}

/** Marimba orgánica de parciales inarmónicos y caída rápida. */
export class MarimbaSynth {
  private readonly kit: SynthKit;

  constructor(kit: SynthKit) {
    this.kit = kit;
  }

  play(note: InstrumentNote, destination: AudioNodeLike): InstrumentVoice {
    const when = Math.max(0, note.when);
    const frequency = midiHz(note.midi);
    const partials = [
      { ratio: 1, volume: 0.14, scale: 1, type: 'sine' },
      { ratio: 3.9, volume: 0.045, scale: 0.28, type: 'sine' },
      { ratio: 9.2, volume: 0.018, scale: 0.12, type: 'triangle' },
    ] as const;
    const voices = partials.map((partial) => this.kit.tone({
      when,
      frequency: frequency * partial.ratio,
      duration: note.duration * partial.scale,
      type: partial.type,
      volume: partial.volume * note.velocity,
      destination,
      attack: 0.002,
      release: note.duration * partial.scale,
      filterHz: 5200,
    }));
    return compositeVoice('marimba', voices, when + note.duration + 0.1);
  }
}

/** Cuerdas suaves en capas detunadas para los canales traseros y la sala. */
export class StringsSynth {
  private readonly kit: SynthKit;

  constructor(kit: SynthKit) {
    this.kit = kit;
  }

  play(note: InstrumentNote, destination: AudioNodeLike): InstrumentVoice {
    const when = Math.max(0, note.when);
    const frequency = midiHz(note.midi);
    const voices = [-7, 0, 7].map((detune) => this.kit.tone({
      when,
      frequency,
      duration: note.duration,
      type: 'sawtooth',
      volume: 0.032 * note.velocity,
      destination,
      attack: 0.32,
      release: note.duration * 0.95,
      filterHz: 1750,
      detune,
    }));
    return compositeVoice('strings', voices, when + note.duration + 0.3);
  }
}
