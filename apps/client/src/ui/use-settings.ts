import { useEffect, useState } from 'preact/hooks';
import { type AppSettings, settingsSnapshot, subscribeSettings } from './settings.js';

/** Hook compartido con almacenamiento local y reactividad entre pantallas. */
export function useSettings(): AppSettings {
  const [settings, setSettings] = useState(settingsSnapshot());
  useEffect(() => subscribeSettings(() => setSettings(settingsSnapshot())), []);
  return settings;
}
