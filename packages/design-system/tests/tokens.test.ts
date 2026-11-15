import { describe, expect, it } from 'vitest';
import {
  COLOR_ROLES,
  checkSchemeContrast,
  createElevations,
  createPalettes,
  createTheme,
  createTypography,
  createUserPalette,
  DEFAULT_PALETTES,
  elevationCssVariables,
  fontStackFor,
  hexToOklch,
  mergeScheme,
  motionDuration,
  normalizeHex,
  oklchToHex,
  palettesFromAndroid,
  parseAndroidDynamicColors,
  resolveUserPalette,
  schemeFromAndroidDynamicColors,
  schemeFromMaterialSeed,
  schemeFromSeed,
  spacingCssVariables,
  supportsDynamicColor,
  themeCssText,
  userPaletteScheme,
  validateUserPalette,
} from '../src/index.js';

const ANDROID_JSON = JSON.stringify({
  accent1: { '10': '#21005d', '40': '#6750a4', '80': '#d0bcff', '90': '#eaddff' },
  accent2: { '10': '#1d192b', '40': '#625b71', '80': '#ccc2dc', '90': '#e8def8' },
  accent3: { '10': '#31111d', '40': '#7d5260', '80': '#efb8c8', '90': '#ffd8e4' },
  neutral1: { '5': '#0f0d13', '10': '#1d1b20', '90': '#e6e0e9', '98': '#fef7ff' },
  neutral2: { '30': '#49454f', '80': '#cac4d0', '90': '#e7e0ec' },
});

describe('tokens de color', () => {
  it('normaliza hexadecimal y rechaza valores inválidos', () => {
    expect(normalizeHex('#AbC')).toBe('#aabbcc');
    expect(normalizeHex('6750A4')).toBe('#6750a4');
    expect(() => normalizeHex('azul')).toThrow();
  });

  it('convierte a OKLCH y de vuelta sin desviaciones grandes', () => {
    const original = '#00695c';
    const roundTrip = oklchToHex(hexToOklch(original));
    const a = hexToOklch(original);
    const b = hexToOklch(roundTrip);
    expect(Math.abs(a.l - b.l)).toBeLessThan(0.01);
    expect(Math.abs(a.h - b.h)).toBeLessThan(2);
  });

  it('genera los 37 roles en seis paletas', () => {
    const palettes = createPalettes('#6750a4');
    expect(Object.keys(palettes)).toHaveLength(6);
    const scheme = schemeFromSeed('#6750a4', 'light');
    expect(Object.keys(scheme).sort()).toEqual([...COLOR_ROLES].sort());
  });

  it.each(['light', 'dark'] as const)('cumple AA en modo %s', (mode) => {
    for (const seed of ['#6750a4', '#00695c', '#c62828', '#fdd835']) {
      const checks = checkSchemeContrast(schemeFromSeed(seed, mode));
      expect(checks.filter((check) => !check.passesAA)).toEqual([]);
    }
  });

  it('el respaldo por semilla coincide con la paleta directa', () => {
    expect(schemeFromMaterialSeed('#00695c', 'dark')).toEqual(schemeFromSeed('#00695c', 'dark'));
  });
});

describe('Material You', () => {
  it('solo habilita color dinámico desde API 31', () => {
    expect(supportsDynamicColor(30)).toBe(false);
    expect(supportsDynamicColor(31)).toBe(true);
    expect(supportsDynamicColor(34)).toBe(true);
  });

  it('parsea el JSON del puente Kotlin y genera roles', () => {
    const colors = parseAndroidDynamicColors(ANDROID_JSON);
    expect(colors.accent1['40']).toBe('#6750a4');
    const scheme = schemeFromAndroidDynamicColors(colors, 'light');
    expect(scheme.primary).toBe('#6750a4');
    expect(Object.keys(palettesFromAndroid(colors))).toHaveLength(6);
    expect(checkSchemeContrast(scheme).every((check) => check.passesAA)).toBe(true);
  });

  it('rechaza JSON inválido', () => {
    expect(() => parseAndroidDynamicColors('[]')).toThrow();
    expect(() => parseAndroidDynamicColors('{"accent1":{}}')).toThrow();
  });
});

