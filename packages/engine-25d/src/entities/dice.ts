import { createSeededRandom } from '../math/random.js';
import { clamp } from '../math/vec3.js';

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface PipPosition {
  readonly x: number;
  readonly y: number;
}

const CORNERS: readonly PipPosition[] = [
  { x: 0.24, y: 0.24 },
  { x: 0.76, y: 0.24 },
  { x: 0.24, y: 0.76 },
  { x: 0.76, y: 0.76 },
];

/** Posiciones normalizadas de los pips de un dado de seis caras. */
export const PIP_LAYOUTS: Readonly<Record<DieValue, readonly PipPosition[]>> = {
  1: [{ x: 0.5, y: 0.5 }],
  2: [
    { x: 0.26, y: 0.26 },
    { x: 0.74, y: 0.74 },
  ],
  3: [
    { x: 0.24, y: 0.24 },
    { x: 0.5, y: 0.5 },
    { x: 0.76, y: 0.76 },
  ],
  4: CORNERS,
  5: [...CORNERS, { x: 0.5, y: 0.5 }],
  6: [
    { x: 0.26, y: 0.22 },
    { x: 0.74, y: 0.22 },
    { x: 0.26, y: 0.5 },
    { x: 0.74, y: 0.5 },
    { x: 0.26, y: 0.78 },
    { x: 0.74, y: 0.78 },
  ],
};

export interface DiceRollPlan {
  readonly face: DieValue;
  readonly spinDeg: number;
  readonly settleDeg: number;
  readonly bounceScale: number;
  readonly durationMs: number;
  readonly spinDurationMs: number;
}

export function clampDie(value: number): DieValue {
  const rounded = Math.round(Number.isFinite(value) ? value : 1);
  return clamp(rounded, 1, 6) as DieValue;
}

/**
 * Plan de tirada con giro físico: varias vueltas, asentamiento determinista y
 * un pequeño rebote. La cara final la decide el motor de reglas, no el azar visual.
 */
export function diceRollPlan(face: number, seed: number, reducedMotion = false): DiceRollPlan {
  const value = clampDie(face);
  const random = createSeededRandom(seed);
  const turns = reducedMotion ? 0 : 2 + random.integer(0, 1);
  const spin = turns * 360 + random.integer(-45, 45);
  const settle = random.range(-7, 7);
  return {
    face: value,
    spinDeg: spin,
    settleDeg: settle,
    bounceScale: reducedMotion ? 1 : random.range(0.82, 0.92),
    durationMs: reducedMotion ? 120 : 720,
    spinDurationMs: reducedMotion ? 60 : 520,
  };
}

/** Valor de una tirada de dados determinista para pruebas y bots. */
export function rollDie(seed: number): DieValue {
  return (createSeededRandom(seed).integer(1, 6) as DieValue);
}
