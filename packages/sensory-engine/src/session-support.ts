import type { EffectStats } from './audio/effects.js';
import type { AudioGraph } from './audio/graph.js';
import type { SpatialStats } from './audio/spatial.js';
import type { HapticEngine } from './haptics/engine.js';
import type { HapticCapabilities } from './haptics/types.js';
import type { AdaptiveMusicDirector } from './music/director.js';
import type { TensionSnapshot } from './music/types.js';
import type { OutputStatus } from './output/types.js';
import type { SensorySessionStatus } from './session-types.js';
import type { SoundtrackController } from './soundtrack/soundtrack-controller.js';
import type { SoundtrackStatus } from './soundtrack/types.js';
import type { AudioEngineStatus, SensoryPreferences } from './types.js';

export interface SessionStatusInput {
  readonly audio: AudioEngineStatus;
  readonly spatial: SpatialStats;
  readonly director: AdaptiveMusicDirector;
  readonly haptics: HapticEngine;
  readonly effects: EffectStats;
  readonly preferences: SensoryPreferences;
  readonly faceDown: boolean;
  readonly tension: TensionSnapshot;
  readonly output?: OutputStatus | null;
  readonly soundtrack?: SoundtrackStatus | null;
}

export function buildSessionStatus(input: SessionStatusInput): SensorySessionStatus {
  return {
    audio: input.audio,
    spatial: input.spatial,
    music: input.director.status,
    haptics: input.haptics.capabilities,
    effects: input.effects,
    preferences: input.preferences,
    faceDown: input.faceDown,
    tension: input.tension,
    output: input.output ?? null,
    soundtrack: input.soundtrack ?? null,
  };
}

export interface PreferenceTargets {
  readonly graph: AudioGraph | null;
  readonly director: AdaptiveMusicDirector;
  readonly haptics: HapticEngine;
  readonly preferences: SensoryPreferences;
  readonly faceDown: boolean;
  readonly studio?: SoundtrackController | null;
}

/** Aplica volumen, silencio y accesibilidad a todos los motores a la vez. */
export function applySessionPreferences(targets: PreferenceTargets): void {
  const { preferences, faceDown, graph, director, haptics } = targets;
  const muted = preferences.muted || (faceDown && preferences.silentWhenFaceDown);
  if (graph !== null) {
    graph.setMuted(muted);
    graph.setBusVolume('music', preferences.musicVolume, 0.1);
    graph.setBusVolume('effects', preferences.effectsVolume, 0.1);
    graph.setBusVolume('ambience', preferences.ambienceVolume, 0.1);
    graph.setBusVolume('ui', preferences.uiVolume, 0.1);
  }
  director.setVolume(preferences.musicVolume);
  director.setMuted(muted);
  targets.studio?.setVolume(preferences.musicVolume);
  targets.studio?.setMuted(muted);
  haptics.configure({
    enabled: preferences.hapticsEnabled,
    reducedMotion: preferences.reducedMotion,
    intensity: preferences.hapticsIntensity,
    silent: faceDown && preferences.silentWhenFaceDown,
  });
}

export type { HapticCapabilities };
