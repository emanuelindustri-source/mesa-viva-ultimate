import type { Vec3 } from '../version.js';
import type { CameraPreset } from './presets.js';

export interface ProjectedPoint {
  x: number;
  y: number;
  scale: number;
  depth: number;
}

export interface PlanePoint {
  x: number;
  y: number;
}

export interface ProjectorOptions {
  readonly width: number;
  readonly height: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly baseScale: number;
  readonly preset: CameraPreset;
}

/**
 * Proyección 2.5D determinista: plano de mesa con inclinación, rotación,
 * profundidad por elevación Z y paralaje en píxeles.
 */
export class Projector {
  readonly width: number;
  readonly height: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly baseScale: number;
  private readonly preset: CameraPreset;
  private readonly out: ProjectedPoint = { x: 0, y: 0, scale: 1, depth: 0 };
  private tilt = 0;
  private yaw = 0;
  private zoom = 1;
  private parallaxX = 0;
  private parallaxY = 0;
  private cosTilt = 1;
  private sinTilt = 0;
  private cosYaw = 1;
  private sinYaw = 0;

  constructor(options: ProjectorOptions) {
    this.width = Math.max(1, options.width);
    this.height = Math.max(1, options.height);
    this.centerX = options.centerX;
    this.centerY = options.centerY;
    this.baseScale = Math.max(0.01, options.baseScale);
    this.preset = options.preset;
    this.setPose(options.preset.tiltDeg, options.preset.yawDeg, options.preset.zoom);
  }

  setPose(tiltDeg: number, yawDeg: number, zoom: number): void {
    this.tilt = (clampNumber(tiltDeg, -70, 70) * Math.PI) / 180;
    this.yaw = (clampNumber(yawDeg, -180, 180) * Math.PI) / 180;
    this.zoom = clampNumber(zoom, 0.2, 4);
    this.cosTilt = Math.cos(this.tilt);
    this.sinTilt = Math.sin(this.tilt);
    this.cosYaw = Math.cos(this.yaw);
    this.sinYaw = Math.sin(this.yaw);
  }

  setParallax(xPx: number, yPx: number): void {
    this.parallaxX = clampNumber(xPx, -this.width, this.width);
    this.parallaxY = clampNumber(yPx, -this.height, this.height);
  }

  get pose(): { readonly tiltDeg: number; readonly yawDeg: number; readonly zoom: number } {
    return {
      tiltDeg: (this.tilt * 180) / Math.PI,
      yawDeg: (this.yaw * 180) / Math.PI,
      zoom: this.zoom,
    };
  }

  scaleAt(z: number): number {
    return this.baseScale * this.zoom * this.depthFactor(z);
  }

  /** Multiplicador de tamaño por elevación, independiente del encuadre. */
  depthFactor(z: number): number {
    const distance = this.preset.distance;
    return distance / Math.max(distance * 0.35, distance - z);
  }

  /** Proyecta sin asignar memoria: reutiliza el objeto de salida. */
  projectInto(point: Vec3, out: ProjectedPoint = this.out): ProjectedPoint {
    return this.projectXYZ(point.x, point.y, point.z, out);
  }

  /** Variante con componentes sueltas para el ticker sin objetos temporales. */
  projectXYZ(x: number, y: number, z: number, out: ProjectedPoint = this.out): ProjectedPoint {
    const rx = x * this.cosYaw - y * this.sinYaw;
    const ry = x * this.sinYaw + y * this.cosYaw;
    const scale = this.scaleAt(z);
    out.x = this.centerX + rx * scale + this.parallaxX;
    out.y = this.centerY + (ry * this.cosTilt - z * this.sinTilt) * scale + this.parallaxY;
    out.scale = scale;
    out.depth = z;
    return out;
  }

  project(point: Vec3): ProjectedPoint {
    return this.projectInto(point, { x: 0, y: 0, scale: 1, depth: 0 });
  }

  /** Inverso sobre el plano Z=0, usado por el picking táctil y D-pad. */
  screenToPlane(screenX: number, screenY: number, out: PlanePoint = { x: 0, y: 0 }): PlanePoint {
    const localX = (screenX - this.centerX - this.parallaxX) / (this.baseScale * this.zoom);
    const localY = (screenY - this.centerY - this.parallaxY) / (this.baseScale * this.zoom * this.cosTilt);
    out.x = localX * this.cosYaw + localY * this.sinYaw;
    out.y = -localX * this.sinYaw + localY * this.cosYaw;
    return out;
  }

  /** Polígono de la mesa proyectado, útil para el tapete y los límites. */
  tablePolygon(halfWidth: number, halfHeight: number): readonly PlanePoint[] {
    const corners: readonly Vec3[] = [
      { x: -halfWidth, y: -halfHeight, z: 0 },
      { x: halfWidth, y: -halfHeight, z: 0 },
      { x: halfWidth, y: halfHeight, z: 0 },
      { x: -halfWidth, y: halfHeight, z: 0 },
    ];
    return corners.map((corner) => {
      const projected = this.project(corner);
      return { x: projected.x, y: projected.y };
    });
  }
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
