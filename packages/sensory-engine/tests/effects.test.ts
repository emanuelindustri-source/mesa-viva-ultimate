import { describe, expect, it } from 'vitest';
import { EFFECT_DEFINITIONS, EFFECT_IDS, effectDefinition } from '../src/audio/effect-sounds.js';
import { SpatialEffectPlayer } from '../src/audio/effects.js';
import { AudioRuntime } from '../src/audio/runtime.js';
import { SpatialAudioEngine } from '../src/audio/spatial.js';
import { FakeContext, fakeFactory } from './fakes-audio.js';

describe('catálogo de efectos procedurales', () => {
  it('define doce efectos originales con bus y duración', () => {
    expect(EFFECT_IDS).toHaveLength(12);
    for (const id of EFFECT_IDS) {
      const definition = effectDefinition(id);
      expect(definition.id).toBe(id);
      expect(definition.label.length).toBeGreaterThan(3);
      expect(definition.durationMs).toBeGreaterThan(50);
      expect(definition.durationMs).toBeLessThan(2_000);
      expect(['music', 'effects', 'ambience', 'ui']).toContain(definition.bus);
      expect(typeof definition.synthesize).toBe('function');
    }
    expect(EFFECT_DEFINITIONS['dados-lanzar'].spatial).toBe(true);
    expect(EFFECT_DEFINITIONS.barajar.spatial).toBe(false);
  });

  it('sintetiza con voces contadas y sin archivos externos', () => {
    const context = new FakeContext();
    const runtime = new AudioRuntime({ factory: fakeFactory(context).factory });
    const spatial = new SpatialAudioEngine(runtime);
    const player = new SpatialEffectPlayer(runtime, spatial, 3);
    expect(player.play('carta-colocar')).toBeNull();
    return runtime.unlock().then(() => {
      const dice = player.play('dados-lanzar', { position: { x: 2, y: 0.5, z: 1 } });
      expect(dice?.id).toBe('dados-lanzar');
      expect(dice?.mode).toBe('hrtf');
      expect(dice?.voices).toBeGreaterThanOrEqual(6);
      expect(dice?.endsAt).toBeGreaterThan(dice?.startedAt ?? 0);
      expect(player.stats.active).toBe(1);
      dice?.stop();
      expect(player.stats.active).toBe(0);
      player.dispose();
      spatial.dispose();
      return runtime.dispose();
    });
  });

  it('usa la posición del asiento y mantiene los efectos de UI en mono', async () => {
    const context = new FakeContext();
    const runtime = new AudioRuntime({ factory: fakeFactory(context).factory });
    await runtime.unlock();
    const spatial = new SpatialAudioEngine(runtime);
    spatial.attach('asiento-1', 'asiento', { x: -2, y: 1, z: 2 });
    const player = new SpatialEffectPlayer(runtime, spatial);
    const card = player.play('carta-deslizar', { sourceId: 'asiento-1' });
    expect(card?.mode).toBe('hrtf');
    const ui = player.play('ui-click', { position: { x: 4, y: 0, z: 0 } });
    expect(ui?.mode).toBe('mono');
    expect(player.stats).toMatchObject({ active: 2, hrtf: 1 });
    player.stopAll();
    expect(player.stats.activeVoices).toBe(0);
    player.dispose();
    spatial.dispose();
    await runtime.dispose();
  });

  it('poda voces terminadas al disparar de nuevo', async () => {
    const context = new FakeContext();
    const runtime = new AudioRuntime({ factory: fakeFactory(context).factory });
    await runtime.unlock();
    const spatial = new SpatialAudioEngine(runtime);
    const player = new SpatialEffectPlayer(runtime, spatial);
    player.play('turno');
    expect(player.stats.active).toBe(1);
    context.currentTime = 10;
    player.play('ui-click');
    expect(player.stats.active).toBe(1);
    player.dispose();
    spatial.dispose();
    await runtime.dispose();
  });
});
