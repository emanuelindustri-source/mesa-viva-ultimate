import { createTheme, HolidayEngine, type HolidayId, type Theme } from '@mesa-viva/design-system';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { nativeDynamicColors } from './material-you.js';
import { resolveAppearance } from './settings.js';
import { useSettings } from './use-settings.js';

function systemPrefersDark(): boolean {
  try {
    return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  } catch {
    return false;
  }
}

export interface AppThemeState {
  readonly theme: Theme;
  readonly holidayId: HolidayId;
  readonly prefersDark: boolean;
}

/** Matriz festividad × claro/oscuro × sistema, aplicada como variables CSS. */
export function useAppTheme(): AppThemeState {
  const settings = useSettings();
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark());
  useEffect(() => {
    let media: MediaQueryList | null = null;
    try {
      media = globalThis.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
    } catch {
      media = null;
    }
    if (media === null) return;
    const listener = (event: MediaQueryListEvent): void => setPrefersDark(event.matches);
    media.addEventListener?.('change', listener);
    return () => media.removeEventListener?.('change', listener);
  }, []);
  const holidayId = useMemo(() => {
    if (settings.holiday !== 'auto') return settings.holiday;
    try {
      return new HolidayEngine({ locale: settings.locale }).resolve().holidayId;
    } catch {
      return 'dia-normal';
    }
  }, [settings.holiday, settings.locale]);
  const theme = useMemo(() => createTheme({
    mode: resolveAppearance(settings.appearance, prefersDark),
    locale: settings.locale,
    holidayId,
    contrast: settings.reducedMotion ? 'high' : 'standard',
    dynamicColors: nativeDynamicColors(),
    ...(settings.seedColor !== null ? { seed: settings.seedColor } : {}),
  }), [settings.appearance, settings.locale, settings.reducedMotion, settings.seedColor, holidayId, prefersDark]);
  useEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of Object.entries(theme.cssVariables)) root.style.setProperty(name, value);
    root.dataset.appearance = theme.mode;
    root.dataset.holiday = holidayId;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', theme.scheme.background);
  }, [theme, holidayId]);
  return { theme, holidayId, prefersDark };
}
