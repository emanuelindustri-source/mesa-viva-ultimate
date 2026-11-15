import { mulberry32, seedFromText } from '../audio/random.js';
import { STEM_DEFINITIONS } from './stems.js';
import type { FestivalProfile, NoteEvent, StemId } from './types.js';
import { STEM_IDS } from './types.js';

export const STEPS_PER_BAR = 16;

type Seed = readonly [step: number, degree: number, durationSteps: number, velocity: number];

const BASE_STEPS: Readonly<Record<StemId, readonly Seed[]>> = Object.freeze({
  pulso: [[0, 0, 1, 0.9], [4, 0, 1, 0.58], [8, 0, 1, 0.82], [12, 0, 1, 0.55]],
  bajo: [[0, 0, 2, 0.8], [6, 2, 2, 0.52], [8, 4, 2, 0.68], [14, 0, 1, 0.5]],
  pad: [[0, 0, 8, 0.55], [8, 4, 8, 0.42]],
  arpegio: [[0, 0, 1, 0.5], [2, 2, 1, 0.4], [4, 4, 1, 0.5], [6, 2, 1, 0.38], [8, 0, 1, 0.5], [10, 4, 1, 0.44], [12, 2, 1, 0.48], [14, 4, 1, 0.38]],
  melodia: [[0, 4, 2, 0.68], [4, 2, 2, 0.52], [8, 0, 4, 0.72], [13, 4, 2, 0.46]],
  campanas: [[2, 7, 2, 0.42], [10, 4, 2, 0.38]],
  coro: [[0, 0, 8, 0.4], [8, 4, 8, 0.34]],
  acento: [[3, 0, 1, 0.6], [11, 4, 1, 0.52], [15, 7, 1, 0.38]],
});

const SPARSE_STEMS: ReadonlySet<StemId> = new Set(['arpegio', 'melodia', 'campanas', 'acento']);

export type BarPattern = readonly (readonly NoteEvent[])[];

export type BarPatterns = Readonly<Record<StemId, BarPattern>>;

function buildStemBar(
  stem: StemId,
  profile: FestivalProfile,
  seed: number,
  bar: number,
): BarPattern {
  const random = mulberry32((seed ^ Math.imul(bar + 1, 2_654_435_761) ^ seedFromText(`${profile.id}:${stem}`)) >>> 0);
  const slots: NoteEvent[][] = Array.from({ length: STEPS_PER_BAR }, () => []);
  const keepChance = 0.58 + profile.density * 0.42;
  for (const [step, degree, durationSteps, velocity] of BASE_STEPS[stem]) {
    if (SPARSE_STEMS.has(stem) && random() > keepChance) continue;
    const octave = STEM_DEFINITIONS[stem].octave;
    slots[step]?.push({
      step,
      degree,
      octave,
      durationSteps,
      velocity: Math.min(1, velocity * (0.9 + profile.density * 0.2)),
    });
  }
  if (profile.density > 0.7 && (stem === 'arpegio' || stem === 'acento') && random() < 0.4) {
    const extra = (Math.floor(random() * 8) * 2 + 1) % STEPS_PER_BAR;
    slots[extra]?.push({ step: extra, degree: Math.floor(random() * profile.scale.length), octave: STEM_DEFINITIONS[stem].octave, durationSteps: 1, velocity: 0.3 });
  }
  return slots;
}

/** Patrón determinista de un compás: mismo seed, festividad y barra, mismas notas. */
export function buildBarPatterns(profile: FestivalProfile, seed: number, bar: number): BarPatterns {
  const patterns = {} as Record<StemId, BarPattern>;
  for (const stem of STEM_IDS) patterns[stem] = buildStemBar(stem, profile, seed, bar);
  return patterns;
}

export function notesAt(pattern: BarPattern, step: number): readonly NoteEvent[] {
  return pattern[step] ?? [];
}

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function noteFrequency(profile: FestivalProfile, note: NoteEvent): number {
  const scale = profile.scale;
  const degree = scale[((note.degree % scale.length) + scale.length) % scale.length] ?? 0;
  const octaveShift = (note.octave - 4) * 12;
  return midiToFrequency(profile.rootMidi + degree + octaveShift);
}

export function swingDelay(step: number, swing: number, stepDuration: number): number {
  if (step % 2 === 0) return 0;
  return Math.max(0, Math.min(0.25, swing)) * stepDuration;
}
