import type { SynthVoice } from '../audio/synth.js';
import type { InstrumentName, InstrumentVoice } from './types.js';

export function compositeVoice(
  instrument: InstrumentName,
  voices: readonly SynthVoice[],
  endsAt: number,
): InstrumentVoice {
  return {
    instrument,
    endsAt,
    stop: (when?: number) => {
      for (const voice of voices) voice.stop(when);
    },
  };
}
