import type { AudioParamLike } from './contracts.js';

/** Programa un valor sin dejar automatizaciones anteriores peleando. */
export function setParam(param: AudioParamLike, value: number, time: number): void {
  try {
    param.cancelScheduledValues(time);
    param.setValueAtTime(Math.max(0, value), time);
  } catch {
    param.value = Math.max(0, value);
  }
}

/** Coordenadas y paneo admiten valores negativos; las ganancias no. */
export function setSignedParam(param: AudioParamLike, value: number, time: number): void {
  try {
    param.cancelScheduledValues(time);
    param.setValueAtTime(value, time);
  } catch {
    param.value = value;
  }
}

export function rampSignedParam(param: AudioParamLike, value: number, time: number, duration: number): void {
  try {
    param.cancelScheduledValues(time);
    param.setValueAtTime(param.value, time);
    param.linearRampToValueAtTime(value, time + Math.max(0.001, duration));
  } catch {
    param.value = value;
  }
}

/** Rampa corta para crossfades de stems y movimientos de fuente. */
export function rampParam(param: AudioParamLike, value: number, time: number, duration: number): void {
  const target = Math.max(0, value);
  try {
    param.cancelScheduledValues(time);
    param.setValueAtTime(param.value, time);
    param.linearRampToValueAtTime(target, time + Math.max(0.001, duration));
  } catch {
    param.value = target;
  }
}

/** Envolvente de ataque y caída para voces de efectos y notas musicales. */
export function envelope(
  param: AudioParamLike,
  peak: number,
  time: number,
  attack: number,
  release: number,
): void {
  const safePeak = Math.max(0.0001, peak);
  try {
    param.cancelScheduledValues(time);
    param.setValueAtTime(0.0001, time);
    param.exponentialRampToValueAtTime(safePeak, time + Math.max(0.005, attack));
    param.exponentialRampToValueAtTime(0.0001, time + Math.max(0.02, attack + release));
  } catch {
    param.value = safePeak;
  }
}

export function dbToGain(db: number): number {
  return 10 ** (db / 20);
}

/** Posición espacial expresada en metros. */
export interface SpatialPoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}
