import { createTheme, SCREEN_FORMATS } from '@mesa-viva/design-system';
import { describe, expect, it } from 'vitest';
import { CameraRig } from '../src/camera/camera-rig.js';
import { CAMERA_PRESETS, cameraForFormat, gyroParallax } from '../src/camera/presets.js';
import { Projector } from '../src/camera/projector.js';

const theme = createTheme();

describe('cámara y proyección 2.5D', () => {
  it('define una cámara válida para los seis formatos', () => {
    for (const format of SCREEN_FORMATS) {
      const preset = cameraForFormat(format);
      expect(preset.format).toBe(format);
      expect(preset.tiltDeg).toBeGreaterThan(0);
      expect(preset.tiltDeg).toBeLessThan(45);
      expect(preset.zoom).toBeGreaterThan(0);
      expect(preset.distance).toBeGreaterThan(100);
      expect(Number.isFinite(preset.parallax)).toBe(true);
      expect(CAMERA_PRESETS[format]).toBe(preset);
    }
  });

  it('proyecta el centro y aplica profundidad Z', () => {
    const projector = new Projector({
      width: 800,
      height: 600,
      centerX: 400,
      centerY: 300,
      baseScale: 0.5,
      preset: cameraForFormat('tablet'),
    });
    const center = projector.project({ x: 0, y: 0, z: 0 });
    expect(center.x).toBeCloseTo(400);
    expect(center.y).toBeCloseTo(300);
    expect(center.scale).toBeCloseTo(0.5);
    const lifted = projector.project({ x: 0, y: 0, z: 80 });
    expect(lifted.scale).toBeGreaterThan(center.scale);
    expect(lifted.y).toBeLessThan(center.y);
    expect(projector.depthFactor(0)).toBe(1);
    expect(projector.depthFactor(100)).toBeGreaterThan(1);
  });

  it('invierte la proyección sobre el plano de la mesa', () => {
    const projector = new Projector({
      width: 1024,
      height: 768,
      centerX: 512,
      centerY: 384,
      baseScale: 0.7,
      preset: cameraForFormat('laptop'),
    });
    for (const point of [{ x: 0, y: 0 }, { x: 120, y: -80 }, { x: -240, y: 160 }]) {
      const projected = projector.project({ ...point, z: 0 });
      const plane = projector.screenToPlane(projected.x, projected.y);
      expect(plane.x).toBeCloseTo(point.x, 5);
      expect(plane.y).toBeCloseTo(point.y, 5);
    }
    expect(projector.tablePolygon(100, 50)).toHaveLength(4);
    projector.setPose(30, 15, 1.4);
    expect(projector.pose.tiltDeg).toBeCloseTo(30);
    expect(projector.pose.zoom).toBeCloseTo(1.4);
  });

  it('suaviza giroscopio, paralaje y sacudida con movimiento reducido', () => {
    const rig = new CameraRig({ preset: cameraForFormat('movil'), width: 390, height: 844 });
    rig.setGyro(0.8, -0.4);
    for (let index = 0; index < 120; index += 1) rig.update(1 / 60);
    expect(rig.state.tilt).toBeLessThan(0);
    expect(rig.state.yaw).toBeGreaterThan(0);
    rig.shake(1);
    expect(rig.state.shaking).toBe(true);
    for (let index = 0; index < 120; index += 1) rig.update(1 / 60);
    expect(rig.state.shaking).toBe(false);
    rig.setReducedMotion(true);
    rig.setGyro(1, 1);
    rig.update(1 / 60);
    expect(rig.state.parallaxX).toBe(0);
  });

  it('acota la sensibilidad del paralaje', () => {
    expect(gyroParallax(90, -90, 1)).toEqual({ x: 1, y: -1 });
    expect(gyroParallax(0, 0, 0.5)).toEqual({ x: 0, y: 0 });
    expect(gyroParallax(10, 10, 5).x).toBeLessThanOrEqual(1.5);
    expect(theme.mode).toBe('light');
  });
});
