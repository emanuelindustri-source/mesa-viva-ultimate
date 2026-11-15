import { describe, expect, it } from 'vitest';
import {
  assertResourcesComplete,
  createI18n,
  DEFAULT_LOCALE,
  detectLocale,
  dictionaryFor,
  holidayLabelKey,
  isSupportedLocale,
  LANGUAGE_COUNT,
  LOCALE_LABELS,
  normalizeLocale,
  PRIMARY_LOCALES,
  SUPPORTED_LOCALES,
  TRANSLATION_KEYS,
  translatorFor,
  validateAllResources,
  validateDictionary,
} from '../src/index.js';

describe('catálogo de idiomas', () => {
  it('cubre 11 idiomas y 12 códigos BCP 47', () => {
    expect(LANGUAGE_COUNT).toBe(11);
    expect(PRIMARY_LOCALES).toHaveLength(11);
    expect(SUPPORTED_LOCALES).toHaveLength(12);
    expect(new Set(SUPPORTED_LOCALES).size).toBe(12);
    expect(SUPPORTED_LOCALES).toContain('es');
    expect(SUPPORTED_LOCALES).toContain('es-VE');
    expect(Object.keys(LOCALE_LABELS)).toHaveLength(12);
  });

  it('valida todas las claves, sin vacíos ni sobrantes', () => {
    const validations = validateAllResources();
    expect(validations).toHaveLength(12);
    for (const validation of validations) {
      expect(validation.missing, validation.locale).toEqual([]);
      expect(validation.extra, validation.locale).toEqual([]);
      expect(validation.empty, validation.locale).toEqual([]);
      expect(validation.valid, validation.locale).toBe(true);
    }
    expect(TRANSLATION_KEYS).toHaveLength(80);
    expect(() => assertResourcesComplete()).not.toThrow();
  });

  it('cada idioma traduce las 20 festividades', () => {
    const holidayKeys = TRANSLATION_KEYS.filter((key) => key.startsWith('holidays.'));
    expect(holidayKeys).toHaveLength(20);
    for (const locale of PRIMARY_LOCALES) {
      const dictionary = dictionaryFor(locale);
      for (const key of holidayKeys) {
        expect(dictionary[key].trim().length, `${locale}:${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('el español de Venezuela es el idioma principal', () => {
    expect(DEFAULT_LOCALE).toBe('es-VE');
    expect(dictionaryFor('es-VE')['app.name']).toBe('Mesa Viva');
    expect(dictionaryFor('es')).toEqual(dictionaryFor('es-VE'));
  });
});

describe('normalización de locales', () => {
  it('mapea variantes conocidas', () => {
    expect(normalizeLocale('ES-ve')).toBe('es-VE');
    expect(normalizeLocale('es-419')).toBe('es-VE');
    expect(normalizeLocale('es-ES')).toBe('es');
    expect(normalizeLocale('pt_br')).toBe('pt-BR');
    expect(normalizeLocale('pt')).toBe('pt-BR');
    expect(normalizeLocale('pt-AO')).toBe('pt-PT');
    expect(normalizeLocale('zh-Hans-CN')).toBe('zh-CN');
    expect(normalizeLocale('en-GB')).toBe('en');
    expect(normalizeLocale('xx-YY')).toBe('es-VE');
  });

  it('detecta un idioma explícito o cae en el principal', () => {
    expect(detectLocale('fr-CA')).toBe('fr');
    expect(detectLocale('')).toBe('es-VE');
    expect(isSupportedLocale('ja')).toBe(true);
    expect(isSupportedLocale('ja-JP')).toBe(false);
  });
});

describe('i18next', () => {
  it('traduce y cambia de idioma', async () => {
    const instance = createI18n({ locale: 'en' });
    const t = translatorFor(instance);
    expect(t('nav.play')).toBe('Play');
    expect(t('holidays.navidad')).toBe('Christmas');
    await instance.changeLanguage('ja');
    expect(t('nav.play')).toBe('プレイ');
    await instance.changeLanguage('es-VE');
    expect(instance.t('game.checkmate')).toBe('Jaque mate');
    await instance.changeLanguage('hi');
    expect(instance.t('game.domino')).toContain('डोमिनो');
    expect(instance.language).toBe('hi');
  });

  it('usa el respaldo español si falta una clave en un idioma', () => {
    const instance = createI18n({ locale: 'ca' });
    expect(instance.t('app.name')).toBe('Mesa Viva');
    expect(String(instance.t('clave.inexistente'))).toBe('clave.inexistente');
  });

  it('construye claves de festividad estables', () => {
    expect(holidayLabelKey('navidad')).toBe('holidays.navidad');
    expect(dictionaryFor('en')[holidayLabelKey('dia-madre')]).toBe("Mother's Day");
  });
});

describe('validador de diccionarios', () => {
  it('detecta faltantes, sobrantes y vacíos', () => {
    const result = validateDictionary({ 'app.name': 'Mesa Viva', extra: 'x', 'nav.home': '  ' });
    expect(result.missing.length).toBe(TRANSLATION_KEYS.length - 2);
    expect(result.extra).toEqual(['extra']);
    expect(result.empty).toEqual(['nav.home']);
  });
});
