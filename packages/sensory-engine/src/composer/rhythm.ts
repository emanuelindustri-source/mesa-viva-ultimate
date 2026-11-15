import type { FestivalProfile } from '../music/types.js';
import { midiForDegree } from './harmony.js';
import type { ChordSlot, LongFormSection, PerformanceState, ScoreEvent } from './types.js';

function fallbackChord(section: LongFormSection): ChordSlot {
  return { startBeat: section.startBar * 4, endBeat: section.startBar * 4 + 4, degrees: [0, 2, 4, 6], tonic: section.tonic, section: section.index };
}

function push(events: ScoreEvent[], event: ScoreEvent): void {
  events.push(event);
}

/** Bajo LFE, marimba, cuerdas traseras, percusión latina y beatbox. */
export function buildRhythmicEvents(
  profile: FestivalProfile,
  sections: readonly LongFormSection[],
  chords: readonly ChordSlot[],
  state: PerformanceState,
): ScoreEvent[] {
  const events: ScoreEvent[] = [];
  for (const section of sections) {
    const energy = section.energy;
    for (let local = 0; local < section.bars; local += 1) {
      const bar = section.startBar + local;
      const chord = chords[bar] ?? fallbackChord(section);
      const time = bar * 4;
      const root = chord.degrees[0] ?? 0;
      const fifth = chord.degrees[2] ?? root;
      push(events, { timeBeats: time, durationBeats: 1.8, instrument: 'bass', midi: midiForDegree(profile, root, 2), velocity: 0.62, section: section.index, chordDegree: root });
      push(events, { timeBeats: time + 2, durationBeats: 1.4, instrument: 'bass', midi: midiForDegree(profile, root, 2) - 12, velocity: 0.46, section: section.index, chordDegree: root });
      if (energy >= 1) {
        push(events, { timeBeats: time + 3.5, durationBeats: 0.45, instrument: 'bass', midi: midiForDegree(profile, fifth, 2), velocity: 0.38, section: section.index, chordDegree: fifth });
      }
      const marimbaSteps = state === 'concentracion' ? [2.5] : [0.5, 1.5, 2.5, 3.5];
      for (const [index, offset] of marimbaSteps.entries()) {
        const degree = chord.degrees[(index + local) % chord.degrees.length] ?? 0;
        push(events, {
          timeBeats: time + offset,
          durationBeats: 0.4,
          instrument: 'marimba',
          midi: midiForDegree(profile, degree, 4),
          velocity: 0.24 + energy * 0.03,
          section: section.index,
          chordDegree: degree,
        });
      }
      if (local === 0 || (local === Math.floor(section.bars / 2) && section.bars > 8)) {
        const degree = chord.degrees[0] ?? 0;
        push(events, {
          timeBeats: time,
          durationBeats: section.bars > 8 ? 8 : section.bars * 4,
          instrument: 'strings',
          midi: midiForDegree(profile, degree, 3),
          velocity: 0.2 + energy * 0.02,
          section: section.index,
          chordDegree: degree,
        });
      }
      if (state !== 'concentracion') {
        for (let step = 0; step < 8; step += 1) {
          push(events, {
            timeBeats: time + step * 0.5,
            durationBeats: 0.12,
            instrument: 'percussion',
            midi: 0,
            velocity: 0.13 + (step % 2 === 0 ? 0.06 : 0),
            kind: step % 2 === 0 ? 'shaker' : 'maracas',
            section: section.index,
            chordDegree: root,
          });
        }
      }
      push(events, { timeBeats: time, durationBeats: 0.2, instrument: 'percussion', midi: 0, velocity: 0.44, kind: 'cajon', section: section.index, chordDegree: root });
      if (state !== 'concentracion') {
        push(events, { timeBeats: time + 2, durationBeats: 0.2, instrument: 'percussion', midi: 0, velocity: 0.36, kind: 'cajon', section: section.index, chordDegree: root });
      }
      if (energy >= 2) {
        push(events, { timeBeats: time + 1, durationBeats: 0.15, instrument: 'percussion', midi: 0, velocity: 0.24, kind: 'clap', section: section.index, chordDegree: root });
        push(events, { timeBeats: time + 3, durationBeats: 0.15, instrument: 'percussion', midi: 0, velocity: 0.24, kind: 'clap', section: section.index, chordDegree: root });
      }
      if (energy >= 3) {
        push(events, { timeBeats: time, durationBeats: 0.2, instrument: 'percussion', midi: 0, velocity: 0.4, kind: 'kick', section: section.index, chordDegree: root });
        push(events, { timeBeats: time + 2, durationBeats: 0.2, instrument: 'percussion', midi: 0, velocity: 0.34, kind: 'kick', section: section.index, chordDegree: root });
      }
      if (energy >= 2) {
        push(events, { timeBeats: time, durationBeats: 0.2, instrument: 'beatbox', midi: 0, velocity: 0.34, kind: 'kick', section: section.index, chordDegree: root });
        push(events, { timeBeats: time + 1, durationBeats: 0.14, instrument: 'beatbox', midi: 0, velocity: 0.26, kind: 'snare', section: section.index, chordDegree: root });
        push(events, { timeBeats: time + 2, durationBeats: 0.2, instrument: 'beatbox', midi: 0, velocity: 0.3, kind: 'kick', section: section.index, chordDegree: root });
        push(events, { timeBeats: time + 3, durationBeats: 0.14, instrument: 'beatbox', midi: 0, velocity: 0.26, kind: 'snare', section: section.index, chordDegree: root });
        for (const offset of [0.5, 1.5, 2.5, 3.5]) {
          push(events, { timeBeats: time + offset, durationBeats: 0.1, instrument: 'beatbox', midi: 0, velocity: 0.14, kind: 'hat', section: section.index, chordDegree: root });
        }
      }
    }
  }
  return events;
}
