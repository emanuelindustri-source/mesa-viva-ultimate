import { describe, expect, it } from 'vitest';
import { DragGesture } from '../src/drag/gesture.js';
import {
  computeDragFrameInto,
  createDragFrame,
  dragFrameFor,
  landingFor,
  sampleLanding,
} from '../src/drag/physics.js';

describe('físicas de arrastre y aterrizaje', () => {
  it('eleva la carta y proyecta sombra según la velocidad', () => {
    const still = dragFrameFor({ x: 0, y: 0 });
    expect(still.lift).toBeGreaterThan(0);
    expect(still.tiltDeg).toBe(0);
    const fast = dragFrameFor({ x: 2400, y: 600 });
    expect(fast.lift).toBeGreaterThan(still.lift);
    expect(fast.tiltDeg).toBeLessThan(0);
    expect(fast.rotationDeg).toBeLessThan(0);
    expect(fast.shadow.offsetX).toBeLessThan(0);
    expect(fast.shadow.blur).toBeGreaterThan(still.shadow.blur);
    expect(fast.shadow.alpha).toBeLessThan(still.shadow.alpha);
    expect(fast.scale).toBeGreaterThan(1);
  });

  it('reutiliza el objeto de salida sin asignar un frame nuevo', () => {
    const frame = createDragFrame();
    const result = computeDragFrameInto({ x: -1200, y: 0 }, frame);
    expect(result).toBe(frame);
    expect(frame.tiltDeg).toBeGreaterThan(0);
    expect(frame.shadow.offsetX).toBeGreaterThan(0);
  });

  it('aterriza con rebotes decrecientes y termina en reposo', () => {
    const frames = landingFor(72);
    expect(frames.length).toBeGreaterThan(10);
    expect(frames[0]?.height).toBe(72);
    expect(frames[frames.length - 1]?.height).toBe(0);
    const peaks = frames.filter((frame) => frame.bouncing).map((frame) => frame.height);
    expect(peaks.length).toBeGreaterThanOrEqual(2);
    for (let index = 1; index < peaks.length; index += 1) {
      expect(peaks[index] ?? 0).toBeLessThanOrEqual(peaks[index - 1] ?? 0);
    }
    const maxTime = frames[frames.length - 1]?.time ?? 0;
    expect(sampleLanding(frames, 0)).toBe(72);
    expect(sampleLanding(frames, maxTime)).toBe(0);
    expect(sampleLanding([], 1)).toBe(0);
  });

  it('mide velocidad con umbral de arrastre y cancela limpiamente', () => {
    const gesture = new DragGesture({ thresholdPx: 8, sampleWindow: 4 });
    gesture.begin({ x: 100, y: 100, timeMs: 0 });
    expect(gesture.move({ x: 103, y: 100, timeMs: 16 })).toBe(false);
    expect(gesture.move({ x: 140, y: 100, timeMs: 32 })).toBe(true);
    expect(gesture.velocity().x).toBeGreaterThan(0);
    const result = gesture.end({ x: 150, y: 110, timeMs: 48 });
    expect(result?.dragged).toBe(true);
    expect(result?.velocity.x).toBeGreaterThan(0);
    expect(gesture.isActive).toBe(false);
    gesture.begin({ x: 0, y: 0, timeMs: 0 });
    gesture.cancel();
    expect(gesture.end({ x: 0, y: 0, timeMs: 1 })).toBeNull();
  });
});
