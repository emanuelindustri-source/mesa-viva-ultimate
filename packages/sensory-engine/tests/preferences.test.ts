import { describe, expect, it } from 'vitest';
import {
  clamp,
  clamp01,
  DEFAULT_PREFERENCES,
  lerp,
  mergePreferences,
  normalizePreferences,
} from '../src/types.js';

describe('preferencias sensoriales', () => {
  it('normaliza valores fuera de rango y usa los valores por defecto', () => {
    const preferences = normalizePreferences({ musicVolume: 7, effectsVolume: -2, hapticsIntensity: 3 });
    expect(preferences.musicVolume).toBe(1);
    expect(preferences.effectsVolume).toBe(0);
    expect(preferences.hapticsIntensity).toBe(1);
    expect(preferences.uiVolume).toBe(DEFAULT_PREFERENCES.uiVolume);
    expect(preferences.silentWhenFaceDown).toBe(true);
  });

  it('mantiene las preferencias actuales al aplicar un parche', () => {
    const current = normalizePreferences({ musicVolume: 0.4, hapticsEnabled: true });
    const merged = mergePreferences(current, { muted: true, musicVolume: 0.2 });
    expect(merged.muted).toBe(true);
    expect(merged.musicVolume).toBe(0.2);
    expect(merged.hapticsEnabled).toBe(true);
    expect(merged.reducedMotion).toBe(false);
  });

  it('no propaga NaN en los helpers numéricos', () => {
    expect(clamp01(Number.NaN)).toBe(0);
    expect(clamp(Number.NaN, 2, 8)).toBe(2);
    expect(lerp(10, 20, 0.5)).toBe(15);
    expect(lerp(10, 20, 4)).toBe(20);
    expect(lerp(10, 20, -1)).toBe(10);
  });
});
