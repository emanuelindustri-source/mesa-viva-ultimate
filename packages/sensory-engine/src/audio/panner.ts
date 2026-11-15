import { clamp } from '../types.js';
import type { AudioContextLike, AudioListenerLike, PannerNodeLike } from './contracts.js';
import { rampSignedParam, type SpatialPoint, setSignedParam } from './params.js';

export interface PannerConfig {
  readonly refDistance: number;
  readonly maxDistance: number;
  readonly rolloffFactor: number;
}

export function writePannerPosition(
  panner: PannerNodeLike,
  position: SpatialPoint,
  time: number,
  fadeSeconds: number,
): void {
  if (fadeSeconds <= 0) {
    setSignedParam(panner.positionX, position.x, time);
    setSignedParam(panner.positionY, position.y, time);
    setSignedParam(panner.positionZ, position.z, time);
    return;
  }
  rampSignedParam(panner.positionX, position.x, time, fadeSeconds);
  rampSignedParam(panner.positionY, position.y, time, fadeSeconds);
  rampSignedParam(panner.positionZ, position.z, time, fadeSeconds);
}

export function createHrtfPanner(
  context: AudioContextLike,
  position: SpatialPoint,
  config: PannerConfig,
): PannerNodeLike {
  const panner = context.createPanner();
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = config.refDistance;
  panner.maxDistance = config.maxDistance;
  panner.rolloffFactor = config.rolloffFactor;
  writePannerPosition(panner, position, context.currentTime, 0);
  return panner;
}

export function writeListener(
  listener: AudioListenerLike,
  position: SpatialPoint,
  forward: SpatialPoint,
  up: SpatialPoint,
  time: number,
): void {
  setSignedParam(listener.positionX, position.x, time);
  setSignedParam(listener.positionY, position.y, time);
  setSignedParam(listener.positionZ, position.z, time);
  setSignedParam(listener.forwardX, forward.x, time);
  setSignedParam(listener.forwardY, forward.y, time);
  setSignedParam(listener.forwardZ, forward.z, time);
  setSignedParam(listener.upX, up.x, time);
  setSignedParam(listener.upY, up.y, time);
  setSignedParam(listener.upZ, up.z, time);
}

export function stereoPan(position: SpatialPoint, panRange: number): number {
  return clamp(position.x / Math.max(1, panRange), -1, 1);
}
