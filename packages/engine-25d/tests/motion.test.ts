import { describe, expect, it } from 'vitest';
import { createCapacitorMotionSource, normalizeCapacitorPayload } from '../src/motion/capacitor.js';
import { FaceDownDetector, ShakeDetector } from '../src/motion/gestures.js';
import { MotionSensorEngine } from '../src/motion/sensor-engine.js';
import { TiltSmoother, tiltReading, tiltToLight } from '../src/motion/tilt.js';
import { DEFAULT_MOTION_CONFIG, type MotionSample, type MotionSource } from '../src/motion/types.js';

function sample(
  timestampMs: number,
  linearX = 0,
  z = 9.8,
  beta = 0,
  gamma = 0,
): MotionSample {
  return {
    alpha: 0,
    beta,
    gamma,
    acceleration: { x: 0, y: 0, z },
    linearAcceleration: { x: linearX, y: 0, z: 0 },
    rotationRate: null,
    intervalMs: 16,
    timestampMs,
  };
}

function mockSource(available = true, permission: 'granted' | 'denied' | 'unsupported' = 'granted'): {
  readonly source: MotionSource;
  emit: (value: MotionSample) => void;
} {
  let handler: ((value: MotionSample) => void) | null = null;
  return {
    source: {
      kind: 'mock',
      isAvailable: () => available,
      requestPermission: async () => permission,
      subscribe: (next) => {
        handler = next;
        return () => { handler = null; };
      },
    },
    emit: (value) => handler?.(value),
  };
}

describe('motor de sensores de movimiento', () => {
  it('suaviza inclinación, aplica zona muerta y calcula luz', () => {
    expect(tiltReading(1, -1, 2)).toMatchObject({ rollDeg: 0, pitchDeg: 0 });
    expect(tiltReading(90, -90, 0)).toMatchObject({ rollDeg: 45, pitchDeg: -45 });
    const smoother = new TiltSmoother(DEFAULT_MOTION_CONFIG);
    for (let index = 0; index < 120; index += 1) smoother.update(sample(index * 16, 0, 9.8, 20, -10));
    expect(smoother.value.pitchDeg).toBeGreaterThan(10);
    expect(smoother.value.rollDeg).toBeLessThan(-4);
    const light = tiltToLight(smoother.value);
    expect(light.x).toBeGreaterThan(0.15);
    expect(light.x).toBeLessThan(0.85);
    smoother.reset();
    expect(smoother.value.magnitude).toBe(0);
  });

  it('detecta agitado con ventana y enfriamiento', () => {
    const detector = new ShakeDetector(DEFAULT_MOTION_CONFIG);
    expect(detector.push(sample(0, 30)).shake).toBe(true);
    expect(detector.push(sample(30, 30)).shake).toBe(false);
    expect(detector.push(sample(400, 0)).shake).toBe(false);
    expect(detector.push(sample(1000, 30)).shake).toBe(true);
    detector.reset();
    expect(detector.push(sample(2000, 0)).shake).toBe(false);
  });

  it('detecta el teléfono boca abajo tras estabilidad', () => {
    const detector = new FaceDownDetector(DEFAULT_MOTION_CONFIG);
    expect(detector.push(sample(0, 0, -9.8)).isDown).toBe(false);
    expect(detector.push(sample(700, 0, -9.8)).isDown).toBe(true);
    expect(detector.push(sample(800, 0, 9.8)).isDown).toBe(false);
    detector.reset();
    expect(detector.push(sample(900, 0, -9.8)).isDown).toBe(false);
  });

  it('orquesta sensores y degrada sin lanzar errores', async () => {
    const mock = mockSource();
    const engine = new MotionSensorEngine(mock.source);
    const tilts: number[] = [];
    const faces: boolean[] = [];
    engine.onTilt((tilt) => tilts.push(tilt.x));
    engine.onFaceDown((down) => faces.push(down));
    const status = await engine.start();
    expect(status.available).toBe(true);
    mock.emit(sample(0, 0, -9.8, 10, 10));
    mock.emit(sample(700, 0, -9.8, 10, 10));
    expect(tilts.length).toBe(2);
    expect(faces).toEqual([true]);
    engine.stop();
    engine.dispose();

    const unavailable = new MotionSensorEngine(mockSource(false).source);
    expect((await unavailable.start()).permission).toBe('unsupported');
    const denied = new MotionSensorEngine(mockSource(true, 'denied').source);
    expect((await denied.start()).available).toBe(false);
  });

  it('apaga sensores sin muestras mediante watchdog', async () => {
    const mock = mockSource();
    const engine = new MotionSensorEngine(mock.source);
    await engine.start();
    engine.armWatchdog(220);
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(engine.currentStatus.available).toBe(false);
    engine.dispose();
  });

  it('normaliza el puente Capacitor y libera el listener', async () => {
    const payload = normalizeCapacitorPayload({
      alpha: 10,
      beta: 20,
      gamma: 30,
      acceleration: { x: 1, y: 2, z: 3 },
      accelerationIncludingGravity: { x: 4, y: 5, z: 9.8 },
      interval: 20,
      timestamp: 99,
    });
    expect(payload).toMatchObject({ alpha: 10, beta: 20, gamma: 30, intervalMs: 20, timestampMs: 99 });
    expect(payload.acceleration.z).toBe(9.8);
    expect(payload.linearAcceleration?.x).toBe(1);
    let removed = false;
    let handler: ((value: unknown) => void) | null = null;
    const source = createCapacitorMotionSource({
      addListener: (_event, next) => {
        handler = (value) => next(value as Parameters<typeof next>[0]);
        return { remove: () => { removed = true; } };
      },
      requestPermissions: async () => ({ motion: 'granted' }),
    });
    expect(await source.requestPermission()).toBe('granted');
    const consumed: MotionSample[] = [];
    const unsubscribe = source.subscribe((value) => consumed.push(value));
    handler?.({ alpha: 1, beta: 2, gamma: 3, accelerationIncludingGravity: { x: 0, y: 0, z: 9.8 } });
    expect(consumed).toHaveLength(1);
    unsubscribe();
    expect(removed).toBe(true);
  });
});
