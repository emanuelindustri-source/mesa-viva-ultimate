import { type LandingFrame, simulateLanding } from '../math/spring.js';
import { clamp } from '../math/vec3.js';

export interface DragPhysicsConfig {
  readonly maxLift: number;
  readonly baseLift: number;
  readonly liftPerSpeed: number;
  readonly maxTiltDeg: number;
  readonly tiltPerSpeed: number;
  readonly shadowOffsetPerSpeed: number;
  readonly shadowBlurBase: number;
  readonly shadowBlurPerLift: number;
  readonly shadowAlpha: number;
  readonly restitution: number;
}

export const DEFAULT_DRAG_PHYSICS: DragPhysicsConfig = {
  maxLift: 72,
  baseLift: 8,
  liftPerSpeed: 0.022,
  maxTiltDeg: 14,
  tiltPerSpeed: 0.0011,
  shadowOffsetPerSpeed: 0.014,
  shadowBlurBase: 10,
  shadowBlurPerLift: 0.55,
  shadowAlpha: 0.42,
  restitution: 0.42,
};

export interface DragShadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  alpha: number;
  scaleX: number;
  scaleY: number;
}

export interface DragFrame {
  lift: number;
  tiltDeg: number;
  rotationDeg: number;
  scale: number;
  shadow: DragShadow;
}

export interface DragVelocity {
  readonly x: number;
  readonly y: number;
}

export function createDragFrame(): DragFrame {
  return {
    lift: 0,
    tiltDeg: 0,
    rotationDeg: 0,
    scale: 1,
    shadow: { offsetX: 0, offsetY: 0, blur: 8, alpha: 0.4, scaleX: 1, scaleY: 1 },
  };
}

/**
 * Física visual de arrastre: la altura crece con la velocidad, la sombra se
 * separa y difumina, y la carta se inclina en el sentido del movimiento.
 */
export function computeDragFrameInto(
  velocity: DragVelocity,
  out: DragFrame,
  config: DragPhysicsConfig = DEFAULT_DRAG_PHYSICS,
): DragFrame {
  const vx = Number.isFinite(velocity.x) ? velocity.x : 0;
  const vy = Number.isFinite(velocity.y) ? velocity.y : 0;
  const speed = Math.hypot(vx, vy);
  const lift = clamp(config.baseLift + speed * config.liftPerSpeed, 0, config.maxLift);
  const liftRatio = lift / Math.max(1, config.maxLift);
  const tilt = clamp(-vx * config.tiltPerSpeed, -config.maxTiltDeg, config.maxTiltDeg) || 0;
  out.lift = lift;
  out.tiltDeg = tilt;
  out.rotationDeg = tilt * 0.55 || 0;
  out.scale = 1 + liftRatio * 0.07;
  out.shadow.offsetX = clamp(-vx * config.shadowOffsetPerSpeed, -26, 26) * (0.4 + liftRatio);
  out.shadow.offsetY = lift * 0.42;
  out.shadow.blur = config.shadowBlurBase + lift * config.shadowBlurPerLift;
  out.shadow.alpha = clamp(config.shadowAlpha - liftRatio * 0.2, 0.1, 0.55);
  out.shadow.scaleX = 1 + liftRatio * 0.16;
  out.shadow.scaleY = 1 - liftRatio * 0.06;
  return out;
}

export function dragFrameFor(
  velocity: DragVelocity,
  config: DragPhysicsConfig = DEFAULT_DRAG_PHYSICS,
): DragFrame {
  return computeDragFrameInto(velocity, createDragFrame(), config);
}

/** Secuencia de aterrizaje con rebote decreciente y parada determinista. */
export function landingFor(lift: number, config: DragPhysicsConfig = DEFAULT_DRAG_PHYSICS): readonly LandingFrame[] {
  return simulateLanding({
    startHeight: lift,
    restitution: config.restitution,
    gravity: 2300,
    fps: 120,
    maxSeconds: 1.2,
  });
}

/** Muestrea la altura interpolando entre fotogramas, sin depender del FPS. */
export function sampleLanding(frames: readonly LandingFrame[], timeSeconds: number): number {
  if (frames.length === 0) return 0;
  const time = Math.max(0, timeSeconds);
  const first = frames[0];
  if (first === undefined) return 0;
  if (time <= first.time) return first.height;
  for (let index = 1; index < frames.length; index += 1) {
    const previous = frames[index - 1];
    const current = frames[index];
    if (previous === undefined || current === undefined) break;
    if (time <= current.time) {
      const span = Math.max(1e-6, current.time - previous.time);
      const t = (time - previous.time) / span;
      return previous.height + (current.height - previous.height) * t;
    }
  }
  return frames[frames.length - 1]?.height ?? 0;
}
