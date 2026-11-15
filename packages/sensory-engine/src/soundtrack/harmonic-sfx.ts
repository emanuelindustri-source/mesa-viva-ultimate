import type { AudioContextLike, AudioNodeLike } from '../audio/contracts.js';
import { SynthKit, type SynthVoice } from '../audio/synth.js';
import { midiForDegree, nearestChordMidi } from '../composer/harmony.js';
import type { FestivalProfile } from '../music/types.js';
import { midiHz } from '../vocal/formants.js';

export type HarmonicSfxKind = 'chime' | 'sparkle' | 'coin' | 'impact';

export interface HarmonicSfxPlayback {
  readonly kind: HarmonicSfxKind;
  readonly midi: number;
  readonly frequency: number;
  readonly voice: SynthVoice;
}

export function tuneSfxMidi(baseMidi: number, profile: FestivalProfile, degrees: readonly number[]): number {
  return nearestChordMidi(baseMidi, profile, degrees);
}

/** SFX de interfaz y mesa que siempre caen en una nota del acorde activo. */
export class HarmonicSfxPlayer {
  private readonly kit: SynthKit;

  constructor(context: AudioContextLike, seed = 23) {
    this.kit = new SynthKit(context, seed);
  }

  play(
    kind: HarmonicSfxKind,
    baseMidi: number,
    profile: FestivalProfile,
    degrees: readonly number[],
    destination: AudioNodeLike,
    when = 0,
  ): HarmonicSfxPlayback {
    const midi = tuneSfxMidi(baseMidi, profile, degrees);
    const frequency = midiHz(midi);
    const at = Math.max(0, when);
    if (kind === 'sparkle') {
      const voice = this.kit.tone({ when: at, frequency, duration: 0.42, type: 'triangle', volume: 0.08, destination, filterHz: 5200, release: 0.38 });
      this.kit.tone({ when: at + 0.06, frequency: midiHz(midi + 12), duration: 0.32, type: 'sine', volume: 0.035, destination, release: 0.3 });
      return { kind, midi, frequency, voice };
    }
    if (kind === 'coin') {
      const voice = this.kit.tone({ when: at, frequency, duration: 0.12, type: 'square', volume: 0.06, destination, filterHz: 4200 });
      this.kit.tone({ when: at + 0.08, frequency: midiHz(midi + 7), duration: 0.18, type: 'square', volume: 0.05, destination, filterHz: 4200 });
      return { kind, midi, frequency, voice };
    }
    if (kind === 'impact') {
      const voice = this.kit.tone({ when: at, frequency: midiHz(midi - 12), glideTo: frequency * 0.5, duration: 0.3, type: 'sine', volume: 0.16, destination, release: 0.28 });
      return { kind, midi, frequency, voice };
    }
    const voice = this.kit.tone({ when: at, frequency, duration: 0.5, type: 'sine', volume: 0.09, destination, filterHz: 3600, release: 0.45 });
    return { kind, midi, frequency, voice };
  }
}

export function chordToneMidis(profile: FestivalProfile, degrees: readonly number[], octave = 4): readonly number[] {
  return degrees.map((degree) => midiForDegree(profile, degree, octave));
}
