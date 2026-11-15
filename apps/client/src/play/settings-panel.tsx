import { Crown, Eye, Moon, Sun, Trash2 } from 'lucide-react';
import { AppearanceToggle } from '../ui/appearance-toggle.js';
import { HolidayPicker } from '../ui/holiday-picker.js';
import { LanguagePicker } from '../ui/language-picker.js';
import { type AppSettings, updateSettings } from '../ui/settings.js';
import { AudioStudioPanel } from './audio-panel.js';
import type { useSensory } from './use-sensory.js';

interface SettingsPanelProps {
  readonly settings: AppSettings;
  readonly sensory: ReturnType<typeof useSensory>;
  readonly onBack: () => void;
  readonly onConsent: () => void;
  readonly onVip: () => void;
  readonly onReset: () => void;
}

export function SettingsPanel({ settings, sensory, onBack, onConsent, onVip, onReset }: SettingsPanelProps) {
  return (
    <div class="panel-ajustes">
      <header class="panel__cabecera"><div><p class="sobrelinea">Ajustes</p><h2>Tu mesa, a tu manera</h2><p>Apariencia, idioma, audio, accesibilidad y privacidad.</p></div><button class="boton boton--secundario" type="button" onClick={onBack}>Volver</button></header>
      <div class="ajustes__rejilla">
        <section class="panel">
          <h3><Sun size={18} /> Apariencia</h3>
          <p>Modo claro, oscuro o automático del sistema. Se combina con la festividad activa.</p>
          <AppearanceToggle />
          <HolidayPicker />
          <LanguagePicker />
          <div class="campo">
            <span>Color personalizado (Material You)</span>
            <div class="sala__fila">
              <input type="color" value={settings.seedColor ?? '#00695c'} onInput={(event) => updateSettings({ seedColor: event.currentTarget.value })} />
              {settings.seedColor !== null && (
                <button class="boton boton--secundario" type="button" onClick={() => updateSettings({ seedColor: null })}>
                  Usar paleta de la festividad
                </button>
              )}
            </div>
          </div>
          <label class="interruptor"><span><Eye size={17} /> Reducir movimiento</span><input type="checkbox" checked={settings.reducedMotion} onChange={(event) => updateSettings({ reducedMotion: event.currentTarget.checked })} /></label>
          <label class="interruptor"><span><Moon size={17} /> Modo silencioso</span><input type="checkbox" checked={settings.muted} onChange={(event) => updateSettings({ muted: event.currentTarget.checked })} /></label>
        </section>
        <section class="panel">
          <h3><Crown size={18} /> Privacidad y monetización</h3>
          <p>Anuncios con límite de 3 minutos y nunca a mitad de una partida. El consentimiento se puede cambiar.</p>
          <button class="boton boton--secundario" type="button" onClick={onConsent}>Revisar consentimiento</button>
          <button class="boton boton--principal" type="button" onClick={onVip}>{settings.vip ? 'VIP activo' : 'Quitar anuncios + temas VIP'}</button>
          <p class="vacio">Consentimiento actual: {settings.adsConsent}. Fichas virtuales, sin apuestas.</p>
          <button class="boton boton--peligro" type="button" onClick={onReset}><Trash2 size={17} /> Reiniciar perfil local</button>
        </section>
      </div>
      <div class="panel">
        <AudioStudioPanel settings={settings} sensory={sensory} />
      </div>
    </div>
  );
}
