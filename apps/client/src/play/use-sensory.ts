import { type EffectId, SensorySession } from '@mesa-viva/sensory-engine';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import type { AppSettings } from '../ui/settings.js';

function createSession(settings: AppSettings): SensorySession {
  return new SensorySession({
    musicEngine: 'studio',
    outputMode: settings.outputMode,
    soundtrackBars: 48,
    autoTick: true,
    binaural: settings.binauralVolume > 0,
    preferences: {
      musicVolume: settings.musicVolume,
      effectsVolume: settings.sfxVolume,
      uiVolume: settings.sfxVolume,
      hapticsEnabled: true,
      hapticsIntensity: settings.hapticsIntensity,
      reducedMotion: settings.reducedMotion,
      muted: settings.muted,
    },
  });
}

function applySettings(session: SensorySession, settings: AppSettings): void {
  session.setPreferences({
    musicVolume: settings.musicVolume,
    effectsVolume: settings.sfxVolume,
    uiVolume: settings.sfxVolume,
    hapticsEnabled: true,
    hapticsIntensity: settings.hapticsIntensity,
    reducedMotion: settings.reducedMotion,
    muted: settings.muted,
  });
  session.setOutputMode(settings.outputMode);
  session.setBinauralEnabled(settings.binauralVolume > 0);
  session.setBinauralIntensity(settings.binauralVolume);
  session.setHarmonicSfxVolume(settings.sfxVolume);
  session.setStudioMix({
    hum: settings.humVolume,
    percussion: settings.percussionVolume,
    beatbox: settings.percussionVolume,
    marimba: Math.min(1, settings.percussionVolume * 0.85),
  });
}

/** Sesión sensorial perezosa para el cliente; se crea solo tras un gesto. */
export function useSensory(settings: AppSettings) {
  const ref = useRef<SensorySession | null>(null);
  useEffect(() => () => { void ref.current?.dispose(); ref.current = null; }, []);
  useEffect(() => {
    if (ref.current !== null) applySettings(ref.current, settings);
  }, [settings]);

  const session = (): SensorySession => {
    ref.current ??= createSession(settings);
    return ref.current;
  };

  const unlock = async (): Promise<boolean> => {
    try {
      const current = session();
      const status = await current.unlock();
      applySettings(current, settings);
      return status.state === 'activo';
    } catch {
      return false;
    }
  };

  const play = (event: EffectId): void => {
    if (ref.current === null) return;
    try {
      ref.current.play(event);
    } catch {
      // El audio nunca bloquea la partida.
    }
  };

  const celebrate = (kind: 'victoria' | 'derrota' = 'victoria'): void => {
    try {
      ref.current?.celebrate(kind);
    } catch {
      // Sin audio, la mesa sigue.
    }
  };

  const crash = (): void => {
    try {
      ref.current?.playTableImpact();
    } catch {
      // La háptica y el audio degradan sin bloquear.
    }
  };

  const onShake = (intensity: number): void => {
    try {
      ref.current?.onShake(intensity);
    } catch {
      // Sin sensores, no pasa nada.
    }
  };

  const onFaceDown = (down: boolean): void => {
    try {
      ref.current?.onFaceDown(down);
    } catch {
      // Sin sensores, no pasa nada.
    }
  };

  const setPlayerState = (input: { readonly idleSeconds?: number; readonly streak?: number; readonly chants?: number; readonly tension?: number }): void => {
    try {
      ref.current?.setPlayerState(input);
    } catch {
      // El estado musical es opcional.
    }
  };

  return useMemo(() => ({ session, unlock, play, celebrate, crash, onShake, onFaceDown, setPlayerState }), [settings]);
}
