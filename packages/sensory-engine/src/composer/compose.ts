import { mulberry32, seedFromText } from '../audio/random.js';
import type { FestivalProfile } from '../music/types.js';
import { buildChords, buildSections } from './harmony.js';
import { buildMelodicEvents } from './melody.js';
import { buildMotifs } from './motifs.js';
import { densityForState } from './performance.js';
import { buildRhythmicEvents } from './rhythm.js';
import type { ComposeOptions, LongFormScore, PerformanceState } from './types.js';

export const MIN_LONG_BARS = 32;
export const MAX_LONG_BARS = 64;

/** Compone un movimiento de 32–64 compases con cuatro secciones moduladas. */
export function composeLongForm(
  profile: FestivalProfile,
  seed: number,
  options: ComposeOptions = {},
): LongFormScore {
  const totalBars = Math.min(MAX_LONG_BARS, Math.max(MIN_LONG_BARS, Math.floor(options.bars ?? 48)));
  const state: PerformanceState = options.state ?? 'calma';
  const random = mulberry32((seed ^ seedFromText(`${profile.id}:${state}:sections`)) >>> 0);
  const sections = buildSections(totalBars, state, random);
  const chords = buildChords(profile, sections);
  const motifs = buildMotifs(seed, profile.scale.length, state);
  const melodic = buildMelodicEvents(profile, sections, chords, motifs, state, seed);
  const rhythmic = buildRhythmicEvents(profile, sections, chords, state);
  const events = [...melodic, ...rhythmic].sort((a, b) => a.timeBeats - b.timeBeats || a.instrument.localeCompare(b.instrument));
  return {
    festival: profile.id,
    seed,
    tempo: profile.tempo,
    totalBars,
    totalBeats: totalBars * 4,
    sections,
    chords,
    events,
  };
}

export function scoreDensity(score: LongFormScore): number {
  return score.events.length / Math.max(1, score.totalBeats);
}

export function eventCounts(score: LongFormScore): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const event of score.events) counts[event.instrument] = (counts[event.instrument] ?? 0) + 1;
  return counts;
}

export function sectionAtBeat(score: LongFormScore, beat: number): number {
  const section = score.sections.find((item) => beat >= item.startBar * 4 && beat < (item.startBar + item.bars) * 4);
  return section?.index ?? 0;
}

export function performanceDensity(state: PerformanceState): number {
  return densityForState(state);
}
