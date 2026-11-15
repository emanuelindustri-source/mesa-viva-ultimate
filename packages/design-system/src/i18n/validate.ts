import { TRANSLATION_KEYS, type TranslationKey } from './keys.js';
import { RESOURCES, SUPPORTED_LOCALES, type SupportedLocale } from './resources.js';

export interface LocaleValidation {
  readonly locale: SupportedLocale;
  readonly missing: readonly TranslationKey[];
  readonly extra: readonly string[];
  readonly empty: readonly TranslationKey[];
  readonly valid: boolean;
}

export function validateDictionary(
  dictionary: Readonly<Record<string, string>>,
): Omit<LocaleValidation, 'locale' | 'valid'> {
  const expected = new Set<string>(TRANSLATION_KEYS);
  const actual = new Set(Object.keys(dictionary));
  const missing = TRANSLATION_KEYS.filter((key) => !actual.has(key));
  const extra = [...actual].filter((key) => !expected.has(key));
  const empty = TRANSLATION_KEYS.filter(
    (key) => actual.has(key) && (dictionary[key] ?? '').trim().length === 0,
  );
  return { missing, extra, empty };
}

export function validateAllResources(): readonly LocaleValidation[] {
  return SUPPORTED_LOCALES.map((locale) => {
    const result = validateDictionary(RESOURCES[locale].translation);
    return {
      locale,
      ...result,
      valid: result.missing.length === 0 && result.extra.length === 0 && result.empty.length === 0,
    };
  });
}

export function assertResourcesComplete(): void {
  const invalid = validateAllResources().filter((validation) => !validation.valid);
  if (invalid.length > 0) {
    const summary = invalid.map((item) => `${item.locale}: ${item.missing.join(', ')}`).join('; ');
    throw new Error(`Traducciones incompletas: ${summary}`);
  }
}
