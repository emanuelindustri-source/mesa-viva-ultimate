import type { TranslationDictionary } from './keys.js';
import { ca } from './locales/ca.js';
import { de } from './locales/de.js';
import { en } from './locales/en.js';
import { esVE } from './locales/es-VE.js';
import { fr } from './locales/fr.js';
import { hi } from './locales/hi.js';
import { it } from './locales/it.js';
import { ja } from './locales/ja.js';
import { ptBR } from './locales/pt-BR.js';
import { ptPT } from './locales/pt-PT.js';
import { zhCN } from './locales/zh-CN.js';

/** Los 11 idiomas del producto; `es` es alias de español principal. */
export const PRIMARY_LOCALES = [
  'es-VE',
  'en',
  'it',
  'pt-BR',
  'pt-PT',
  'fr',
  'de',
  'ca',
  'hi',
  'ja',
  'zh-CN',
] as const;

export const SUPPORTED_LOCALES = [
  'es-VE',
  'es',
  'en',
  'it',
  'pt-BR',
  'pt-PT',
  'fr',
  'de',
  'ca',
  'hi',
  'ja',
  'zh-CN',
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type PrimaryLocale = (typeof PRIMARY_LOCALES)[number];
export const DEFAULT_LOCALE: PrimaryLocale = 'es-VE';
export const LANGUAGE_COUNT = PRIMARY_LOCALES.length;

export const LOCALE_LABELS: Readonly<Record<SupportedLocale, string>> = {
  'es-VE': 'Español (Venezuela)',
  es: 'Español',
  en: 'English',
  it: 'Italiano',
  'pt-BR': 'Português (Brasil)',
  'pt-PT': 'Português (Portugal)',
  fr: 'Français',
  de: 'Deutsch',
  ca: 'Català',
  hi: 'हिन्दी',
  ja: '日本語',
  'zh-CN': '简体中文',
};

const DICTIONARIES: Readonly<Record<PrimaryLocale, TranslationDictionary>> = {
  'es-VE': esVE,
  en,
  it,
  'pt-BR': ptBR,
  'pt-PT': ptPT,
  fr,
  de,
  ca,
  hi,
  ja,
  'zh-CN': zhCN,
};

function resource(locale: PrimaryLocale): { readonly translation: TranslationDictionary } {
  return { translation: DICTIONARIES[locale] };
}

export const RESOURCES: Readonly<Record<SupportedLocale, { readonly translation: TranslationDictionary }>> = {
  'es-VE': resource('es-VE'),
  es: resource('es-VE'),
  en: resource('en'),
  it: resource('it'),
  'pt-BR': resource('pt-BR'),
  'pt-PT': resource('pt-PT'),
  fr: resource('fr'),
  de: resource('de'),
  ca: resource('ca'),
  hi: resource('hi'),
  ja: resource('ja'),
  'zh-CN': resource('zh-CN'),
};

export function dictionaryFor(locale: SupportedLocale): TranslationDictionary {
  return RESOURCES[locale].translation;
}

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
