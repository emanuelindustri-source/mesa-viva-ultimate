import { describe, expect, it } from 'vitest';
import { festivalProfile } from '../src/music/festivals.js';
import {
  buildBarPatterns,
  midiToFrequency,
  noteFrequency,
  notesAt,
  STEPS_PER_BAR,
  swingDelay,
} from '../src/music/patterns.js';
import {
  dominantStem,
  effectiveStemGain,
  STEM_DEFINITIONS,
  sortedStemsByGain,
  stemDefinition,
  stemGainAt,
  stemMix,
} from '../src/music/stems.js';
import {
  deriveTension,
  PHASE_TENSION_WEIGHTS,
  smoothTension,
  tensionFromScore,
  tensionLabel,
} from '../src/music/tension.js';
import { STEM_IDS } from '../src/music/types.js';

describe('ocho stems musicales', () => {
  it('define exactamente ocho capas con etiqueta y rol', () => {
    expect(STEM_IDS).toHaveLength(8);
    expect(Object.keys(STEM_DEFINITIONS)).toHaveLength(8);
    for (const id of STEM_IDS) {
      const definition = stemDefinition(id);
      expect(definition.id).toBe(id);
      expect(definition.label.length).toBeGreaterThan(2);
      expect(definition.role.length).toBeGreaterThan(5);
    }
  });

  it('el pad cede espacio y las capas rítmicas crecen con la tensión', () => {
    expect(stemGainAt('pad', 0)).toBeGreaterThan(stemGainAt('pad', 1));
    expect(stemGainAt('coro', 0)).toBeGreaterThan(stemGainAt('coro', 1));
    for (const id of ['pulso', 'bajo', 'arpegio', 'melodia', 'acento'] as const) {
      expect(stemGainAt(id, 1)).toBeGreaterThan(stemGainAt(id, 0));
    }
    expect(stemGainAt('pulso', Number.NaN)).toBeGreaterThanOrEqual(0);
    expect(stemGainAt('pulso', 2)).toBeLessThanOrEqual(1);
  });

  it('aplica el sesgo de la festividad sin salir de 0..1', () => {
    const navidad = festivalProfile('navidad');
    const normal = festivalProfile('dia-normal');
    expect(effectiveStemGain('campanas', 0.4, navidad)).toBeGreaterThan(effectiveStemGain('campanas', 0.4, normal));
    expect(effectiveStemGain('pulso', 0.4, festivalProfile('carnaval'))).toBeGreaterThan(stemGainAt('pulso', 0.4));
    const mix = stemMix(0.5, navidad);
    expect(Object.keys(mix)).toHaveLength(8);
    for (const value of Object.values(mix)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it('ordena las capas por presencia y elige la dominante', () => {
    const normal = festivalProfile('dia-normal');
    expect(dominantStem(0, normal)).toBe('pad');
    expect(dominantStem(1, normal)).toBe('acento');
    const sorted = sortedStemsByGain(0.8, normal);
    expect(sorted).toHaveLength(8);
    const first = sorted[0] ?? 'pad';
    const last = sorted[7] ?? 'pad';
    expect(effectiveStemGain(first, 0.8, normal)).toBeGreaterThanOrEqual(effectiveStemGain(last, 0.8, normal));
  });
});

describe('tensión de partida', () => {
  it('crece con fase, presión y final decisivo', () => {
    const calm = deriveTension({ phase: 'preparacion' });
    const turn = deriveTension({ phase: 'turno', humanTurn: true });
    const final = deriveTension({ phase: 'final', decisive: true, pressure: 1 });
    expect(calm.tension).toBeLessThan(turn.tension);
    expect(turn.tension).toBeLessThan(final.tension);
    expect(final.tension).toBeLessThanOrEqual(1);
    expect(final.label).toBe('crítica');
    expect(PHASE_TENSION_WEIGHTS.final).toBe(1);
  });

  it('acerca el marcador y la apuesta a la tensión máxima', () => {
    const close = deriveTension({ scoreGap: 0, maxScore: 100, chipsAtStake: 90, bankroll: 100 });
    const far = deriveTension({ scoreGap: 100, maxScore: 100, chipsAtStake: 0, bankroll: 100 });
    expect(close.tension).toBeGreaterThan(far.tension);
    expect(tensionFromScore(0, 100)).toBe(1);
    expect(tensionFromScore(100, 100)).toBe(0);
    expect(tensionFromScore(5, 0)).toBe(0.5);
  });

  it('etiqueta niveles y suaviza sin saltos', () => {
    expect(tensionLabel(0)).toBe('calma');
    expect(tensionLabel(0.3)).toBe('interés');
    expect(tensionLabel(0.5)).toBe('tensión');
    expect(tensionLabel(0.7)).toBe('alta');
    expect(tensionLabel(0.95)).toBe('crítica');
    const half = smoothTension(0, 1, 0.2);
    expect(half).toBeGreaterThan(0);
    expect(half).toBeLessThan(1);
    expect(smoothTension(1, 0, 10)).toBeLessThan(0.01);
    expect(smoothTension(0, 1, Number.NaN)).toBe(0);
  });
});

describe('patrones musicales deterministas', () => {
  it('genera dieciséis pasos para cada stem', () => {
    const patterns = buildBarPatterns(festivalProfile('carnaval'), 42, 0);
    expect(Object.keys(patterns)).toHaveLength(8);
    for (const id of STEM_IDS) {
      expect(patterns[id]).toHaveLength(STEPS_PER_BAR);
      for (const note of notesAt(patterns[id], 0)) expect(note.step).toBe(0);
    }
    expect(notesAt(patterns.pulso, 99)).toEqual([]);
  });

  it('reproduce el mismo compás con la misma semilla', () => {
    const profile = festivalProfile('navidad');
    const first = buildBarPatterns(profile, 7, 2);
    const second = buildBarPatterns(profile, 7, 2);
    const third = buildBarPatterns(profile, 8, 2);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(JSON.stringify(first)).not.toBe(JSON.stringify(third));
  });

  it('convierte escala y octava a frecuencia y aplica swing', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 5);
    const profile = festivalProfile('dia-normal');
    const note = { step: 0, degree: 0, octave: 4, durationSteps: 1, velocity: 0.5 };
    expect(noteFrequency(profile, note)).toBeCloseTo(261.63, 1);
    expect(noteFrequency(profile, { ...note, octave: 5 })).toBeCloseTo(523.25, 1);
    expect(swingDelay(0, 0.2, 0.25)).toBe(0);
    expect(swingDelay(1, 0.2, 0.25)).toBeGreaterThan(0);
    expect(swingDelay(1, 9, 0.25)).toBeLessThanOrEqual(0.0625);
  });
});
