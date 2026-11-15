import type { MotionSample, MotionSource } from '../../motion/types.js';

interface PermissionConstructor {
  requestPermission?: () => Promise<'granted' | 'denied' | 'prompt'>;
}

function permissionConstructor(target: Window | null, name: 'DeviceOrientationEvent' | 'DeviceMotionEvent'): PermissionConstructor | null {
  if (target === null) return null;
  const value = (target as unknown as Record<string, unknown>)[name];
  return typeof value === 'function' ? (value as unknown as PermissionConstructor) : null;
}

function vector(value: DeviceMotionEvent['acceleration']): { x: number | null; y: number | null; z: number | null } {
  return { x: value?.x ?? null, y: value?.y ?? null, z: value?.z ?? null };
}

/**
 * Fuente DOM de sensores. En iOS pide permiso explícito; en escritorio sin
 * sensores simplemente no hay eventos y el motor degrada sin romper la mesa.
 */
export function createDomMotionSource(target: Window | null = typeof window === 'undefined' ? null : window): MotionSource {
  let orientation = { alpha: 0, beta: 0, gamma: 0 };
  const listeners = new Set<(sample: MotionSample) => void>();
  let motionHandler: ((event: Event) => void) | null = null;
  let orientationHandler: ((event: Event) => void) | null = null;

  return {
    kind: 'dom',
    isAvailable: () => target !== null && permissionConstructor(target, 'DeviceMotionEvent') !== null,
    requestPermission: async () => {
      if (target === null) return 'unsupported';
      const orientationPermission = permissionConstructor(target, 'DeviceOrientationEvent')?.requestPermission;
      if (orientationPermission !== undefined) {
        try {
          const result = await orientationPermission();
          if (result === 'denied') return 'denied';
          if (result === 'prompt') return 'prompt';
        } catch {
          return 'denied';
        }
      }
      return 'granted';
    },
    subscribe: (handler) => {
      if (target === null) return () => undefined;
      listeners.add(handler);
      orientationHandler = (event: Event): void => {
        const orientationEvent = event as DeviceOrientationEvent;
        orientation = {
          alpha: orientationEvent.alpha ?? orientation.alpha,
          beta: orientationEvent.beta ?? orientation.beta,
          gamma: orientationEvent.gamma ?? orientation.gamma,
        };
      };
      motionHandler = (event: Event): void => {
        const motionEvent = event as DeviceMotionEvent;
        const sample: MotionSample = {
          ...orientation,
          acceleration: vector(motionEvent.accelerationIncludingGravity),
          linearAcceleration: motionEvent.acceleration === null ? null : vector(motionEvent.acceleration),
          rotationRate: {
            alpha: motionEvent.rotationRate?.alpha ?? null,
            beta: motionEvent.rotationRate?.beta ?? null,
            gamma: motionEvent.rotationRate?.gamma ?? null,
          },
          intervalMs: Math.max(1, motionEvent.interval || 16),
          timestampMs: motionEvent.timeStamp || (typeof performance === 'undefined' ? Date.now() : performance.now()),
        };
        for (const listener of listeners) listener(sample);
      };
      target.addEventListener('deviceorientation', orientationHandler, true);
      target.addEventListener('devicemotion', motionHandler, true);
      return () => {
        listeners.delete(handler);
        if (orientationHandler !== null) target.removeEventListener('deviceorientation', orientationHandler, true);
        if (motionHandler !== null) target.removeEventListener('devicemotion', motionHandler, true);
        orientationHandler = null;
        motionHandler = null;
      };
    },
  };
}
