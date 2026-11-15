import { Monitor, Moon, Sun } from 'lucide-react';
import { type Appearance, updateSettings } from './settings.js';
import { useSettings } from './use-settings.js';

const OPTIONS: readonly { id: Appearance; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Oscuro', icon: Moon },
  { id: 'system', label: 'Sistema', icon: Monitor },
];

export function AppearanceToggle() {
  const { appearance } = useSettings();
  return (
    <fieldset class="segmentado" aria-label="Apariencia">
      {OPTIONS.map(({ id, label, icon: Icon }) => (
        <button
          class={`segmentado__boton ${appearance === id ? 'segmentado__boton--activo' : ''}`}
          key={id}
          type="button"
          aria-pressed={appearance === id}
          title={label}
          onClick={() => updateSettings({ appearance: id })}
        >
          <Icon size={16} aria-hidden="true" />
          <span class="solo-lector">{label}</span>
        </button>
      ))}
    </fieldset>
  );
}
