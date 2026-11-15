import { describe, expect, it } from 'vitest';
import { AudioRuntime } from '../src/audio/runtime.js';
import { AdaptiveMusicDirector } from '../src/music/director.js';
import { FakeContext, type FakeOscillator, fakeFactory } from './fakes-audio.js';

async function makeDirector(seed = 5, maxVoices = 28): Promise<{
  context: FakeContext;
  runtime: AudioRuntime;
  director: AdaptiveMusicDirector;
}> {
  const context = new FakeContext();
  const runtime = new AudioRuntime({ factory: fakeFactory(context).factory });
  await runtime.unlock();
  const director = new AdaptiveMusicDirector(runtime, {
    seed,
    autoTick: false,
    maxVoices,
    festival: 'dia-normal',
    initialTension: 0.2,
  });
  return { context, runtime, director };
}

describe('director musical adaptativo', () => {
  it('no arranca sin AudioContext y expone estado seguro', () => {
    const runtime = new AudioRuntime({ factory: fakeFactory().factory });
    const director = new AdaptiveMusicDirector(runtime, { autoTick: false });
    expect(director.start()).toBe(false);
    expect(director.status.running).toBe(false);
    expect(director.status.musicId).toBe('music.dia-normal');
    expect(Object.keys(director.stemLevels)).toHaveLength(8);
    director.dispose();
  });

  it('sincroniza ocho stems con un solo reloj', async () => {
    const { context, runtime, director } = await makeDirector();
    expect(director.start()).toBe(true);
    expect(director.start()).toBe(true);
    expect(director.status.running).toBe(true);
    const steps = director.advance(0.9);
    expect(steps).toBeGreaterThan(2);
    expect(director.status.step).toBeGreaterThanOrEqual(steps);
    expect(director.status.activeVoices).toBeGreaterThan(0);
    expect(director.status.activeVoices).toBeLessThanOrEqual(28);
    const oscillators = context.getByKind('oscillator') as FakeOscillator[];
    expect(oscillators.length).toBeGreaterThan(4);
    for (const oscillator of oscillators) {
      expect(oscillator.startedAt).not.toBeNull();
      expect(oscillator.stoppedAt).not.toBeNull();
    }
    expect(context.getByKind('gain').length).toBeGreaterThanOrEqual(9);
    director.setVolume(0.4);
    expect(director.status.volume).toBe(0.4);
    director.setMuted(true);
    expect(director.status.muted).toBe(true);
    director.stop();
    expect(director.status.running).toBe(false);
    director.dispose();
    await runtime.dispose();
  });

  it('cambia la mezcla por tensión y por festividad', async () => {
    const { runtime, director } = await makeDirector();
    director.start();
    director.setTension(0);
    const calm = director.stemLevels;
    expect(calm.pad).toBeGreaterThan(calm.pulso);
    director.setTension(1);
    const peak = director.stemLevels;
    expect(peak.pulso).toBeGreaterThan(peak.pad);
    expect(peak.acento).toBeGreaterThan(0.8);
    director.setFestival('carnaval');
    expect(director.status.festival).toBe('carnaval');
    expect(director.status.musicId).toBe('music.carnaval');
    expect(director.status.tempo).toBe(124);
    expect(director.stemLevels.acento).toBeGreaterThan(peak.acento);
    director.setTension({ phase: 'final', decisive: true, pressure: 1 });
    expect(director.status.tension).toBeGreaterThan(0.8);
    director.dispose();
    await runtime.dispose();
  });

  it('respeta el presupuesto de voces en móviles', async () => {
    const { runtime, director } = await makeDirector(5, 4);
    director.start();
    director.advance(4);
    expect(director.status.activeVoices).toBeLessThanOrEqual(4);
    director.dispose();
    await runtime.dispose();
  });

  it('genera la misma secuencia con la misma semilla', async () => {
    const first = await makeDirector(77);
    const second = await makeDirector(77);
    first.director.start();
    second.director.start();
    first.director.advance(1.2);
    second.director.advance(1.2);
    const capture = (context: FakeContext) => (context.getByKind('oscillator') as FakeOscillator[])
      .map((oscillator) => `${oscillator.frequency.value}@${oscillator.startedAt}`);
    expect(capture(first.context)).toEqual(capture(second.context));
    first.director.dispose();
    second.director.dispose();
    await first.runtime.dispose();
    await second.runtime.dispose();
  });
});
