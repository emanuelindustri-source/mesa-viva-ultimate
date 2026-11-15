import { describe, expect, it } from 'vitest';
import type { SpatialPoint } from '../src/audio/params.js';
import { AudioRuntime } from '../src/audio/runtime.js';
import { SpatialAudioEngine } from '../src/audio/spatial.js';
import { cardArcLayout, centerCardPosition, seatRingLayout } from '../src/audio/spatial-layout.js';
import { type FakeCompressor, FakeContext, type FakeGain, type FakePanner, fakeFactory } from './fakes-audio.js';

const ORIGIN: SpatialPoint = { x: 0, y: 0, z: 0 };

describe('geometría espacial de la mesa', () => {
  it('coloca asientos en anillo y cartas en abanico', () => {
    const seats = seatRingLayout(4, 4, 1.2);
    expect(seats).toHaveLength(4);
    expect(seats[0]?.id).toBe('asiento-0');
    expect(seats[0]?.position).toEqual({ x: 0, y: 1.2, z: 4 });
    expect(seats[2]?.position.z).toBeCloseTo(-4, 5);
    const cards = cardArcLayout(seats[0]?.position ?? ORIGIN, 5);
    expect(cards).toHaveLength(5);
    expect(cards[2]?.position.x).toBeCloseTo(0, 5);
    expect(centerCardPosition(0, 3).y).toBe(0.12);
    expect(centerCardPosition(1, 3).x).not.toBe(centerCardPosition(2, 3).x);
  });
});

describe('ciclo de vida del audio', () => {
  it('crea un contexto a 48 kHz solo al desbloquear', async () => {
    const fake = fakeFactory();
    const runtime = new AudioRuntime({ factory: fake.factory });
    expect(runtime.status.state).toBe('sin-iniciar');
    expect(runtime.isReady).toBe(false);
    const status = await runtime.unlock();
    expect(fake.calls).toEqual([48_000]);
    expect(status.state).toBe('activo');
    expect(status.sampleRate).toBe(48_000);
    expect(runtime.isReady).toBe(true);
    expect(runtime.graph).not.toBeNull();
    await runtime.unlock();
    expect(fake.context.resumeCalls).toBe(2);
    await runtime.suspend();
    expect(runtime.status.state).toBe('suspendido');
    await runtime.dispose();
    expect(runtime.status.state).toBe('cerrado');
    expect(fake.context.closeCalls).toBe(1);
    const closed = await runtime.unlock();
    expect(closed.state).toBe('cerrado');
  });

  it('degrada en silencio si Web Audio no existe', async () => {
    const runtime = new AudioRuntime({
      factory: () => {
        throw new Error('sin audio');
      },
    });
    const status = await runtime.unlock();
    expect(status.state).toBe('no-disponible');
    expect(status.reason).toContain('sin audio');
    expect(runtime.isReady).toBe(false);
  });
});

describe('mezcladora y limitador', () => {
  it('conecta cuatro buses al compresor y protege la salida', async () => {
    const context = new FakeContext();
    const runtime = new AudioRuntime({ factory: fakeFactory(context).factory });
    await runtime.unlock();
    const graph = runtime.graph;
    expect(graph).not.toBeNull();
    const music = graph?.bus('music') as FakeGain;
    const mix = music.connections[0] as FakeGain;
    const limiter = mix.connections[0] as FakeCompressor;
    expect(limiter.threshold.value).toBe(-8);
    expect(limiter.ratio.value).toBe(20);
    const master = limiter.connections[0] as FakeGain;
    expect(master.connections[0]).toBe(context.destination);
    expect(graph?.buses).toHaveLength(4);
    graph?.setBusVolume('music', 0.2, 0);
    expect(music.gain.value).toBe(0.2);
    graph?.setMuted(true);
    expect(graph?.isMuted).toBe(true);
    expect(graph?.levels.master).toBe(0);
    graph?.setMuted(false);
    graph?.setMasterVolume(0.5);
    expect(graph?.levels.master).toBe(0.5);
    graph?.dispose();
    expect(music.disconnected).toBe(true);
  });
});

describe('audio 3D HRTF', () => {
  it('ata asientos y cartas al panner y degrada a estéreo', async () => {
    const context = new FakeContext();
    const runtime = new AudioRuntime({ factory: fakeFactory(context).factory });
    await runtime.unlock();
    const spatial = new SpatialAudioEngine(runtime, { maxHrtfVoices: 1, panRange: 4 });
    spatial.attach('asiento-0', 'asiento', { x: 4, y: 1, z: 0 });
    const first = spatial.createOutput({ sourceId: 'asiento-0', bus: 'effects' });
    expect(first?.mode).toBe('hrtf');
    expect(spatial.stats.activeHrtf).toBe(1);
    const panner = context.getByKind('panner')[0] as FakePanner | undefined;
    expect(panner?.panningModel).toBe('HRTF');
    expect(panner?.positionX.value).toBe(4);
    const second = spatial.createOutput({ position: { x: -3, y: 0, z: 2 } });
    expect(second?.mode).toBe('estereo');
    const stereo = context.getByKind('stereo-panner')[0] as unknown as { pan: { value: number } } | undefined;
    expect(stereo?.pan.value).toBeLessThan(0);
    first?.dispose();
    expect(spatial.stats.activeHrtf).toBe(0);
    const third = spatial.createOutput({ position: { x: 1, y: 0, z: 1 } });
    expect(third?.mode).toBe('hrtf');
    expect(spatial.createOutput()).toMatchObject({ mode: 'mono' });
  });

  it('mueve fuentes vivas y orienta al oyente', async () => {
    const context = new FakeContext();
    const runtime = new AudioRuntime({ factory: fakeFactory(context).factory });
    await runtime.unlock();
    const spatial = new SpatialAudioEngine(runtime);
    spatial.attach('carta-1', 'carta', { x: 1, y: 0.1, z: 2 });
    const output = spatial.createOutput({ sourceId: 'carta-1' });
    spatial.updateSource('carta-1', { x: -2, y: 0.1, z: 3 }, 0);
    const panner = context.getByKind('panner')[0] as FakePanner | undefined;
    expect(panner?.positionX.value).toBe(-2);
    expect(output?.sourceId).toBe('carta-1');
    spatial.setListener({ x: 0, y: 1, z: 5 }, { x: 0, y: 0, z: -1 }, { x: 0, y: 1, z: 0 });
    expect(context.listener.positionZ.value).toBe(5);
    expect(context.listener.forwardZ.value).toBe(-1);
    spatial.setListenerFromSeat({ x: 3, y: 1, z: 0 });
    expect(context.listener.forwardX.value).toBe(-3);
    spatial.setHrtfEnabled(false);
    expect(spatial.createOutput({ position: { x: 1, y: 0, z: 0 } })?.mode).toBe('estereo');
    spatial.detach('carta-1');
    expect(spatial.source('carta-1')).toBeNull();
    spatial.dispose();
    expect(spatial.stats.activeOutputs).toBe(0);
  });

  it('no crea salidas sin audio desbloqueado', () => {
    const runtime = new AudioRuntime({ factory: fakeFactory().factory });
    const spatial = new SpatialAudioEngine(runtime);
    expect(spatial.createOutput({ position: { x: 0, y: 0, z: 0 } })).toBeNull();
  });
});
