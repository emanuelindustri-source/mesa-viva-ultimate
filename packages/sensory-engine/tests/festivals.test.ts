import { describe, expect, it } from 'vitest';
import {
  FESTIVAL_PROFILES,
  festivalMusicId,
  festivalProfile,
  isThemedFestival,
  THEMED_FESTIVAL_IDS,
} from '../src/music/festivals.js';
import { FESTIVAL_IDS, STEM_IDS } from '../src/music/types.js';

describe('19 festividades locales', () => {
  it('registra diecinueve festividades temáticas y el Día Normal', () => {
    expect(FESTIVAL_IDS).toHaveLength(20);
    expect(THEMED_FESTIVAL_IDS).toHaveLength(19);
    expect(new Set(FESTIVAL_IDS).size).toBe(20);
    expect(isThemedFestival('navidad')).toBe(true);
    expect(isThemedFestival('dia-normal')).toBe(false);
  });

  it('cada perfil tiene música, escala, tempo y sello propios', () => {
    for (const id of FESTIVAL_IDS) {
      const profile = festivalProfile(id);
      expect(profile.id).toBe(id);
      expect(profile.musicId).toBe(`music.${id}`);
      expect(profile.scale.length).toBeGreaterThanOrEqual(5);
      expect(profile.tempo).toBeGreaterThanOrEqual(40);
      expect(profile.tempo).toBeLessThanOrEqual(180);
      expect(profile.density).toBeGreaterThan(0);
      expect(profile.density).toBeLessThanOrEqual(1);
      expect(profile.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(profile.label.length).toBeGreaterThan(2);
      for (const bias of Object.values(profile.stemBias)) {
        expect(bias).toBeGreaterThanOrEqual(-1);
        expect(bias).toBeLessThanOrEqual(1);
      }
      for (const stem of Object.keys(profile.stemBias)) {
        expect(STEM_IDS).toContain(stem);
      }
    }
  });

  it('mantiene identidad musical única y estable', () => {
    const musicIds = FESTIVAL_IDS.map((id) => FESTIVAL_PROFILES[id].musicId);
    expect(new Set(musicIds).size).toBe(FESTIVAL_IDS.length);
    expect(festivalMusicId('halloween')).toBe('music.halloween');
    expect(festivalProfile('dia-normal').stemBias).toEqual({});
  });

  it('cae en Día Normal si el identificador no existe en tiempo de ejecución', () => {
    expect(festivalProfile('desconocida' as never).id).toBe('dia-normal');
  });
});
