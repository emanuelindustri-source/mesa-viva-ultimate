import { describe, expect, it } from 'vitest';
import { SynthKit } from '../src/audio/synth.js';
import { KarplusSynth } from '../src/instruments/karplus.js';
import { DoubleBassSynth, MarimbaSynth, StringsSynth } from '../src/instruments/low-and-strings.js';
import { OrganicOrchestra } from '../src/instruments/orchestra.js';
import { BeatboxSynth, LatinPercussionSynth } from '../src/instruments/percussion.js';
import { RhodesSynth } from '../src/instruments/rhodes.js';
import { MultiChannelRouter } from '../src/output/router.js';
import { StudioMasterBus } from '../src/output/studio-master.js';
import { FakeContext, type FakeDelay, type FakeFilter, type FakeOscillator } from './fakes-audio.js';

const NOTE = { midi: 60, when: 0, duration: 0.8, velocity: 0.8 };

describe('orquesta orgánica', () => {
  it('sintetiza Rhodes, contrabajo, marimba y cuerdas', () => {
    const context = new FakeContext();
    const destination = context.createGain();
    const kit = new SynthKit(context, 1);
    const rhodes = new RhodesSynth(kit).play(NOTE, destination);
    expect(rhodes.instrument).toBe('rhodes');
    expect(context.getByKind('oscillator').length).toBeGreaterThanOrEqual(4);
    const bass = new DoubleBassSynth(kit).play({ ...NOTE, midi: 36 }, destination);
    expect(bass.instrument).toBe('bass');
    const filters = context.getByKind('filter') as FakeFilter[];
    expect(filters.some((filter) => filter.frequency.value === 118)).toBe(true);
    const marimba = new MarimbaSynth(kit).play({ ...NOTE, midi: 72 }, destination);
    expect(marimba.instrument).toBe('marimba');
    const strings = new StringsSynth(kit).play({ ...NOTE, midi: 55 }, destination);
    expect(strings.instrument).toBe('strings');
    expect((context.getByKind('oscillator') as FakeOscillator[]).filter((osc) => osc.type === 'sawtooth').length).toBeGreaterThanOrEqual(3);
  });

  it('construye Karplus-Strong con bucle de retardo y filtro', () => {
    const context = new FakeContext();
    const destination = context.createGain();
    const guitar = new KarplusSynth(context, { seed: 2, brightness: 5000, damping: 0.95, volume: 0.2 });
    const voice = guitar.play(NOTE, destination);
    expect(voice.instrument).toBe('guitar');
    const delay = context.getByKind('delay')[0] as FakeDelay | undefined;
    const filter = context.getByKind('filter')[0] as FakeFilter | undefined;
    expect(delay?.delayTime.value).toBeCloseTo(1 / 261.63, 2);
    expect(filter?.frequency.value).toBe(5000);
    expect(delay?.connections[0]).toBe(filter);
    const feedback = filter?.connections[0] as { connections: unknown[] } | undefined;
    expect(feedback?.connections[0]).toBe(delay);
    voice.stop();
  });

  it('produce percusión latina y beatbox sin samples', () => {
    const context = new FakeContext();
    const destination = context.createGain();
    const kit = new SynthKit(context, 4);
    const percussion = new LatinPercussionSynth(kit);
    const kinds = ['shaker', 'maracas', 'cajon', 'clap', 'kick', 'hat'] as const;
    for (const kind of kinds) {
      const voice = percussion.play(kind, 0, 0.8, destination);
      expect(voice.instrument).toBe('percussion');
    }
    const beatbox = new BeatboxSynth(kit);
    for (const kind of ['kick', 'snare', 'hat'] as const) {
      expect(beatbox.play(kind, 0, 0.7, destination).instrument).toBe('beatbox');
    }
    expect(context.getByKind('buffer-source').length).toBeGreaterThanOrEqual(5);
  });
});

describe('orquesta con buses multicanal', () => {
  it('reparte instrumentos y responde a la energía', () => {
    const context = new FakeContext(48_000, 8);
    const master = new StudioMasterBus(context, context.destination, { seed: 5 });
    const router = new MultiChannelRouter(context, master, { mode: '7.1' });
    const orchestra = new OrganicOrchestra(context, router, 12);
    expect(Object.keys(orchestra.levels)).toHaveLength(8);
    expect(orchestra.bus('hum')?.route.target).toBe('center');
    expect(orchestra.bus('bass')?.route.target).toBe('lfe');
    expect(orchestra.bus('strings')?.route.target).toBe('rear');
    const hum = orchestra.play({ instrument: 'hum', midi: 72, when: 0, duration: 0.6, velocity: 0.7, vowel: 'o' });
    expect(hum?.instrument).toBe('hum');
    expect(orchestra.play({ instrument: 'bass', midi: 36, when: 0, duration: 0.5, velocity: 0.8 })?.instrument).toBe('bass');
    expect(orchestra.play({ instrument: 'percussion', midi: 0, when: 0, duration: 0.2, velocity: 0.5, kind: 'cajon' })?.instrument).toBe('percussion');
    const basePercussion = orchestra.levels.percussion;
    orchestra.setEnergy('concentracion');
    expect(orchestra.levels.percussion).toBeLessThan(basePercussion);
    orchestra.setEnergy('climax');
    expect(orchestra.levels.bass).toBeGreaterThanOrEqual(1);
    orchestra.dispose();
    router.dispose();
    master.dispose();
  });
});
