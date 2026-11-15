import type { FormantSpec, VocalVowel } from './types.js';

/** Formantes aproximados de una voz humana tarareando. */
export const VOCAL_FORMANTS: Readonly<Record<VocalVowel, readonly FormantSpec[]>> = Object.freeze({
  m: [
    { frequency: 250, gain: 1, q: 7 },
    { frequency: 1100, gain: 0.48, q: 10 },
    { frequency: 2200, gain: 0.22, q: 12 },
  ],
  u: [
    { frequency: 320, gain: 0.95, q: 8 },
    { frequency: 800, gain: 0.52, q: 11 },
    { frequency: 2200, gain: 0.2, q: 13 },
  ],
  o: [
    { frequency: 500, gain: 1, q: 7 },
    { frequency: 900, gain: 0.48, q: 9 },
    { frequency: 2400, gain: 0.24, q: 12 },
  ],
});

export function vocalFormants(vowel: VocalVowel): readonly FormantSpec[] {
  return VOCAL_FORMANTS[vowel];
}

export function midiHz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}
