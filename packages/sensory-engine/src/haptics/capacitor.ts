import type { HapticPrimitive } from '../version.js';
import { HAPTIC_PRIMITIVE_SPECS } from './patterns.js';
import type { CapacitorHapticsPlugin, HapticPulse } from './types.js';

export interface NativeHapticBridge {
  readonly source: 'capacitor';
  playPulse(pulse: HapticPulse, intensity: number): void;
  celebrate(kind: 'victoria' | 'derrota' | 'alerta'): void;
}

function safely(action: () => Promise<void> | void): void {
  try {
    const result = action();
    if (result !== undefined && typeof (result as Promise<void>).then === 'function') {
      void (result as Promise<void>).catch(() => undefined);
    }
  } catch {
    // La háptica nunca bloquea la partida: un plugin ausente o roto se ignora.
  }
}

function playPrimitive(plugin: CapacitorHapticsPlugin, primitive: HapticPrimitive): void {
  if (primitive === 'tick' && plugin.selectionChanged !== undefined) {
    safely(() => plugin.selectionChanged?.());
    return;
  }
  if (primitive === 'spin') {
    safely(() => plugin.vibrate({ duration: HAPTIC_PRIMITIVE_SPECS.spin.durationMs }));
    return;
  }
  safely(() => plugin.impact({ style: HAPTIC_PRIMITIVE_SPECS[primitive].style }));
}

/** Puente estructural listo para @capacitor/haptics, sin dependencia en web. */
export function createCapacitorHapticsBridge(plugin: CapacitorHapticsPlugin): NativeHapticBridge {
  return {
    source: 'capacitor',
    playPulse: (pulse) => playPrimitive(plugin, pulse.primitive),
    celebrate: (kind) => {
      if (plugin.notification === undefined) {
        playPrimitive(plugin, kind === 'derrota' ? 'thud' : 'click');
        return;
      }
      const type = kind === 'victoria' ? 'SUCCESS' : kind === 'derrota' ? 'ERROR' : 'WARNING';
      safely(() => plugin.notification?.({ type }));
    },
  };
}
