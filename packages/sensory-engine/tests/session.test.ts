import { describe, expect, it } from 'vitest';
import { AudioRuntime } from '../src/audio/runtime.js';
import { cardArcLayout, seatRingLayout } from '../src/audio/spatial-layout.js';
import { HapticEngine } from '../src/haptics/engine.js';
import { SensorySession } from '../src/session.js';
import { createTableSensoryHooks } from '../src/table-bridge.js';
import { FakeContext, fakeFactory } from './fakes-audio.js';
import { fakeWebHaptics } from './fakes-haptics.js';

function makeSession(options: { shakeAction?: 'dados' | 'barajar' } = {}): {
  context: FakeContext;
  runtime: AudioRuntime;
  session: SensorySession;
  web: ReturnType<typeof fakeWebHaptics>;
} {
  const context = new FakeContext();
  const runtime = new AudioRuntime({ factory: fakeFactory(context).factory });
  const web = fakeWebHaptics();
  const session = new SensorySession({
    runtime,
    haptics: new HapticEngine({ vibrate: web.vibrate, intensity: 1 }),
    autoTick: false,
    now: () => context.currentTime * 1_000,
    ...(options.shakeAction !== undefined ? { shakeAction: options.shakeAction } : {}),
  });
  return { context, runtime, session, web };
}

describe('sesión sensorial de mesa', () => {
  it('arranca en silencio y desbloquea con audio y música', async () => {
    const { session } = makeSession();
    expect(session.status.audio.state).toBe('sin-iniciar');
    const before = session.play('ui-click');
    expect(before?.effect).toBeNull();
    expect(before?.haptic?.source).toBe('web');
    const status = await session.unlock();
    expect(status.state).toBe('activo');
    expect(session.status.music.running).toBe(true);
    expect(session.status.spatial.activeOutputs).toBe(0);
    await session.dispose();
  });

  it('reproduce efectos con posición y háptica de precisión', async () => {
    const { session, web } = makeSession();
    await session.unlock();
    const played = session.play({ type: 'carta-colocar', position: { x: 2, y: 0.2, z: 1 } });
    expect(played?.event).toBe('carta-colocar');
    expect(played?.effect?.mode).toBe('hrtf');
    expect(played?.haptic?.source).toBe('web');
    expect(played?.latencyMs).toBeGreaterThanOrEqual(0);
    expect(web.calls.length).toBeGreaterThan(0);
    expect(session.metrics.count).toBeGreaterThan(1);
    expect(session.metrics.withinBudget).toBe(true);
    await session.dispose();
  });

  it('silencia audio y háptica boca abajo sin bloquear la partida', async () => {
    const { session } = makeSession();
    await session.unlock();
    session.onFaceDown(true);
    expect(session.status.faceDown).toBe(true);
    const muted = session.play('barajar');
    expect(muted?.effect).toBeNull();
    expect(muted?.haptic).toBeNull();
    session.onFaceDown(false);
    expect(session.status.faceDown).toBe(false);
    const restored = session.play('barajar');
    expect(restored?.effect).not.toBeNull();
    expect(restored?.haptic).not.toBeNull();
    await session.dispose();
  });

  it('agitar lanza dados o baraja según el juego', async () => {
    const dice = makeSession();
    await dice.session.unlock();
    expect(dice.session.onShake(0.02)).toBeNull();
    expect(dice.session.onShake(0.8)?.event).toBe('dados-lanzar');
    await dice.session.dispose();
    const shuffle = makeSession({ shakeAction: 'barajar' });
    await shuffle.session.unlock();
    expect(shuffle.session.onShake(0.5)?.event).toBe('barajar');
    expect(shuffle.session.onShake(0.5, 'dados')?.event).toBe('dados-lanzar');
    await shuffle.session.dispose();
  });

  it('aplica volumen, accesibilidad y festividad', async () => {
    const { session } = makeSession();
    await session.unlock();
    const preferences = session.setPreferences({ musicVolume: 0.2, hapticsEnabled: false, reducedMotion: true });
    expect(preferences.musicVolume).toBe(0.2);
    const quiet = session.play('turno');
    expect(quiet?.haptic).toBeNull();
    session.setFestival('halloween');
    expect(session.status.music.musicId).toBe('music.halloween');
    const snapshot = session.setTension({ phase: 'final', decisive: true, pressure: 1 });
    expect(snapshot.label).toBe('crítica');
    expect(session.status.music.tension).toBe(snapshot.tension);
    session.setPhase('resolucion');
    expect(session.tension.phase).toBe('resolucion');
    await session.dispose();
  });

  it('ata el layout de TableStage y mueve cartas vivas', async () => {
    const { session } = makeSession();
    await session.unlock();
    const seats = seatRingLayout(4);
    const cards = cardArcLayout(seats[0]?.position ?? { x: 0, y: 0, z: 0 }, 3);
    session.setLayout({ seats, cards });
    expect(session.status.spatial.attachedSources).toBe(7);
    session.attachSeat('extra', { x: 1, y: 0, z: 1 });
    session.attachCard('carta-extra', { x: 0, y: 0, z: 2 });
    expect(session.status.spatial.attachedSources).toBe(9);
    session.moveCard('carta-extra', { x: 1, y: 0, z: 2 });
    const cardEvent = session.play({ type: 'carta-deslizar', sourceId: 'carta-extra' });
    expect(cardEvent?.effect?.mode).toBe('hrtf');
    await session.dispose();
  });

  it('celebra, expone hooks y cierra sin fugas', async () => {
    const { session, runtime } = makeSession();
    await session.unlock();
    const result = session.celebrate('victoria');
    expect(result?.event).toBe('celebracion');
    expect(session.tension.phase).toBe('final');
    const hooks = createTableSensoryHooks(session);
    hooks.onFaceDown(true);
    expect(session.status.faceDown).toBe(true);
    hooks.onFaceDown(false);
    hooks.onShake(0.7);
    hooks.celebrate('derrota');
    await session.dispose();
    expect(session.status.audio.state).toBe('cerrado');
    expect(runtime.status.state).toBe('cerrado');
    expect(session.play('turno')).toBeNull();
  });
});
