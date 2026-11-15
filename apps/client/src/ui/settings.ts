import type { HolidayId, SupportedLocale } from '@mesa-viva/design-system';
import type { OutputMode } from '@mesa-viva/sensory-engine';

export type Appearance = 'light' | 'dark' | 'system';
export type ConsentState = 'unknown' | 'granted' | 'denied';

export interface AppSettings {
  readonly appearance: Appearance;
  readonly holiday: HolidayId | 'auto';
  readonly locale: SupportedLocale;
  readonly seedColor: string | null;
  readonly reducedMotion: boolean;
  readonly vip: boolean;
  readonly adsConsent: ConsentState;
  readonly playerName: string;
  readonly muted: boolean;
  readonly musicVolume: number;
  readonly humVolume: number;
  readonly percussionVolume: number;
  readonly sfxVolume: number;
  readonly binauralVolume: number;
  readonly hapticsIntensity: number;
  readonly outputMode: OutputMode;
  readonly passAndPlay: boolean;
  readonly tableRotation: 0 | 180 | 360;
}

const STORAGE_KEY = 'mesa-viva:settings:v1';

export const DEFAULT_SETTINGS: AppSettings = {
  appearance: 'system',
  holiday: 'auto',
  locale: 'es-VE',
  seedColor: null,
  reducedMotion: false,
  vip: false,
  adsConsent: 'unknown',
  playerName: 'Jugador',
  muted: false,
  musicVolume: 0.55,
  humVolume: 0.9,
  percussionVolume: 0.75,
  sfxVolume: 0.8,
  binauralVolume: 0.7,
  hapticsIntensity: 0.8,
  outputMode: 'auto',
  passAndPlay: false,
  tableRotation: 0,
};

function clamp(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;
}

export function normalizeSettings(input: Partial<AppSettings> = {}): AppSettings {
  return {
    appearance: input.appearance === 'light' || input.appearance === 'dark' || input.appearance === 'system' ? input.appearance : DEFAULT_SETTINGS.appearance,
    holiday: input.holiday ?? DEFAULT_SETTINGS.holiday,
    locale: input.locale ?? DEFAULT_SETTINGS.locale,
    seedColor: typeof input.seedColor === 'string' && /^#[0-9a-f]{6}$/i.test(input.seedColor) ? input.seedColor : null,
    reducedMotion: input.reducedMotion ?? DEFAULT_SETTINGS.reducedMotion,
    vip: input.vip ?? DEFAULT_SETTINGS.vip,
    adsConsent: input.adsConsent === 'granted' || input.adsConsent === 'denied' ? input.adsConsent : 'unknown',
    playerName: typeof input.playerName === 'string' && input.playerName.trim().length > 0 ? input.playerName.trim() : DEFAULT_SETTINGS.playerName,
    muted: input.muted ?? DEFAULT_SETTINGS.muted,
    musicVolume: clamp(input.musicVolume, DEFAULT_SETTINGS.musicVolume),
    humVolume: clamp(input.humVolume, DEFAULT_SETTINGS.humVolume),
    percussionVolume: clamp(input.percussionVolume, DEFAULT_SETTINGS.percussionVolume),
    sfxVolume: clamp(input.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
    binauralVolume: clamp(input.binauralVolume, DEFAULT_SETTINGS.binauralVolume),
    hapticsIntensity: clamp(input.hapticsIntensity, DEFAULT_SETTINGS.hapticsIntensity),
    outputMode: input.outputMode ?? DEFAULT_SETTINGS.outputMode,
    passAndPlay: input.passAndPlay ?? DEFAULT_SETTINGS.passAndPlay,
    tableRotation: input.tableRotation === 180 || input.tableRotation === 360 ? input.tableRotation : 0,
  };
}

export function loadSettings(): AppSettings {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw === null || raw === undefined ? DEFAULT_SETTINGS : normalizeSettings(JSON.parse(raw) as Partial<AppSettings>);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

let current = loadSettings();
const listeners = new Set<() => void>();

export function settingsSnapshot(): AppSettings {
  return current;
}

export function updateSettings(patch: Partial<AppSettings>): AppSettings {
  current = normalizeSettings({ ...current, ...patch });
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Modo privado o almacenamiento bloqueado: la sesión sigue en memoria.
  }
  for (const listener of listeners) listener();
  return current;
}

export function subscribeSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resolveAppearance(appearance: Appearance, prefersDark = false): 'light' | 'dark' {
  return appearance === 'system' ? (prefersDark ? 'dark' : 'light') : appearance;
}
