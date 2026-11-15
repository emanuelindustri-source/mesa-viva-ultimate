import type { FestivalProfile } from '../music/types.js';
import { clamp } from '../types.js';
import type { ChordSlot, LongFormSection, PerformanceState } from './types.js';

const PROGRESSIONS: readonly (readonly number[])[] = [
  [0, 4, 5, 3],
  [0, 3, 4, 4],
  [0, 5, 3, 4],
  [0, 2, 4, 5],
];

export function buildSections(totalBars: number, state: PerformanceState, random: () => number): readonly LongFormSection[] {
  const base = Math.floor(totalBars / 4);
  const remainder = totalBars % 4;
  const energyBase = state === 'concentracion' ? 0 : state === 'climax' ? 2 : state === 'energia' ? 1 : 1;
  const startTonic = random() < 0.35 ? 2 : 0;
  const tonics = [0, 2, 4, 5].map((offset) => (startTonic + offset) % 7);
  const leads: readonly ['hum' | 'rhodes' | 'guitar', 'hum' | 'rhodes' | 'guitar'][] = [
    ['hum', 'rhodes'], ['rhodes', 'guitar'], ['guitar', 'hum'], ['hum', 'guitar'],
  ];
  let cursor = 0;
  return tonics.map((tonic, index) => {
    const bars = base + (index < remainder ? 1 : 0);
    const section: LongFormSection = {
      index,
      startBar: cursor,
      bars,
      tonic,
      chordDegrees: PROGRESSIONS[index % PROGRESSIONS.length] ?? PROGRESSIONS[0] ?? [0, 4, 5, 3],
      energy: clamp(energyBase + (index === 2 ? 2 : index === 1 || index === 3 ? 1 : 0), 0, 3),
      lead: leads[index]?.[0] ?? 'hum',
      responder: leads[index]?.[1] ?? 'rhodes',
    };
    cursor += bars;
    return section;
  });
}

export function buildChords(profile: FestivalProfile, sections: readonly LongFormSection[]): readonly ChordSlot[] {
  const scaleLength = Math.max(1, profile.scale.length);
  const chords: ChordSlot[] = [];
  for (const section of sections) {
    for (let local = 0; local < section.bars; local += 1) {
      const startBeat = (section.startBar + local) * 4;
      const relative = section.chordDegrees[local % section.chordDegrees.length] ?? 0;
      chords.push({
        startBeat,
        endBeat: startBeat + 4,
        degrees: [
          (section.tonic + relative) % scaleLength,
          (section.tonic + relative + 2) % scaleLength,
          (section.tonic + relative + 4) % scaleLength,
          (section.tonic + relative + 6) % scaleLength,
        ],
        tonic: section.tonic,
        section: section.index,
      });
    }
  }
  return chords;
}

export function midiForDegree(profile: FestivalProfile, degree: number, octave = 4): number {
  const scale = profile.scale;
  const index = ((degree % scale.length) + scale.length) % scale.length;
  return profile.rootMidi + (scale[index] ?? 0) + (octave - 4) * 12;
}

export function chordAtBeat(chords: readonly ChordSlot[], beat: number): readonly number[] {
  const slot = chords.find((chord) => beat >= chord.startBeat && beat < chord.endBeat) ?? chords[0];
  return slot?.degrees ?? [0, 2, 4];
}

export function chordMidiTones(profile: FestivalProfile, degrees: readonly number[], octave = 4): readonly number[] {
  return degrees.map((degree) => midiForDegree(profile, degree, octave));
}

/** Ajusta un SFX al tono del acorde activo más cercano, en cualquier octava. */
export function nearestChordMidi(baseMidi: number, profile: FestivalProfile, degrees: readonly number[]): number {
  let best = baseMidi;
  let distance = Number.POSITIVE_INFINITY;
  for (let octave = 2; octave <= 7; octave += 1) {
    for (const degree of degrees) {
      const candidate = midiForDegree(profile, degree, octave);
      const current = Math.abs(candidate - baseMidi);
      if (current < distance) {
        distance = current;
        best = candidate;
      }
    }
  }
  return best;
}
