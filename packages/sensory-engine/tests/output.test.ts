import { describe, expect, it } from 'vitest';
import { channelIndexForZone, MODE_LAYOUTS, resolveOutputMode, zonePan, zonePosition } from '../src/output/layouts.js';
import { createWoodRoomImpulse, impulseRms } from '../src/output/room-impulse.js';
import { MultiChannelRouter } from '../src/output/router.js';
import { StudioMasterBus } from '../src/output/studio-master.js';
import { type FakeChannelMerger, type FakeCompressor, FakeContext, type FakeConvolver } from './fakes-audio.js';

function master(context: FakeContext): StudioMasterBus {
  return new StudioMasterBus(context, context.destination, { seed: 3, reverbSeconds: 1.2 });
}

describe('selección de salida multicanal', () => {
  it('detecta el máximo del dispositivo y degrada con seguridad', () => {
    expect(resolveOutputMode('auto', 8).active).toBe('7.1');
    expect(resolveOutputMode('auto', 6).active).toBe('5.1');
    expect(resolveOutputMode('auto', 3).active).toBe('2.1');
    expect(resolveOutputMode('auto', 2).active).toBe('binaural');
    const fallback = resolveOutputMode('7.1', 6);
    expect(fallback.active).toBe('5.1');
    expect(fallback.fallback).toBe(true);
    expect(resolveOutputMode('5.2', 6).active).toBe('5.2');
    expect(resolveOutputMode('2.1', 2).active).toBe('binaural');
  });

  it('mapea zonas a canales discretos y LFE compartido', () => {
    expect(MODE_LAYOUTS['5.1'].channels).toBe(6);
    expect(MODE_LAYOUTS['5.2'].subwoofers).toBe(2);
    expect(channelIndexForZone('5.1', 'center')).toBe(2);
    expect(channelIndexForZone('5.1', 'rear-left')).toBe(4);
    expect(channelIndexForZone('7.1', 'rear-right')).toBe(7);
    expect(channelIndexForZone('5.2', 'lfe-2')).toBe(3);
    expect(channelIndexForZone('2.1', 'lfe')).toBe(2);
    expect(channelIndexForZone('binaural', 'center')).toBe(-1);
    expect(zonePan('rear-right')).toBe(1);
    expect(zonePan('center')).toBe(0);
    expect(zonePosition('center').z).toBeLessThan(0);
  });
});

describe('sala de madera y masterización', () => {
  it('genera un impulso determinista y audible', () => {
    const context = new FakeContext();
    const first = createWoodRoomImpulse(context, 9, 0.8, 2);
    const second = createWoodRoomImpulse(context, 9, 0.8, 2);
    expect(first.numberOfChannels).toBe(2);
    expect(first.duration).toBeCloseTo(0.8, 5);
    expect(impulseRms(first)).toBeGreaterThan(0.01);
    expect(first.getChannelData(0)[100]).toBe(second.getChannelData(0)[100]);
  });

  it('conecta limitador brickwall, convolución y salida controlada', () => {
    const context = new FakeContext(48_000, 8);
    const bus = master(context);
    expect(bus.status.limiterThresholdDb).toBe(-1);
    expect(bus.status.limiterRatio).toBe(20);
    expect(bus.status.reverbSeconds).toBeCloseTo(1.2, 5);
    expect(bus.status.reverbRms).toBeGreaterThan(0);
    const compressor = context.getByKind('compressor')[0] as FakeCompressor | undefined;
    const convolver = context.getByKind('convolver')[0] as FakeConvolver | undefined;
    expect(compressor?.threshold.value).toBe(-1);
    expect(convolver?.buffer).not.toBeNull();
    expect(bus.input.connections[0]).toBe(compressor);
    bus.setVolume(0.4);
    bus.setMuted(true);
    expect(bus.status.muted).toBe(true);
    bus.dispose();
  });
});

