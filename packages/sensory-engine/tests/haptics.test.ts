import { describe, expect, it, vi } from 'vitest';
import { createCapacitorHapticsBridge } from '../src/haptics/capacitor.js';
import { HapticEngine } from '../src/haptics/engine.js';
import {
  HAPTIC_PATTERNS,
  HAPTIC_PRIMITIVE_SPECS,
  hapticPattern,
  pulseDuration,
  toVibrationPattern,
} from '../src/haptics/patterns.js';
import { detectWebVibration } from '../src/haptics/web.js';
import { HAPTIC_GESTURES, HAPTIC_PRIMITIVES } from '../src/version.js';
import { fakeHaptics, fakeWebHaptics } from './fakes-haptics.js';

describe('motor háptico', () => {
  it('define las cuatro primitivas y nueve gestos válidos', () => {
    expect(HAPTIC_PRIMITIVES).toEqual(['tick', 'click', 'thud', 'spin']);
    expect(Object.keys(HAPTIC_GESTURES)).toHaveLength(9);
    const validas = new Set<string>(HAPTIC_PRIMITIVES);
    for (const gesto of Object.values(HAPTIC_GESTURES)) {
      for (const primitiva of gesto) expect(validas.has(primitiva)).toBe(true);
    }
    expect(HAPTIC_GESTURES.lanzarDados).toContain('spin');
    expect(HAPTIC_GESTURES.victoria).toContain('thud');
  });

  it('cada gesto tiene un patrón de precisión ordenado', () => {
    for (const gesture of Object.keys(HAPTIC_PATTERNS) as (keyof typeof HAPTIC_PATTERNS)[]) {
      const pattern = hapticPattern(gesture);
      expect(pattern.gesture).toBe(gesture);
      expect(pattern.pulses.length).toBeGreaterThan(0);
      expect(pattern.totalMs).toBeGreaterThan(0);
      for (const pulse of pattern.pulses) {
        expect(pulse.durationMs).toBe(HAPTIC_PRIMITIVE_SPECS[pulse.primitive].durationMs);
        expect(pulse.intensity).toBeGreaterThan(0);
      }
    }
    expect(hapticPattern('colocarFicha').totalMs).toBe(74);
    expect(toVibrationPattern(hapticPattern('colocarFicha'))).toEqual([12, 34, 28]);
    expect(pulseDuration(hapticPattern('derrota').pulses[0] as never, 0)).toBe(17);
  });

  it('dispara el plugin nativo y respeta los retrasos', () => {
    const fake = fakeHaptics();
    const scheduled: (() => void)[] = [];
    const engine = new HapticEngine({
      plugin: fake.plugin,
      intensity: 1,
      schedule: (callback) => {
        scheduled.push(callback);
        return scheduled.length;
      },
      cancel: () => undefined,
    });
    const playback = engine.play('colocarFicha');
    expect(playback?.source).toBe('capacitor');
    expect(playback?.gesture).toBe('colocarFicha');
    expect(fake.impacts).toEqual(['MEDIUM']);
    expect(scheduled).toHaveLength(1);
    scheduled.shift()?.();
    expect(fake.impacts).toEqual(['MEDIUM', 'HEAVY']);
    const dice = engine.play('lanzarDados');
    expect(dice?.gesture).toBe('lanzarDados');
    expect(fake.vibrations).toEqual([38]);
  });

  it('usa selectionChanged, notificaciones y celebración nativa', () => {
    const fake = fakeHaptics();
    const bridge = createCapacitorHapticsBridge(fake.plugin);
    bridge.playPulse(HAPTIC_PATTERNS.turno.pulses[0] as never, 1);
    expect(fake.selections).toBe(1);
    bridge.celebrate('victoria');
    bridge.celebrate('derrota');
    bridge.celebrate('alerta');
    expect(fake.notifications).toEqual(['SUCCESS', 'ERROR', 'WARNING']);
  });

  it('cae a vibración web y respeta desactivación, silencio y movimiento reducido', () => {
    const web = fakeWebHaptics();
    const engine = new HapticEngine({ vibrate: web.vibrate });
    expect(engine.capabilities).toEqual({ available: true, source: 'web', supportsPatterns: true });
    expect(engine.play('barajar')?.source).toBe('web');
    expect(web.calls).toHaveLength(1);
    expect(Array.isArray(web.calls[0])).toBe(true);

    engine.configure({ enabled: false });
    expect(engine.play('barajar')).toBeNull();
    engine.configure({ enabled: true, reducedMotion: true });
    expect(engine.play('barajar')).toBeNull();
    engine.configure({ reducedMotion: false, silent: true });
    expect(engine.play('barajar')).toBeNull();
    engine.configure({ silent: false, intensity: 0 });
    expect(engine.play('barajar')).toBeNull();

    const rejected = fakeWebHaptics(false);
    expect(new HapticEngine({ vibrate: rejected.vibrate }).play('turno')).toBeNull();
    expect(new HapticEngine({ vibrate: null }).capabilities.available).toBe(false);
  });

  it('cancela patrones y detecta la vibración del navegador', () => {
    const web = fakeWebHaptics();
    const engine = new HapticEngine({ vibrate: web.vibrate });
    engine.play('turno');
    engine.stop();
    expect(web.calls.at(-1)).toBe(0);
    engine.dispose();

    const vibrate = vi.fn(() => true);
    vi.stubGlobal('navigator', { vibrate });
    const detected = detectWebVibration();
    expect(detected?.([12, 30])).toBe(true);
    expect(vibrate).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
