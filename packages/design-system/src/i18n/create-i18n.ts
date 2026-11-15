import i18next, { type i18n, type Resource } from 'i18next';
import type { HolidayId } from '../holidays/holiday-ids.js';
import type { TranslationKey, TranslationVars } from './keys.js';
import {
  DEFAULT_LOCALE,
  type PrimaryLocale,
  RESOURCES,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from './resources.js';

export type { i18n } from 'i18next';

/** Acepta etiquetas BCP 47 aunque lleguen con mayúsculas o variantes. */
export function normalizeLocale(input?: string): SupportedLocale {
  if (input === undefined || input.trim().length === 0) return DEFAULT_LOCALE;
  const clean = input.trim().replaceAll('_', '-').toLowerCase();
  if (clean === 'es-ve' || clean === 'es-419') return 'es-VE';
  if (clean === 'es' || clean.startsWith('es-')) return 'es';
  if (clean === 'pt-br') return 'pt-BR';
  if (clean === 'pt' || clean === 'pt-br') return 'pt-BR';
  if (clean === 'pt-pt' || clean.startsWith('pt-')) return 'pt-PT';
  if (clean === 'zh' || clean.startsWith('zh-')) return 'zh-CN';
  if (clean === 'en' || clean.startsWith('en-')) return 'en';
  if (clean === 'it' || clean.startsWith('it-')) return 'it';
  if (clean === 'fr' || clean.startsWith('fr-')) return 'fr';
  if (clean === 'de' || clean.startsWith('de-')) return 'de';
  if (clean === 'ca' || clean.startsWith('ca-')) return 'ca';
  if (clean === 'hi' || clean.startsWith('hi-')) return 'hi';
  if (clean === 'ja' || clean.startsWith('ja-')) return 'ja';
  return DEFAULT_LOCALE;
}

/** Idioma del navegador, luego `Intl`, luego español de Venezuela. */
export function detectLocale(input?: string): SupportedLocale {
  if (input !== undefined) return normalizeLocale(input);
  try {
    if (typeof navigator !== 'undefined' && navigator.language) return normalizeLocale(navigator.language);
  } catch {
    // Sin navigator: se usa Intl como siguiente opción.
  }
  try {
    return normalizeLocale(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch {
    return DEFAULT_LOCALE;
  }
}

export interface CreateI18nOptions {
  readonly locale?: string;
  readonly fallbackLocale?: PrimaryLocale;
  readonly debug?: boolean;
}

/** Instancia sincrónica de i18next con los 12 códigos (11 idiomas). */
export function createI18n(options: CreateI18nOptions = {}): i18n {
  const instance = i18next.createInstance();
  void instance.init({
    resources: RESOURCES as Resource,
    lng: normalizeLocale(options.locale),
    fallbackLng: options.fallbackLocale ?? DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    load: 'currentOnly',
    initAsync: false,
    interpolation: { escapeValue: false },
    returnNull: false,
    debug: options.debug ?? false,
  });
  return instance;
}

export type Translator = (key: TranslationKey, vars?: TranslationVars) => string;

export function translatorFor(instance: i18n): Translator {
  return (key, vars) => String(instance.t(key, vars ?? {}));
}

/** Clave tipada para el nombre visible de una festividad. */
export function holidayLabelKey(id: HolidayId): TranslationKey {
  return `holidays.${id}`;
}
