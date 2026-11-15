import { describe, expect, it } from 'vitest';
import {
  FrameMonitor,
  frameBudget,
  meetsBudget,
} from '../src/perf/frame-monitor.js';
import { estimateAtlasMemory, estimateDrawCalls } from '../src/perf/memory.js';
import { chooseQuality, qualitySettings } from '../src/perf/quality.js';
import { countVisible, isOnScreen } from '../src/render/culling.js';
import { detectRenderCapabilities, planRender } from '../src/render/mode.js';

describe('rendimiento y calidad adaptativa', () => {
  it('calcula FPS, percentiles y presupuesto de frame', () => {
    const monitor = new FrameMonitor(120);
    for (let index = 0; index < 100; index += 1) monitor.record(8.33, { drawCalls: index, memoryBytes: 4 * 1024 * 1024 });
    const summary = monitor.summary();
    expect(summary.fps).toBeGreaterThan(119);
    expect(summary.samples).toBe(100);
    expect(summary.p95FrameMs).toBeCloseTo(8.33, 1);
    expect(summary.memoryMB).toBe(4);
    expect(meetsBudget(summary, frameBudget(120))).toBe(true);
    monitor.record(40);
    expect(monitor.summary().worstFrameMs).toBe(40);
    monitor.reset();
    expect(monitor.summary().samples).toBe(0);
  });

  it('cambia de calidad con histéresis', () => {
    expect(chooseQuality(120, 'alta')).toBe('alta');
    expect(chooseQuality(50, 'alta')).toBe('media');
    expect(chooseQuality(35, 'alta')).toBe('baja');
    expect(chooseQuality(80, 'baja')).toBe('alta');
    expect(chooseQuality(0, 'media')).toBe('media');
    expect(qualitySettings('baja').particles).toBeLessThan(qualitySettings('alta').particles);
  });

  it('elige backend WebGL y cae a DOM sin GPU', () => {
    expect(planRender({ webgl2: true, webgl1: true }).backend).toBe('webgl2');
    expect(planRender({ webgl2: false, webgl1: true }).backend).toBe('webgl1');
    const fallback = planRender({ webgl2: false, webgl1: false });
    expect(fallback.backend).toBe('dom');
    expect(fallback.reason).toMatch(/WebGL/);
    const reduced = planRender({ webgl2: true, webgl1: true, prefersReducedMotion: true });
    expect(reduced.motion).toBe('reduced');
    const lowPower = planRender({ webgl2: true, webgl1: true, saveData: true, deviceMemoryGB: 1 });
    expect(lowPower.quality).toBe('baja');
  });

  it('detecta capacidades y estima memoria/draw calls', () => {
    const capabilities = detectRenderCapabilities({
      createContext: (kind) => (kind === 'webgl2' ? {} : undefined),
      hardwareConcurrency: 4,
    });
    expect(capabilities.webgl2).toBe(true);
    expect(capabilities.webgl1).toBe(false);
    const calls = estimateDrawCalls({ cards: 120, tiles: 50, chips: 30, seats: 6 });
    expect(calls.estimated).toBeGreaterThan(calls.staticLayers);
    const memory = estimateAtlasMemory({
      cacheKey: 'x',
      themeKey: 'y',
      tint: '#000000',
      sheets: [{ index: 0, width: 2048, height: 1024, cells: [] }],
      assetCount: 10,
      totalPixels: 2 * 1024 * 1024,
    });
    expect(memory.megabytes).toBe(8);
    expect(memory.sheets).toBe(1);
  });

  it('descarta entidades fuera de cámara', () => {
    const viewport = { width: 800, height: 600 };
    expect(isOnScreen(400, 300, 100, 100, viewport)).toBe(true);
    expect(isOnScreen(900, 300, 100, 100, viewport)).toBe(false);
    expect(isOnScreen(900, 300, 300, 100, viewport, 200)).toBe(true);
    const items = [
      { x: 10, y: 10, width: 10, height: 10 },
      { x: 2000, y: 2000, width: 10, height: 10 },
    ];
    expect(countVisible(items, viewport)).toBe(1);
  });
});
