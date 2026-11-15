import { createI18n, type Translator, translatorFor } from '@mesa-viva/design-system';
import { useMemo } from 'preact/hooks';
import { useSettings } from './use-settings.js';

export interface I18nState {
  readonly t: Translator;
  readonly locale: string;
}

/** Traductor reactivo para los 11 idiomas; `es-VE` es el principal. */
export function useI18n(): I18nState {
  const { locale } = useSettings();
  return useMemo(() => {
    const instance = createI18n({ locale });
    return { t: translatorFor(instance), locale };
  }, [locale]);
}
