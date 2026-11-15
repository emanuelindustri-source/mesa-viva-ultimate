import type { AudioNodeLike } from '../audio/contracts.js';
import type { SynthKit, SynthVoice } from '../audio/synth.js';
import { midiHz } from '../vocal/formants.js';
import type { InstrumentNote, InstrumentVoice } from './types.js';

interface Partial {
  readonly ratio: number;
  readonly volume: number;
  readonly durationScale: number;
  readonly type: string;
}

const RHODES_PARTIALS: readonly Partial[] = [
  { ratio: 1, volume: 0.16, durationScale: 1, type: 'sine' },
  { ratio: 2.01, volume: 0.06, durationScale: 0.65, type: 'sine' },
  { ratio: 3.98, volume: 0.026, durationScale: 0.4, type: 'triangle' },
  { ratio: 6.97, volume: 0.012, durationScale: 0.22, type: 'sine' },
];

/** Piano eléctrico Rhodes por aditivos cálidos y ataque de campana. */
export class RhodesSynth {
  private readonly kit: SynthKit;

  constructor(kit: SynthKit) {
    this.kit = kit;
  }

  play(note: InstrumentNote, destination: AudioNodeLike): InstrumentVoice {
    const when = Math.max(0, note.when);
    const frequency = midiHz(note.midi);
    const voices: SynthVoice[] = RHODES_PARTIALS.map((partial) => this.kit.tone({
      when,
      frequency: frequency * partial.ratio,
      duration: note.duration * partial.durationScale,
      type: partial.type,
      volume: partial.volume * note.velocity,
      destination,
      attack: 0.006,
      release: note.duration * partial.durationScale,
      filterHz: 3200,
      detune: partial.ratio === 1 ? 0 : 3,
    }));
    return {
      instrument: 'rhodes',
      endsAt: when + note.duration + 0.15,
      stop: (at = when) => {
        for (const voice of voices) voice.stop(at);
      },
    };
  }
}
