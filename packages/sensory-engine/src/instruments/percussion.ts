import type { AudioNodeLike } from '../audio/contracts.js';
import type { SynthKit, SynthVoice } from '../audio/synth.js';
import { compositeVoice } from './composite.js';
import type { BeatboxKind, InstrumentVoice, PercussionKind } from './types.js';

/** Percusión latina orgánica: maracas, shaker, cajón, palmas y bombo. */
export class LatinPercussionSynth {
  private readonly kit: SynthKit;

  constructor(kit: SynthKit) {
    this.kit = kit;
  }

  play(kind: PercussionKind, when: number, velocity: number, destination: AudioNodeLike): InstrumentVoice {
    const at = Math.max(0, when);
    const volume = Math.max(0.02, velocity);
    const voices: SynthVoice[] = [];
    if (kind === 'shaker' || kind === 'maracas') {
      voices.push(this.kit.noiseBurst({ when: at, duration: kind === 'shaker' ? 0.045 : 0.07, volume: 0.07 * volume, destination, filterHz: kind === 'shaker' ? 5200 : 3100, filterType: 'bandpass', playbackRate: 1.1 }));
    } else if (kind === 'cajon') {
      voices.push(this.kit.noiseBurst({ when: at, duration: 0.06, volume: 0.09 * volume, destination, filterHz: 420, filterType: 'lowpass' }));
      voices.push(this.kit.tone({ when: at, frequency: 96, glideTo: 58, duration: 0.09, type: 'sine', volume: 0.14 * volume, destination }));
    } else if (kind === 'clap') {
      for (let index = 0; index < 3; index += 1) {
        voices.push(this.kit.noiseBurst({ when: at + index * 0.012, duration: 0.035, volume: 0.075 * volume, destination, filterHz: 1300, filterType: 'bandpass' }));
      }
    } else if (kind === 'kick') {
      voices.push(this.kit.tone({ when: at, frequency: 102, glideTo: 42, duration: 0.18, type: 'sine', volume: 0.2 * volume, destination }));
    } else {
      voices.push(this.kit.noiseBurst({ when: at, duration: 0.035, volume: 0.05 * volume, destination, filterHz: 7600, filterType: 'highpass' }));
    }
    return compositeVoice('percussion', voices, at + 0.24);
  }
}

/** Beatbox rítmico: boca, caja y hi-hat sintetizados sin samples. */
export class BeatboxSynth {
  private readonly kit: SynthKit;

  constructor(kit: SynthKit) {
    this.kit = kit;
  }

  play(kind: BeatboxKind, when: number, velocity: number, destination: AudioNodeLike): InstrumentVoice {
    const at = Math.max(0, when);
    const volume = Math.max(0.02, velocity);
    const voices: SynthVoice[] = [];
    if (kind === 'kick') {
      voices.push(this.kit.tone({ when: at, frequency: 118, glideTo: 46, duration: 0.14, type: 'sine', volume: 0.18 * volume, destination }));
    } else if (kind === 'snare') {
      voices.push(this.kit.noiseBurst({ when: at, duration: 0.09, volume: 0.1 * volume, destination, filterHz: 1900, filterType: 'bandpass' }));
      voices.push(this.kit.tone({ when: at, frequency: 185, glideTo: 140, duration: 0.06, type: 'triangle', volume: 0.06 * volume, destination }));
    } else {
      voices.push(this.kit.noiseBurst({ when: at, duration: 0.028, volume: 0.045 * volume, destination, filterHz: 8200, filterType: 'highpass' }));
    }
    return compositeVoice('beatbox', voices, at + 0.2);
  }
}
