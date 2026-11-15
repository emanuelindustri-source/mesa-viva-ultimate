import { clamp } from './vec3.js';

export interface SpringState {
  readonly value: number;
  readonly velocity: number;
}

export interface SpringConfig {
  readonly stiffness: number;
  readonly damping: number;
  readonly mass: number;
}

/** Resorte crítico por defecto: aterrizaje suave sin oscilación infinita. */
export const LANDING_SPRING: SpringConfig = { stiffness: 180, damping: 24, mass: 1 };

export interface LandingOptions {
  readonly startHeight: number;
  readonly restitution?: number;
  readonly gravity?: number;
  readonly fps?: number;
  readonly maxSeconds?: number;
  readonly sleepSpeed?: number;
}

export interface LandingFrame {
  readonly time: number;
  readonly height: number;
  readonly velocity: number;
  readonly bouncing: boolean;
}

/** Un paso semi-implícito de Euler, estable para dt pequeños y determinista. */
export function stepSpring(
  state: SpringState,
  target: number,
  dtSeconds: number,
  config: SpringConfig = LANDING_SPRING,
): SpringState {
  const dt = clamp(dtSeconds, 0, 0.05);
  const acceleration = (-config.stiffness * (state.value - target) - config.damping * state.velocity) / config.mass;
  const velocity = state.velocity + acceleration * dt;
  return { value: state.value + velocity * dt, velocity };
}

/**
 * Simula la caída y los rebotes de una carta hasta que se detiene. Devuelve
 * fotogramas a una tasa fija para que las pruebas visuales sean reproducibles.
 */
export function simulateLanding(options: LandingOptions): readonly LandingFrame[] {
  const start = Number.isFinite(options.startHeight) ? Math.max(0, options.startHeight) : 0;
  const restitution = clamp(options.restitution ?? 0.42, 0, 0.95);
  const gravity = Math.max(1, options.gravity ?? 2200);
  const fps = clamp(Math.round(options.fps ?? 60), 30, 240);
  const maxFrames = Math.max(1, Math.round((options.maxSeconds ?? 1.4) * fps));
  const sleepSpeed = Math.max(0.5, options.sleepSpeed ?? 12);
  const dt = 1 / fps;
  const frames: LandingFrame[] = [{ time: 0, height: start, velocity: 0, bouncing: false }];
  let height = start;
  let velocity = 0;
  for (let frame = 1; frame <= maxFrames; frame += 1) {
    velocity -= gravity * dt;
    height += velocity * dt;
    let bouncing = false;
    if (height <= 0) {
      height = 0;
      if (Math.abs(velocity) <= sleepSpeed) {
        frames.push({ time: frame * dt, height: 0, velocity: 0, bouncing: false });
        break;
      }
      velocity = -velocity * restitution;
      bouncing = true;
    }
    frames.push({ time: frame * dt, height, velocity, bouncing });
    if (height === 0 && Math.abs(velocity) <= sleepSpeed) break;
  }
  return frames;
}

/** Altura del rebote en un instante concreto de la simulación. */
export function landingHeightAt(frames: readonly LandingFrame[], timeSeconds: number): number {
  if (frames.length === 0) return 0;
  const first = frames[0];
  const last = frames[frames.length - 1];
  if (first === undefined || last === undefined) return 0;
  if (timeSeconds <= first.time) return first.height;
  if (timeSeconds >= last.time) return last.height;
  const index = Math.min(frames.length - 2, Math.floor(timeSeconds * 60));
  const frame = frames[Math.max(0, index)] ?? first;
  return frame.height;
}
