import { mulberry32, seedFromText } from '../audio/random.js';
import type { FestivalProfile } from '../music/types.js';
import { midiForDegree } from './harmony.js';
import { motifTransformAt, transformMotif } from './motifs.js';
import type { ChordSlot, LongFormSection, Motif, PerformanceState, ScoreEvent } from './types.js';

const VOWELS = ['m', 'u', 'o'] as const;

function fallbackChord(section: LongFormSection): ChordSlot {
  return { startBeat: section.startBar * 4, endBeat: section.startBar * 4 + 4, degrees: [0, 2, 4, 6], tonic: section.tonic, section: section.index };
}

/** Reparte la conversación entre voz, Rhodes y cuatro sobre la armonía activa. */
export function buildMelodicEvents(
  profile: FestivalProfile,
  sections: readonly LongFormSection[],
  chords: readonly ChordSlot[],
  motifs: readonly Motif[],
  state: PerformanceState,
  seed: number,
): ScoreEvent[] {
  const scaleLength = Math.max(2, profile.scale.length);
  const events: ScoreEvent[] = [];
  for (const section of sections) {
    for (let local = 0; local < section.bars; local += 1) {
      const bar = section.startBar + local;
      const chord = chords[bar] ?? fallbackChord(section);
      const time = bar * 4;
      const phrase = local % 4;
      const random = mulberry32((seed ^ Math.imul(bar + 1, 2_654_435_761) ^ seedFromText(`${profile.id}:melody`)) >>> 0);
      const guitarStep = state === 'concentracion' ? 2 : 1;
      for (let step = 0; step < 8; step += guitarStep) {
        const degree = chord.degrees[(step + local) % chord.degrees.length] ?? 0;
        events.push({
          timeBeats: time + step * 0.5,
          durationBeats: 0.42,
          instrument: 'guitar',
          midi: midiForDegree(profile, degree, 3) + (step % 4 === 0 ? 12 : 0),
          velocity: 0.3 + (step % 4 === 0 ? 0.12 : 0),
          section: section.index,
          chordDegree: degree,
        });
      }
      const humCall = section.lead === 'hum' && phrase < 2;
      const humResponse = section.responder === 'hum' && phrase >= 2;
      if (humCall || humResponse) {
        const motif = motifs[(local + section.index) % motifs.length] ?? motifs[0];
        if (motif !== undefined) {
          const varied = transformMotif(motif, motifTransformAt(local + section.index * 2 + (humResponse ? 2 : 0)), scaleLength, random);
          let cursor = 0;
          for (const [index, cell] of varied.cells.entries()) {
            if (cursor >= 3.6) break;
            const duration = Math.min(cell.durationBeats, 4 - cursor);
            const anchor = chord.degrees[index % chord.degrees.length] ?? 0;
            const degree = (anchor + Math.round((cell.degree - scaleLength / 2) * 0.5) + scaleLength) % scaleLength;
            events.push({
              timeBeats: time + cursor,
              durationBeats: duration,
              instrument: 'hum',
              midi: midiForDegree(profile, degree, 5),
              velocity: cell.velocity,
              vowel: VOWELS[(bar + index) % VOWELS.length] ?? 'm',
              section: section.index,
              chordDegree: degree,
            });
            cursor += duration;
          }
        }
      }
      if (!(state === 'concentracion' && local % 2 === 1)) {
        for (const [index, degree] of chord.degrees.slice(0, 3).entries()) {
          events.push({
            timeBeats: time,
            durationBeats: 3.8,
            instrument: 'rhodes',
            midi: midiForDegree(profile, degree, 4) + (index === 2 ? 12 : 0),
            velocity: 0.32,
            section: section.index,
            chordDegree: degree,
          });
        }
      }
      if (section.responder === 'rhodes' && phrase >= 2) {
        const motif = motifs[(local + 1) % motifs.length] ?? motifs[0];
        if (motif !== undefined) {
          let cursor = 2;
          for (const [index, cell] of motif.cells.slice(0, 3).entries()) {
            if (cursor >= 4) break;
            const duration = Math.min(cell.durationBeats, 4 - cursor);
            const degree = chord.degrees[index % chord.degrees.length] ?? 0;
            events.push({
              timeBeats: time + cursor,
              durationBeats: duration,
              instrument: 'rhodes',
              midi: midiForDegree(profile, degree, 4),
              velocity: 0.42,
              section: section.index,
              chordDegree: degree,
            });
            cursor += duration;
          }
        }
      }
    }
  }
  return events;
}
