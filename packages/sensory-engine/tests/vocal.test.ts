import { describe, expect, it } from 'vitest';
import { midiHz, VOCAL_FORMANTS, vocalFormants } from '../src/vocal/formants.js';
import { VocalHumSynth } from '../src/vocal/vocal-hum-synth.js';
import { FakeContext, type FakeFilter, type FakeGain, type FakeOscillator } from './fakes-audio.js';

describe('voz tarareando con formantes', () => {
  it('modela las vocales /m/, /u/ y /o/', () => {
    expect(vocalFormants('m')[0]?.frequency).toBe(250);
    expect(vocalFormants('u')[0]?.frequency).toBe(320);
    expect(vocalFormants('o')[0]?.frequency).toBe(500);
    expect(VOCAL_FORMANTS.m).toHaveLength(3);
    expect(midiHz(69)).toBeCloseTo(440, 5);
  });

  it('aplica portamento, vibrato progresivo y respiración', () => {
    const context = new FakeContext();
    const destination = context.createGain();
    const synth = new VocalHumSynth(context, { seed: 5, vibratoHz: 5.4, breathVolume: 0.02 });
    const voice = synth.play({
      midi: 69, previousMidi: 67, when: 0, duration: 1.2, velocity: 0.8,
      vowel: 'm', vibratoCents: 16, portamentoSeconds: 0.12,
    }, destination);
    expect(voice.vowel).toBe('m');
    expect(voice.targetHz).toBeCloseTo(440, 5);
    expect(voice.fromHz).toBeCloseTo(392, 0);
    expect(voice.formants).toHaveLength(3);
    const filters = context.getByKind('filter') as FakeFilter[];
    const frequencies = filters.map((filter) => filter.frequency.value);
    expect(frequencies).toContain(250);
    expect(frequencies).toContain(1100);
    expect(frequencies).toContain(900);
    const oscillator = context.getByKind('oscillator')[0] as FakeOscillator | undefined;
    expect(oscillator?.frequency.events.some((event) => event.startsWith('exp:440'))).toBe(true);
    const gains = context.getByKind('gain') as FakeGain[];
    expect(gains.some((gain) => gain.gain.events.some((event) => event.startsWith('linear:16')))).toBe(true);
    expect(context.getByKind('buffer-source').length).toBeGreaterThanOrEqual(1);
    voice.stop();
  });

  it('cambia de vocal y devuelve una voz detenible', () => {
    const context = new FakeContext();
    const destination = context.createGain();
    const synth = new VocalHumSynth(context);
    for (const vowel of ['m', 'u', 'o'] as const) {
      const voice = synth.play({ midi: 60, when: 0, duration: 0.4, velocity: 0.5, vowel }, destination);
      expect(voice.vowel).toBe(vowel);
      expect(voice.endsAt).toBeGreaterThan(0);
      voice.stop();
    }
    expect(context.getByKind('filter').length).toBeGreaterThanOrEqual(9);
  });
});
