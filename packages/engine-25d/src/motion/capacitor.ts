import type {
  AccelerationSample,
  MotionPermission,
  MotionSample,
  MotionSource,
  RotationRateSample,
} from './types.js';

export interface CapacitorVector {
  readonly x?: number | null;
  readonly y?: number | null;
  readonly z?: number | null;
}

export interface CapacitorRotationRate {
  readonly alpha?: number | null;
  readonly beta?: number | null;
  readonly gamma?: number | null;
}

export interface CapacitorMotionPayload {
  readonly acceleration?: CapacitorVector | null;
  readonly accelerationIncludingGravity?: CapacitorVector | null;
  readonly rotationRate?: CapacitorRotationRate | null;
  readonly alpha?: number;
  readonly beta?: number;
  readonly gamma?: number;
  readonly interval?: number;
  readonly timestamp?: number;
}

export interface CapacitorListenerHandle {
  remove(): void | Promise<void>;
}

export interface CapacitorPermissionsResult {
  readonly motion?: string;
}

/** Contrato estructural: no obliga a instalar @capacitor/core en la web. */
export interface CapacitorMotionPlugin {
  addListener(
    event: 'devicemotion',
    handler: (payload: CapacitorMotionPayload) => void,
  ): CapacitorListenerHandle | Promise<CapacitorListenerHandle>;
  requestPermissions?(): Promise<CapacitorPermissionsResult>;
}

export interface CapacitorSourceOptions {
  readonly now?: () => number;
}

function accelerationOf(vector: CapacitorVector | null | undefined): AccelerationSample {
  return {
    x: typeof vector?.x === 'number' ? vector.x : null,
    y: typeof vector?.y === 'number' ? vector.y : null,
    z: typeof vector?.z === 'number' ? vector.z : null,
  };
}

function rotationOf(rate: CapacitorRotationRate | null | undefined): RotationRateSample | null {
  if (rate === null || rate === undefined) return null;
  return {
    alpha: typeof rate.alpha === 'number' ? rate.alpha : null,
    beta: typeof rate.beta === 'number' ? rate.beta : null,
    gamma: typeof rate.gamma === 'number' ? rate.gamma : null,
  };
}

export function normalizeCapacitorPayload(
  payload: CapacitorMotionPayload,
  timestampMs = Date.now(),
): MotionSample {
  return {
    alpha: payload.alpha ?? 0,
    beta: payload.beta ?? 0,
    gamma: payload.gamma ?? 0,
    acceleration: accelerationOf(payload.accelerationIncludingGravity ?? payload.acceleration),
    linearAcceleration: payload.acceleration === undefined || payload.acceleration === null
      ? null
      : accelerationOf(payload.acceleration),
    rotationRate: rotationOf(payload.rotationRate),
    intervalMs: Math.max(1, payload.interval ?? 16),
    timestampMs: payload.timestamp ?? timestampMs,
  };
}

/** Puente listo para Capacitor: envuelve el plugin nativo como MotionSource. */
export function createCapacitorMotionSource(
  plugin: CapacitorMotionPlugin | null,
  options: CapacitorSourceOptions = {},
): MotionSource {
  const now = options.now ?? (() => Date.now());
  return {
    kind: 'capacitor',
    isAvailable: () => plugin !== null,
    requestPermission: async (): Promise<MotionPermission> => {
      if (plugin === null) return 'unsupported';
      if (plugin.requestPermissions === undefined) return 'granted';
      try {
        const result = await plugin.requestPermissions();
        const motion = result.motion;
        if (motion === 'denied') return 'denied';
        if (motion === 'prompt') return 'prompt';
        return 'granted';
      } catch {
        return 'denied';
      }
    },
    subscribe: (handler) => {
      if (plugin === null) return () => undefined;
      let handle: CapacitorListenerHandle | null = null;
      let active = true;
      try {
        const pending = plugin.addListener('devicemotion', (payload) => {
          if (active) handler(normalizeCapacitorPayload(payload, now()));
        });
        if (typeof (pending as Promise<CapacitorListenerHandle>).then === 'function') {
          void (pending as Promise<CapacitorListenerHandle>).then((value) => {
            handle = value;
          }).catch(() => undefined);
        } else {
          handle = pending as CapacitorListenerHandle;
        }
      } catch {
        active = false;
      }
      return () => {
        active = false;
        if (handle !== null) void handle.remove();
      };
    },
  };
}
