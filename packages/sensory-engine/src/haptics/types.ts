import type { HapticGesture, HapticPrimitive } from '../version.js';

export type HapticSource = 'capacitor' | 'web' | 'ninguna';

export type CapacitorImpactStyle = 'LIGHT' | 'MEDIUM' | 'HEAVY';

/** Contrato estructural del plugin @capacitor/haptics; no exige dependencia web. */
export interface CapacitorHapticsPlugin {
  impact(options: { readonly style: CapacitorImpactStyle }): Promise<void> | void;
  vibrate(options?: { readonly duration?: number }): Promise<void> | void;
  selectionChanged?(): Promise<void> | void;
  notification?(options: { readonly type: 'SUCCESS' | 'WARNING' | 'ERROR' }): Promise<void> | void;
}

export type VibrateFn = (pattern: number | readonly number[]) => boolean;

export interface HapticPulse {
  readonly primitive: HapticPrimitive;
  readonly durationMs: number;
  readonly delayMs: number;
  readonly intensity: number;
}

export interface HapticPattern {
  readonly gesture: HapticGesture;
  readonly label: string;
  readonly pulses: readonly HapticPulse[];
  readonly totalMs: number;
}

export interface HapticPlayback {
  readonly gesture: HapticGesture;
  readonly source: HapticSource;
  readonly totalMs: number;
}

export interface HapticCapabilities {
  readonly available: boolean;
  readonly source: HapticSource;
  readonly supportsPatterns: boolean;
}

export type HapticSchedule = (callback: () => void, delayMs: number) => unknown

export type HapticCancel = (handle: unknown) => void

export interface HapticEngineOptions {
  readonly plugin?: CapacitorHapticsPlugin | null;
  readonly vibrate?: VibrateFn | null;
  readonly enabled?: boolean;
  readonly reducedMotion?: boolean;
  readonly silent?: boolean;
  readonly intensity?: number;
  readonly schedule?: HapticSchedule;
  readonly cancel?: HapticCancel;
}