describe('enrutamiento 7.1 y 5.2', () => {
  it('crea ocho canales discretos y asigna cada instrumento', () => {
    const context = new FakeContext(48_000, 8);
    const bus = master(context);
    const router = new MultiChannelRouter(context, bus, { mode: '7.1' });
    expect(router.status.active).toBe('7.1');
    expect(router.status.channels).toBe(8);
    expect(context.destination.channelCount).toBe(8);
    expect(context.destination.channelInterpretation).toBe('discrete');
    const merger = context.getByKind('channel-merger')[0] as FakeChannelMerger | undefined;
    expect(merger?.numberOfInputs).toBe(8);
    expect(merger?.channelInterpretation).toBe('discrete');
    const center = router.createBus({ target: 'center' });
    const lfe = router.createBus({ target: 'lfe' });
    const rear = router.createBus({ target: 'rear', pan: 1, reverb: 0.4 });
    const front = router.createBus({ target: 'front', pan: 0 });
    const bank = router.channelBank;
    expect(bank?.input(2)?.incoming.length).toBeGreaterThan(0);
    expect(bank?.input(3)?.incoming.length).toBeGreaterThan(0);
    expect(bank?.input(7)?.incoming.length).toBeGreaterThan(0);
    expect(bank?.input(0)?.incoming.length).toBeGreaterThan(0);
    expect(center.route.target).toBe('center');
    expect(lfe.route.target).toBe('lfe');
    expect(rear.route.reverb).toBe(0.4);
    expect(front.route.pan).toBe(0);
    expect(router.activeBuses).toBe(4);
    router.dispose();
    bus.dispose();
  });

  it('soporta 2.1 y 5.2 con LFE dedicado', () => {
    const context = new FakeContext(48_000, 8);
    const bus = master(context);
    const router = new MultiChannelRouter(context, bus, { mode: '2.1' });
    expect(router.status.channels).toBe(3);
    expect(context.destination.channelCount).toBe(3);
    const lfe = router.createBus({ target: 'lfe' });
    expect(router.channelBank?.input(2)?.incoming.length).toBeGreaterThan(0);
    expect(lfe.input.connections.length).toBeGreaterThan(0);
    router.dispose();
    const five = new MultiChannelRouter(context, bus, { mode: '5.2' });
    expect(five.status.channels).toBe(6);
    expect(MODE_LAYOUTS['5.2'].subwoofers).toBe(2);
    five.createBus({ target: 'lfe' });
    expect(five.channelBank?.input(3)?.incoming.length).toBeGreaterThan(0);
    five.dispose();
    bus.dispose();
  });
});

describe('modo estéreo 2.0', () => {
  it('usa paneo clásico y mantiene el LFE filtrado', () => {
    const context = new FakeContext(48_000, 2);
    const bus = master(context);
    const router = new MultiChannelRouter(context, bus, { mode: 'stereo' });
    expect(router.status.active).toBe('stereo');
    router.createBus({ target: 'front', pan: -0.5 });
    router.createBus({ target: 'lfe' });
    expect(context.getByKind('stereo-panner').length).toBeGreaterThanOrEqual(2);
    expect(router.binauralLayer).toBeNull();
    router.dispose();
    bus.dispose();
  });
});

describe('modo binaural 2.0', () => {
  it('activa HRTF, ondas alpha/beta/theta y buses 3D', () => {
    const context = new FakeContext(48_000, 2);
    const bus = master(context);
    const router = new MultiChannelRouter(context, bus, { mode: 'auto' });
    expect(router.status.active).toBe('binaural');
    expect(router.status.channels).toBe(2);
    expect(router.binauralLayer?.bandFrequencies.alpha).toEqual([210, 220]);
    const oscillators = context.getByKind('oscillator');
    expect(oscillators.length).toBeGreaterThanOrEqual(6);
    const center = router.createBus({ target: 'center' });
    const lfe = router.createBus({ target: 'lfe' });
    expect(center.input).toBeDefined();
    expect(lfe.input).toBeDefined();
    expect(context.getByKind('panner').length).toBeGreaterThanOrEqual(2);
    router.setBinauralEnabled(false);
    router.setBinauralIntensity(0.2);
    router.dispose();
    bus.dispose();
  });
});
