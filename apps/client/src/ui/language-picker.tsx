import { LOCALE_LABELS, PRIMARY_LOCALES, type SupportedLocale } from '@mesa-viva/design-system';
import { Languages } from 'lucide-react';
import { updateSettings } from './settings.js';
import { useSettings } from './use-settings.js';

export function LanguagePicker() {
  const { locale } = useSettings();
  return (
    <label class="selector-idioma">
      <Languages size={16} aria-hidden="true" />
      <span class="solo-lector">Idioma</span>
      <select value={locale} onChange={(event) => updateSettings({ locale: event.currentTarget.value as SupportedLocale })}>
        {PRIMARY_LOCALES.map((id) => <option key={id} value={id}>{LOCALE_LABELS[id]}</option>)}
      </select>
    </label>
  );
}
