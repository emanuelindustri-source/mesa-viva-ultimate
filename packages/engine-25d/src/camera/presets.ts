import type { ScreenFormat } from '@mesa-viva/design-system';
import { clamp } from '../math/vec3.js';

/** Cámara 2.5D específica de cada uno de los seis formatos de pantalla. */
export interface CameraPreset {
  readonly format: ScreenFormat;
  /** Ángulo vertical de la mesa en grados. */
  readonly tiltDeg: number;
  readonly yawDeg: number;
  readonly zoom: number;
  /** Distancia de cámara usada por la proyección de profundidad. */
  readonly distance: number;
  /** Sensibilidad del paralaje por movimiento del dispositivo o puntero. */
  readonly parallax: number;
  /** Fracción del área segura que ocupa la mesa. */
  readonly tableFill: number;
  /** Multiplicador del tamaño de cartas y fichas. */
  readonly entityScale: number;
}

export const CAMERA_PRESETS: Readonly<Record<ScreenFormat, CameraPreset>> = {
  movil: {
    format: 'movil',
    tiltDeg: 16,
    yawDeg: 0,
    zoom: 0.92,
    distance: 1150,
    parallax: 0.55,
    tableFill: 0.9,
    entityScale: 0.82,
  },
  tablet: {
    format: 'tablet',
    tiltDeg: 18,
    yawDeg: 0,
    zoom: 1,
    distance: 1250,
    parallax: 0.7,
    tableFill: 0.86,
    entityScale: 1,
  },
  televisor: {
    format: 'televisor',
    tiltDeg: 20,
    yawDeg: 0,
    zoom: 1.08,
    distance: 1500,
    parallax: 0.85,
    tableFill: 0.8,
    entityScale: 1.25,
  },
  laptop: {
    format: 'laptop',
    tiltDeg: 18,
    yawDeg: 0,
    zoom: 1,
    distance: 1300,
    parallax: 0.4,
    tableFill: 0.84,
    entityScale: 1.05,
  },
  ultrawide: {
    format: 'ultrawide',
    tiltDeg: 17,
    yawDeg: 0,
    zoom: 1.05,
    distance: 1400,
    parallax: 0.35,
    tableFill: 0.76,
    entityScale: 1.1,
  },
  plegable: {
    format: 'plegable',
    tiltDeg: 15,
    yawDeg: 0,
    zoom: 0.96,
    distance: 1200,
    parallax: 0.65,
    tableFill: 0.88,
    entityScale: 0.95,
  },
};

export function cameraForFormat(format: ScreenFormat): CameraPreset {
  return CAMERA_PRESETS[format] ?? CAMERA_PRESETS.tablet;
}

/** Convierte una lectura de giroscopio en un desplazamiento de cámara acotado. */
export function gyroParallax(rollDeg: number, pitchDeg: number, sensitivity: number): { x: number; y: number } {
  const limit = clamp(sensitivity, 0, 1.5);
  const x = clamp(rollDeg / 45, -1, 1) * limit;
  const y = clamp(pitchDeg / 45, -1, 1) * limit;
  return { x, y };
}
