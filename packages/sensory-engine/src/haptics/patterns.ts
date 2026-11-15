import type { HapticGesture, HapticPrimitive } from '../version.js';
import type { CapacitorImpactStyle, HapticPattern, HapticPulse } from './types.js';

interface PrimitiveSpec {
  readonly durationMs: number;
  readonly intensity: number;
  readonly style: CapacitorImpactStyle;
}

/** Envolvente táctil de cada primitiva: corta, precisa y sin zumbido largo. */
export const HAPTIC_PRIMITIVE_SPECS: Readonly<Record<HapticPrimitive, PrimitiveSpec>> = Object.freeze({
  tick: { durationMs: 8, intensity: 0.35, style: 'LIGHT' },
  click: { durationMs: 12, intensity: 0.55, style: 'MEDIUM' },
  thud: { durationMs: 28, intensity: 0.85, style: 'HEAVY' },
  spin: { durationMs: 38, intensity: 0.6, style: 'MEDIUM' },
});

interface PulseSeed {
  readonly primitive: HapticPrimitive;
  readonly delayMs?: number;
}

function build(gesture: HapticGesture, label: string, seeds: readonly PulseSeed[]): HapticPattern {
  let cursor = 0;
  const pulses: HapticPulse[] = seeds.map((seed) => {
    const spec = HAPTIC_PRIMITIVE_SPECS[seed.primitive];
    const delayMs = seed.delayMs ?? 0;
    cursor += delayMs;
    const pulse: HapticPulse = {
      primitive: seed.primitive,
      durationMs: spec.durationMs,
      delayMs,
      intensity: spec.intensity,
    };
    cursor += spec.durationMs;
    return pulse;
  });
  return Object.freeze({ gesture, label, pulses: Object.freeze(pulses), totalMs: cursor });
}

/** Patrones de vibración de precisión, uno por gesto real de la mesa. */
export const HAPTIC_PATTERNS: Readonly<Record<HapticGesture, HapticPattern>> = Object.freeze({
  deslizarCarta: build('deslizarCarta', 'Deslizar carta', [{ primitive: 'tick' }]),
  colocarFicha: build('colocarFicha', 'Colocar ficha', [
    { primitive: 'click' },
    { primitive: 'thud', delayMs: 34 },
  ]),
  lanzarDados: build('lanzarDados', 'Lanzar dados', [
    { primitive: 'spin' },
    { primitive: 'click', delayMs: 42 },
    { primitive: 'click', delayMs: 36 },
    { primitive: 'thud', delayMs: 48 },
  ]),
  barajar: build('barajar', 'Barajar', [
    { primitive: 'click' },
    { primitive: 'click', delayMs: 30 },
    { primitive: 'tick', delayMs: 32 },
    { primitive: 'tick', delayMs: 26 },
  ]),
  turno: build('turno', 'Cambio de turno', [
    { primitive: 'tick' },
    { primitive: 'tick', delayMs: 58 },
  ]),
  victoria: build('victoria', 'Victoria', [
    { primitive: 'click' },
    { primitive: 'click', delayMs: 46 },
    { primitive: 'thud', delayMs: 54 },
  ]),
  derrota: build('derrota', 'Derrota', [{ primitive: 'thud' }]),
  alerta: build('alerta', 'Aviso', [
    { primitive: 'click' },
    { primitive: 'click', delayMs: 44 },
  ]),
  silencio: build('silencio', 'Silenciar', [{ primitive: 'tick' }]),
});

export function hapticPattern(gesture: HapticGesture): HapticPattern {
  return HAPTIC_PATTERNS[gesture];
}

/** Convierte pulsos a la secuencia on/off que entiende navigator.vibrate. */
export function toVibrationPattern(pattern: HapticPattern, intensity = 1): readonly number[] {
  const scale = Math.min(1, Math.max(0, intensity));
  const steps: number[] = [];
  for (const pulse of pattern.pulses) {
    const pause = Math.round(pulse.delayMs * scale);
    if (pause > 0) steps.push(pause);
    steps.push(Math.max(1, Math.round(pulse.durationMs * (0.6 + scale * 0.4))));
  }
  return steps;
}

/** Patrón de un solo pulso para el puente nativo. */
export function pulseDuration(pulse: HapticPulse, intensity = 1): number {
  const scale = Math.min(1, Math.max(0, intensity));
  return Math.max(1, Math.round(pulse.durationMs * (0.6 + scale * 0.4)));
}
