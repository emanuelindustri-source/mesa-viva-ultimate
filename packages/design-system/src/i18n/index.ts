export type { CreateI18nOptions, Translator } from './create-i18n.js';
export { createI18n, detectLocale, holidayLabelKey, normalizeLocale, translatorFor } from './create-i18n.js';
export type { TranslationDictionary, TranslationKey, TranslationVars } from './keys.js';
export { TRANSLATION_KEYS } from './keys.js';
export type { PrimaryLocale, SupportedLocale } from './resources.js';
export {
  DEFAULT_LOCALE,
  dictionaryFor,
  isSupportedLocale,
  LANGUAGE_COUNT,
  LOCALE_LABELS,
  PRIMARY_LOCALES,
  RESOURCES,
  SUPPORTED_LOCALES,
} from './resources.js';
export type { LocaleValidation } from './validate.js';
export { assertResourcesComplete, validateAllResources, validateDictionary } from './validate.js';
