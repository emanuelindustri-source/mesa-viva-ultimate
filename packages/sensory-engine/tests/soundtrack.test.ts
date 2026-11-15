import { describe, expect, it } from 'vitest';
import { AudioRuntime } from '../src/audio/runtime.js';
import { HapticEngine } from '../src/haptics/engine.js';
import { SensorySession } from '../src/session.js';
import { SoundtrackController } from '../src/soundtrack/soundtrack-controller.js';
import { SoundtrackEngine } from '../src/soundtrack/soundtrack-engine.js';
import { FakeContext, fakeFactory } from './fakes-audio.js';
import { fakeWebHaptics } from './fakes-haptics.js';

function makeRuntime(maxChannels = 8): { context: FakeContext; runtime: AudioRuntime } {
  const context = new FakeContext(48_000, maxChannels);
  return { context, runtime: new AudioRuntime({ factory: fakeFactory(context).factory }) };
}

describe('banda sonora de estudio', () => {
  it('arranca en 7.1 y programa el movimiento largo', async () => {
    const { context, runtime } = makeRuntime(8);
    await runtime.unlock();
    const engine = new SoundtrackEngine(runtime, {
      seed: 21, festival: 'carnaval', outputMode: '7.1', bars: 32, state: 'energia', autoTick: false,
    });
    expect(engine.start()).toBe(true);
    expect(engine.soundtrackStatus.running).toBe(true);
    expect(engine.soundtrackStatus.output.active).toBe('7.1');
    expect(engine.soundtrackStatus.output.channels).toBe(8);
    expect(engine.soundtrackStatus.totalBars).toBe(32);
    expect(engine.soundtrackStatus.tempo).toBe(124);
    expect(Object.keys(engine.soundtrackStatus.instrumentLevels)).toHaveLength(8);
    const scheduled = engine.advance(context.currentTime + 4);
    expect(scheduled).toBeGreaterThan(10);
    expect(engine.soundtrackStatus.eventCursor).toBeGreaterThan(10);
    expect(engine.soundtrackStatus.activeVoices).toBeGreaterThan(0);
    expect(context.getByKind('channel-merger').length).toBeGreaterThanOrEqual(1);
    expect(context.getByKind('delay').length).toBeGreaterThanOrEqual(1);
    expect(engine.currentChord).toHaveLength(4);
    expect(engine.playTableImpact()?.frequency).toBeGreaterThan(0);
    engine.dispose();
    await runtime.dispose();
  });

  it('cambia de estado, festividad, salida y SFX armónico', async () => {
    const { context, runtime } = makeRuntime(8);
    await runtime.unlock();
    const engine = new SoundtrackEngine(runtime, {
      seed: 3, festival: 'dia-normal', outputMode: '5.1', bars: 32, autoTick: false,
    });
    engine.start();
    engine.advance(context.currentTime + 2);
    const basePercussion = engine.soundtrackStatus.instrumentLevels.percussion;
    expect(engine.setPlayerState({ idleSeconds: 8 })).toBe('concentracion');
    expect(engine.soundtrackStatus.state).toBe('concentracion');
    expect(engine.soundtrackStatus.instrumentLevels.percussion).toBeLessThan(basePercussion);
    const sfx = engine.playHarmonicSfx('chime', 69);
    expect(sfx?.frequency).toBeGreaterThan(0);
    engine.setFestival('halloween');
    expect(engine.soundtrackStatus.festival).toBe('halloween');
    engine.setOutputMode('2.1');
    expect(engine.soundtrackStatus.output.active).toBe('2.1');
    expect(engine.soundtrackStatus.output.channels).toBe(3);
    engine.setVolume(0.5);
    engine.setMuted(true);
    expect(engine.soundtrackStatus.master.muted).toBe(true);
    engine.stop();
    expect(engine.soundtrackStatus.running).toBe(false);
    engine.dispose();
    await runtime.dispose();
  });

  it('permite elegir el motor desde el controlador', async () => {
    const { runtime } = makeRuntime(6);
    await runtime.unlock();
    const controller = new SoundtrackController(runtime, { mode: 'stems', bars: 32, autoTick: false });
    expect(controller.start()).toBe(false);
    controller.setMode('studio');
    expect(controller.start()).toBe(true);
    expect(controller.status.running).toBe(true);
    controller.setOutputMode('5.2');
    expect(controller.outputStatus.active).toBe('5.2');
    controller.setMuted(true);
    controller.setPhase('resolucion');
    expect(controller.status.phase).toBe('resolucion');
    controller.stop();
    expect(controller.status.running).toBe(false);
    controller.dispose();
    await runtime.dispose();
  });
});

describe('sesión con banda sonora de estudio', () => {
  it('integra salida multicanal, estado y vuelta a stems', async () => {
    const { runtime } = makeRuntime(8);
    const web = fakeWebHaptics();
    const session = new SensorySession({
      runtime, haptics: new HapticEngine({ vibrate: web.vibrate }), musicEngine: 'studio',
      outputMode: '7.1', soundtrackBars: 32, autoTick: false,
    });
    await session.unlock();
    expect(session.status.soundtrack?.running).toBe(true);
    expect(session.status.output?.channels).toBe(8);
    expect(session.setPlayerState({ idleSeconds: 7 })).toBe('concentracion');
    expect(session.currentChord).toHaveLength(4);
    expect(session.playHarmonicSfx('sparkle', 64)).not.toBeNull();
    session.setOutputMode('5.2');
    expect(session.status.output?.channels).toBe(6);
    session.setBinauralEnabled(false);
    session.setMusicEngine('stems');
    expect(session.status.music.running).toBe(true);
    expect(session.status.soundtrack?.running).toBe(false);
    session.setMusicEngine('studio');
    expect(session.status.soundtrack?.running).toBe(true);
    await session.dispose();
    expect(session.status.audio.state).toBe('cerrado');
    await runtime.dispose();
  });
});
