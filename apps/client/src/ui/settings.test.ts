import { describe, expect, it } from 'vitest';
import { nativeDynamicColors } from './material-you.js';
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  resolveAppearance,
  updateSettings,
} from './settings.js';

describe('ajustes del cliente', () => {
  it('normaliza límites, apariencia y consentimiento', () => {
    const settings = normalizeSettings({
      appearance: 'light',
      musicVolume: 4,
      sfxVolume: -1,
      adsConsent: 'granted',
      playerName: '  Ana  ',
      tableRotation: 180,
    });
    expect(settings.appearance).toBe('light');
    expect(settings.musicVolume).toBe(1);
    expect(settings.sfxVolume).toBe(0);
    expect(settings.adsConsent).toBe('granted');
    expect(settings.playerName).toBe('Ana');
    expect(settings.tableRotation).toBe(180);
  });

  it('usa valores seguros ante entradas inválidas', () => {
    const settings = normalizeSettings({ appearance: 'neon' as never, adsConsent: 'quizá' as never, tableRotation: 90 as never, seedColor: 'azul' });
    expect(settings.appearance).toBe(DEFAULT_SETTINGS.appearance);
    expect(settings.adsConsent).toBe('unknown');
    expect(settings.tableRotation).toBe(0);
    expect(settings.outputMode).toBe('auto');
    expect(settings.seedColor).toBeNull();
    expect(normalizeSettings({ seedColor: '#12ab34' }).seedColor).toBe('#12ab34');
  });

  it('resuelve el modo automático y actualiza solo campos conocidos', () => {
    expect(resolveAppearance('system', true)).toBe('dark');
    expect(resolveAppearance('system', false)).toBe('light');
    expect(resolveAppearance('dark', false)).toBe('dark');
    const updated = updateSettings({ muted: true, humVolume: 0.25 });
    expect(updated.muted).toBe(true);
    expect(updated.humVolume).toBe(0.25);
    updateSettings({ muted: false, humVolume: DEFAULT_SETTINGS.humVolume });
  });

  it('lee la paleta Material You solo desde el puente Android', () => {
    const palette = { '10': '#101010', '40': '#404040', '80': '#808080' };
    const json = JSON.stringify({ accent1: palette, accent2: palette, accent3: palette, neutral1: palette, neutral2: palette });
    const colors = nativeDynamicColors({ MesaVivaAndroid: { materialYou: json } });
    expect(colors?.accent1['40']).toBe('#404040');
    expect(nativeDynamicColors({ MesaVivaAndroid: { materialYou: '{"roto":true}' } })).toBeNull();
    expect(nativeDynamicColors({})).toBeNull();
  });
});
