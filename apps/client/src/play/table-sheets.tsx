import { X } from 'lucide-react';
import { AppearanceToggle } from '../ui/appearance-toggle.js';
import { HolidayPicker } from '../ui/holiday-picker.js';
import { type AppSettings, updateSettings } from '../ui/settings.js';
import { AudioStudioPanel } from './audio-panel.js';
import type { useSensory } from './use-sensory.js';

export type SheetKind = 'audio' | 'settings' | null;

interface TableSheetsProps {
  readonly kind: SheetKind;
  readonly settings: AppSettings;
  readonly sensory: ReturnType<typeof useSensory>;
  readonly onClose: () => void;
}

/** Hoja lateral de ajustes y audio sin abandonar la partida. */
export function TableSheets({ kind, settings, sensory, onClose }: TableSheetsProps) {
  if (kind === null) return null;
  return (
    <div class="hoja-mesa" role="dialog" aria-modal="true" aria-label={kind === 'audio' ? 'Audio multicanal' : 'Ajustes de mesa'}>
      <header class="hoja-mesa__cabecera">
        <h2>{kind === 'audio' ? 'Audio multicanal' : 'Ajustes de mesa'}</h2>
        <button class="boton-hud" type="button" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
      </header>
      <div class="hoja-mesa__cuerpo">
        {kind === 'audio' ? <AudioStudioPanel settings={settings} sensory={sensory} /> : (
          <div class="hoja-mesa__ajustes">
            <div class="ajuste-fila"><span>Apariencia</span><AppearanceToggle /></div>
            <div class="ajuste-fila"><span>Festividad</span><HolidayPicker /></div>
            <label class="ajuste-fila"><span>Rotación de mesa</span>
              <select value={settings.tableRotation} onChange={(event) => updateSettings({ tableRotation: Number(event.currentTarget.value) === 180 ? 180 : 0 })}>
                <option value={0}>Normal</option>
                <option value={180}>Opuesta</option>
              </select>
            </label>
            <label class="ajuste-fila"><span>Movimiento reducido</span><input type="checkbox" checked={settings.reducedMotion} onChange={(event) => updateSettings({ reducedMotion: event.currentTarget.checked })} /></label>
            <label class="ajuste-fila"><span>Silenciar sonido</span><input type="checkbox" checked={settings.muted} onChange={(event) => updateSettings({ muted: event.currentTarget.checked })} /></label>
            <p class="hoja-mesa__nota">Los cambios se aplican a la mesa al instante. No se interrumpe la partida.</p>
          </div>
        )}
      </div>
    </div>
  );
}
