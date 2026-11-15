import type { ViewportInfo } from '@mesa-viva/design-system';
import { describe, expect, it } from 'vitest';
import { paneAt, stageLayoutFor } from '../src/layout/stage-layout.js';

const VIEWPORTS: Readonly<Record<string, ViewportInfo>> = {
  movil: { width: 390, height: 844, devicePixelRatio: 3 },
  tablet: { width: 820, height: 1180 },
  laptop: { width: 1440, height: 900 },
  televisor: { width: 1920, height: 1080, isTelevision: true, platform: 'tv' },
  ultrawide: { width: 2560, height: 1080 },
  plegable: {
    width: 884,
    height: 1104,
    isFoldable: true,
    hinge: { posture: 'book', orientation: 'vertical', size: 24, isSeparating: true },
  },
};

describe('layout de escena para los seis formatos', () => {
  it('calcula un encuadre válido y la cámara correcta por formato', () => {
    for (const [name, viewport] of Object.entries(VIEWPORTS)) {
      const layout = stageLayoutFor(viewport);
      expect(layout.plan.format).toBe(name);
      expect(layout.camera.format).toBe(name);
      expect(layout.baseScale).toBeGreaterThan(0);
      expect(Number.isFinite(layout.baseScale)).toBe(true);
      expect(layout.centerX).toBeGreaterThan(0);
      expect(layout.centerY).toBeGreaterThan(0);
      expect(layout.cardWidth).toBeGreaterThan(20);
      expect(layout.cardHeight).toBeGreaterThan(layout.cardWidth);
      expect(layout.pixelRatio).toBeGreaterThanOrEqual(1);
      expect(layout.pixelRatio).toBeLessThanOrEqual(3);
      expect(layout.panes.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('respeta el overscan del televisor y el área segura', () => {
    const layout = stageLayoutFor(VIEWPORTS.televisor ?? { width: 1920, height: 1080 });
    expect(layout.safe.left).toBeGreaterThanOrEqual(48);
    expect(layout.centerX).toBeGreaterThan(layout.safe.left);
    expect(layout.centerX).toBeLessThan(layout.width - layout.safe.right);
  });

  it('divide la mesa del plegable en dos paneles con bisagra', () => {
    const layout = stageLayoutFor(VIEWPORTS.plegable ?? { width: 884, height: 1104 });
    expect(layout.plan.splitView.enabled).toBe(true);
    expect(layout.panes).toHaveLength(2);
    expect(layout.hinge?.size).toBe(24);
    const first = paneAt(layout, 0);
    const second = paneAt(layout, 1);
    expect(first.x).toBe(0);
    expect(second.x).toBeGreaterThan(first.width);
    expect(paneAt(layout, 9)).toBe(first);
  });

  it('rechaza viewports inválidos y limita el pixel ratio', () => {
    expect(() => stageLayoutFor({ width: 0, height: 100 })).toThrow();
    const layout = stageLayoutFor({ width: 800, height: 600, devicePixelRatio: 20 });
    expect(layout.pixelRatio).toBe(3);
  });
});
