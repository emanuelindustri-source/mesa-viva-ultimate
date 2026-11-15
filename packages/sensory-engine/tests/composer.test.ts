import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/audio/random.js';
import { composeLongForm, eventCounts, MAX_LONG_BARS, MIN_LONG_BARS, scoreDensity, sectionAtBeat } from '../src/composer/compose.js';
import { chordAtBeat, chordMidiTones, midiForDegree, nearestChordMidi } from '../src/composer/harmony.js';
import { buildMotifs, motifDuration, motifTransformAt, transformMotif } from '../src/composer/motifs.js';
import { densityForState, derivePerformanceState, energyForState, stateLabel } from '../src/composer/performance.js';
import { festivalProfile } from '../src/music/festivals.js';
import { FESTIVAL_IDS } from '../src/music/types.js';
import { HarmonicSfxPlayer, tuneSfxMidi } from '../src/soundtrack/harmonic-sfx.js';
import { FakeContext } from './fakes-audio.js';

describe('compositor de forma larga', () => {
  it('genera 32–64 compases con ocho instrumentos y estructura', () => {
    const score = composeLongForm(festivalProfile('dia-normal'), 42, { bars: 48, state: 'calma' });
    expect(score.totalBars).toBe(48);
    expect(score.totalBeats).toBe(192);
    expect(score.sections).toHaveLength(4);
    expect(score.events.length).toBeGreaterThan(200);
    expect(scoreDensity(score)).toBeGreaterThan(0.5);
    const counts = eventCounts(score);
    for (const instrument of ['hum', 'rhodes', 'guitar', 'bass', 'marimba', 'strings', 'percussion', 'beatbox']) {
      expect(counts[instrument] ?? 0).toBeGreaterThan(0);
    }
    expect(eventCounts(score).hum).toBeGreaterThan(20);
    for (const event of score.events) {
      expect(event.timeBeats).toBeGreaterThanOrEqual(0);
      expect(event.timeBeats).toBeLessThan(score.totalBeats);
      expect(event.durationBeats).toBeGreaterThan(0);
    }
    expect(sectionAtBeat(score, 0)).toBe(0);
    expect(sectionAtBeat(score, score.totalBeats - 1)).toBe(3);
  });

  it('limita el rango y es determinista', () => {
    const profile = festivalProfile('halloween');
    const first = composeLongForm(profile, 7, { bars: 10 });
    const second = composeLongForm(profile, 7, { bars: 10 });
    const other = composeLongForm(profile, 8, { bars: 10 });
    expect(first.totalBars).toBe(MIN_LONG_BARS);
    expect(composeLongForm(profile, 7, { bars: 100 }).totalBars).toBe(MAX_LONG_BARS);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(JSON.stringify(first)).not.toBe(JSON.stringify(other));
  });

  it('recorre las 19 festividades con modulación propia', () => {
    for (const id of FESTIVAL_IDS.filter((festival) => festival !== 'dia-normal')) {
      const score = composeLongForm(festivalProfile(id), 33, { bars: 32, state: 'energia' });
      expect(score.festival).toBe(id);
      expect(score.totalBars).toBe(32);
      expect(score.events.length).toBeGreaterThan(100);
      expect(new Set(score.sections.map((section) => section.tonic)).size).toBeGreaterThanOrEqual(3);
      expect(score.chords.length).toBe(32);
    }
  });

  it('desarrolla motivos sin repetición mecánica', () => {
    const motifs = buildMotifs(5, 7, 'calma');
    expect(motifs).toHaveLength(3);
    expect(motifs.every((motif) => motif.cells.length >= 3)).toBe(true);
    expect(motifDuration(motifs[0] as never)).toBeGreaterThan(0);
    const random = mulberry32(4);
    const inverted = transformMotif(motifs[0] as never, 'invert', 7, random);
    const retro = transformMotif(motifs[0] as never, 'retrograde', 7, random);
    expect(inverted.cells[0]?.degree).toBe(6 - (motifs[0]?.cells[0]?.degree ?? 0));
    expect(retro.cells[0]?.degree).toBe(motifs[0]?.cells.at(-1)?.degree);
    expect(motifTransformAt(1)).toBe('invert');
    expect(motifTransformAt(3)).toBe('sequence');
  });

  it('adapta la energía al estado del jugador', () => {
    expect(derivePerformanceState({ idleSeconds: 7 })).toBe('concentracion');
    expect(derivePerformanceState({ streak: 3 })).toBe('energia');
    expect(derivePerformanceState({ streak: 3, tension: 0.9 })).toBe('climax');
    expect(derivePerformanceState({ chants: 2 })).toBe('energia');
    expect(densityForState('concentracion')).toBeLessThan(densityForState('climax'));
    expect(energyForState('climax')).toBe(1);
    expect(energyForState('concentracion')).toBeLessThan(energyForState('calma'));
    expect(stateLabel('concentracion')).toBe('Concentración');
    const focus = composeLongForm(festivalProfile('dia-normal'), 3, { bars: 32, state: 'concentracion' });
    const party = composeLongForm(festivalProfile('dia-normal'), 3, { bars: 32, state: 'climax' });
    expect(party.events.length).toBeGreaterThan(focus.events.length);
  });
});

describe('harmonía y SFX afinados', () => {
  it('consulta el acorde activo y elige el tono más cercano', () => {
    const profile = festivalProfile('navidad');
    const score = composeLongForm(profile, 11, { bars: 32 });
    const chord = chordAtBeat(score.chords, 0);
    expect(chord.length).toBe(4);
    expect(midiForDegree(profile, 0, 4)).toBe(profile.rootMidi);
    const tones = chordMidiTones(profile, chord, 4);
    const tuned = nearestChordMidi(64, profile, chord);
    expect(tones.some((tone) => tone % 12 === tuned % 12)).toBe(true);
    expect(Math.abs(tuned - 64)).toBeLessThanOrEqual(6);
  });

  it('reproduce un chime y un impacto en el acorde', () => {
    const context = new FakeContext();
    const destination = context.createGain();
    const player = new HarmonicSfxPlayer(context, 4);
    const profile = festivalProfile('dia-normal');
    const chord = [0, 2, 4];
    const first = player.play('chime', 69, profile, chord, destination);
    const second = player.play('impact', 60, profile, chord, destination);
    const third = player.play('coin', 67, profile, chord, destination);
    expect(first.frequency).toBeGreaterThan(0);
    expect(second.voice).toBeDefined();
    expect(third.midi % 12).toBe(first.midi % 12);
    expect(tuneSfxMidi(69, profile, chord) % 12).toBe(first.midi % 12);
    expect(context.getByKind('oscillator').length).toBeGreaterThan(2);
  });
});
