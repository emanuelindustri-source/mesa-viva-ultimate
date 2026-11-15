import type { EffectId } from './audio/effect-sounds.js';
import type { EffectPlayback, EffectStats } from './audio/effects.js';
import type { AudioRuntime } from './audio/runtime.js';
import type { SpatialStats } from './audio/spatial.js';
import type { HapticEngine } from './haptics/engine.js';
import type { HapticCapabilities, HapticPlayback } from './haptics/types.js';
import type { FestivalId, MusicDirectorStatus, MusicPhase, TensionInput, TensionSnapshot } from './music/types.js';
import type { AudioEngineStatus, SensoryPreferences, Vec3 } from './types.js';

export interface SensoryEvent {
  readonly type: EffectId;
  readonly sourceId?: string | null;
  readonly position?: Vec3 | null;
  readonly volume?: number;
}

export interface SensoryPlayResult {
  readonly event: EffectId;
  readonly effect: EffectPlayback | null;
  readonly haptic: HapticPlayback | null;
  readonly latencyMs: number;
}

export interface SensorySessionOptions {
  readonly runtime?: AudioRuntime;
  readonly haptics?: HapticEngine;
  readonly preferences?: Partial<SensoryPreferences>;
  readonly festival?: FestivalId;
  readonly seed?: number;
  readonly autoTick?: boolean;
  readonly maxVoices?: number;
  readonly maxHrtfVoices?: number;
  readonly shakeAction?: 'dados' | 'barajar';
  readonly now?: () => number;
}

export interface SensorySessionStatus {
  readonly audio: AudioEngineStatus;
  readonly spatial: SpatialStats;
  readonly music: MusicDirectorStatus;
  readonly haptics: HapticCapabilities;
  readonly effects: EffectStats;
  readonly preferences: SensoryPreferences;
  readonly faceDown: boolean;
  readonly tension: TensionSnapshot;
}

export type { MusicPhase, TensionInput, TensionSnapshot };