describe('paletas de usuario', () => {
  const normal = createUserPalette({ id: 'n', name: 'Normal', seed: '#00695c' });
  const festive = createUserPalette({
    id: 'f',
    name: 'Navidad',
    seed: '#b3261e',
    kind: 'festivo',
    holidayId: 'navidad',
    overrides: { tertiary: '#2e7d32' },
  });

  it('crea, valida y aplica overrides', () => {
    expect(validateUserPalette(festive)).toEqual([]);
    expect(userPaletteScheme(festive).tertiary).toBe('#2e7d32');
    expect(DEFAULT_PALETTES).toHaveLength(2);
  });

  it('elige paleta festiva para su día y normal en el resto', () => {
    expect(resolveUserPalette([normal, festive], 'light', 'navidad')?.source).toBe('festivo');
    expect(resolveUserPalette([normal, festive], 'light', 'dia-normal')?.source).toBe('normal');
    expect(resolveUserPalette([normal, festive], 'dark', 'navidad')).toBeNull();
  });

  it('detecta paletas inválidas', () => {
    const broken = { ...normal, seed: 'no-es-color', overrides: { primary: 'x' } };
    expect(validateUserPalette(broken).length).toBeGreaterThan(0);
    expect(() => createUserPalette({ id: '', name: 'x', seed: '#fff' })).toThrow();
    expect(() => createUserPalette({ id: 'x', name: 'x', seed: '#fff', kind: 'festivo' })).toThrow();
  });

  it('fusiona esquemas sin mutar el original', () => {
    const base = schemeFromSeed('#00695c', 'light');
    const merged = mergeScheme(base, { primary: '#123456' });
    expect(merged.primary).toBe('#123456');
    expect(base.primary).not.toBe('#123456');
  });
});

describe('tipografía, elevación y movimiento', () => {
  it('cambia la pila tipográfica por escritura', () => {
    expect(fontStackFor('hi')).toContain('Devanagari');
    expect(fontStackFor('ja')).toContain('Noto Sans JP');
    expect(fontStackFor('zh-CN')).toContain('Noto Sans SC');
    expect(fontStackFor('es-VE')).toContain('Inter');
  });

  it('escala la tipografía para televisores', () => {
    const normal = createTypography('es-VE', 1);
    const tv = createTypography('es-VE', 1.5);
    expect(tv['body-large'].size).toBeGreaterThan(normal['body-large'].size);
    expect(Object.keys(normal)).toHaveLength(15);
  });

  it('define sombras 2.5D por nivel y modo', () => {
    const light = createElevations('light');
    const dark = createElevations('dark');
    expect(light[0].boxShadow).toBe('none');
    expect(light[5].boxShadow).not.toBe(dark[5].boxShadow);
    expect(elevationCssVariables(light)['--mv-25d-perspective']).toBe('1200px');
  });

  it('expone variables y respeta movimiento reducido', () => {
    const variables = spacingCssVariables();
    expect(variables['--mv-spacing-lg']).toBe('16px');
    expect(variables['--mv-radius-full']).toBe('9999px');
    expect(motionDuration('emphasized')).toBe(420);
    expect(motionDuration('emphasized', true)).toBe(1);
  });
});

describe('tema compuesto', () => {
  it('compone variables Material You y festivas', () => {
    const theme = createTheme({ holidayId: 'navidad', locale: 'es-VE' });
    expect(theme.holidayId).toBe('navidad');
    expect(theme.festive?.musicId).toBe('music.navidad');
    expect(theme.cssVariables['--mv-festive-particles']).toBe('snow');
    expect(themeCssText(theme, ':root')).toContain('--md-sys-color-primary');
  });

  it('prioriza colores dinámicos y acepta paletas', () => {
    const colors = parseAndroidDynamicColors(ANDROID_JSON);
    const theme = createTheme({ dynamicColors: colors, mode: 'dark' });
    expect(theme.scheme.primary).toBe('#d0bcff');
    const palette = createUserPalette({ id: 'x', name: 'X', seed: '#00695c', overrides: { primary: '#abcdef' } });
    expect(createTheme({ palette }).scheme.primary).toBe('#abcdef');
  });
});
