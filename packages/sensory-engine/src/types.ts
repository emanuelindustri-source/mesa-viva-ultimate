/** Punto tridimensional en metros. La mesa vive en el plano XZ. */
export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export const ORIGIN: Vec3 = Object.freeze({ x: 0, y: 0, z: 0 });

export type AudioEngineState = 'sin-iniciar' | 'suspendido' | 'activo' | 'no-disponible' | 'cerrado';

export interface AudioEngineStatus {
  readonly state: AudioEngineState;
  readonly sampleRate: number;
  readonly requestedSampleRate: number;
  readonly contextTime: number;
  readonly reason: string;
}

export interface SensoryPreferences {
  readonly muted: boolean;
  readonly musicVolume: number;
  readonly effectsVolume: number;
  readonly ambienceVolume: number;
  readonly uiVolume: number;
  readonly hapticsEnabled: boolean;
  readonly hapticsIntensity: number;
  readonly reducedMotion: boolean;
  readonly silentWhenFaceDown: boolean;
}

export const DEFAULT_PREFERENCES: SensoryPreferences = Object.freeze({
  muted: false,
  musicVolume: 0.55,
  effectsVolume: 0.8,
  ambienceVolume: 0.34,
  uiVolume: 0.5,
  hapticsEnabled: true,
  hapticsIntensity: 0.8,
  reducedMotion: false,
  silentWhenFaceDown: true,
});

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * clamp01(amount);
}

/** Normaliza preferencias parciales sin permitir valores fuera de rango. */
export function normalizePreferences(partial: Partial<SensoryPreferences> = {}): SensoryPreferences {
  return Object.freeze({
    muted: partial.muted ?? DEFAULT_PREFERENCES.muted,
    musicVolume: clamp(partial.musicVolume ?? DEFAULT_PREFERENCES.musicVolume, 0, 1),
    effectsVolume: clamp(partial.effectsVolume ?? DEFAULT_PREFERENCES.effectsVolume, 0, 1),
    ambienceVolume: clamp(partial.ambienceVolume ?? DEFAULT_PREFERENCES.ambienceVolume, 0, 1),
    uiVolume: clamp(partial.uiVolume ?? DEFAULT_PREFERENCES.uiVolume, 0, 1),
    hapticsEnabled: partial.hapticsEnabled ?? DEFAULT_PREFERENCES.hapticsEnabled,
    hapticsIntensity: clamp(partial.hapticsIntensity ?? DEFAULT_PREFERENCES.hapticsIntensity, 0, 1),
    reducedMotion: partial.reducedMotion ?? DEFAULT_PREFERENCES.reducedMotion,
    silentWhenFaceDown: partial.silentWhenFaceDown ?? DEFAULT_PREFERENCES.silentWhenFaceDown,
  });
}

export function mergePreferences(
  current: SensoryPreferences,
  patch: Partial<SensoryPreferences>,
): SensoryPreferences {
  return normalizePreferences({ ...current, ...patch });
}
