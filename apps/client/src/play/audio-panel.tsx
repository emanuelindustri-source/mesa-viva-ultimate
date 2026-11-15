import type { OutputMode } from '@mesa-viva/sensory-engine';
import { Drum, Mic, Power, Sparkles, Vibrate, Volume2, Waves } from 'lucide-react';
import { useState } from 'preact/hooks';
import { SENSORY_OUTPUTS } from '../sensory-data.js';
import { type AppSettings, updateSettings } from '../ui/settings.js';
import { Slider } from '../ui/slider.js';
import type { useSensory } from './use-sensory.js';

interface AudioStudioPanelProps {
  readonly settings: AppSettings;
  readonly sensory: ReturnType<typeof useSensory>;
}

export function AudioStudioPanel({ settings, sensory }: AudioStudioPanelProps) {
  const [message, setMessage] = useState('El audio espera un gesto. Nada suena hasta que lo actives.');
  const toggleSound = async (): Promise<void> => {
    if (settings.muted) {
      updateSettings({ muted: false });
      setMessage('Audio restaurado.');
      return;
    }
    const ok = await sensory.unlock();
    setMessage(ok ? 'Audio de estudio activo a 48 kHz.' : 'El navegador bloqueó el audio. Toca de nuevo.');
  };
  return (
    <div class="estudio">
      <div class="estudio__cabecera">
        <div><p class="sobrelinea">Estudio de audio</p><h3>Mezcla multicanal</h3><p>Música evolutiva, voz, percusión, SFX y ondas neuronales.</p></div>
        <button class={`boton ${settings.muted ? 'boton--secundario' : 'boton--principal'}`} type="button" onClick={() => void toggleSound()}>
          <Power size={17} /> {settings.muted ? 'Reactivar audio' : 'Activar audio'}
        </button>
      </div>
      <div class="estudio__salidas">
        <span class="mezclador__etiqueta">Salida física</span>
        <div class="festivales">
          {SENSORY_OUTPUTS.map((choice) => (
            <button class={`festival ${settings.outputMode === choice.id ? 'festival--activo' : ''}`} key={choice.id} type="button" aria-pressed={settings.outputMode === choice.id} title={choice.detail} onClick={() => updateSettings({ outputMode: choice.id as OutputMode })}>
              {choice.label}
            </button>
          ))}
        </div>
      </div>
      <div class="mezclador">
        <Slider label="Música evolutiva" icon="♫" value={settings.musicVolume} onChange={(musicVolume) => updateSettings({ musicVolume })} />
        <Slider label="Voz tarareando" icon="◉" value={settings.humVolume} onChange={(humVolume) => updateSettings({ humVolume })} />
        <Slider label="Beatbox / percusión" icon="◍" value={settings.percussionVolume} onChange={(percussionVolume) => updateSettings({ percussionVolume })} />
        <Slider label="SFX armónicos" icon="✦" value={settings.sfxVolume} onChange={(sfxVolume) => updateSettings({ sfxVolume })} />
        <Slider label="Ondas binaurales" icon="≈" value={settings.binauralVolume} onChange={(binauralVolume) => updateSettings({ binauralVolume })} />
        <Slider label="Vibración háptica" icon="⌁" value={settings.hapticsIntensity} onChange={(hapticsIntensity) => updateSettings({ hapticsIntensity })} />
      </div>
      <div class="estudio__iconos" aria-hidden="true">
        <Volume2 size={18} /><Mic size={18} /><Drum size={18} /><Sparkles size={18} /><Waves size={18} /><Vibrate size={18} />
      </div>
      <p class="lab__estado" aria-live="polite">{message}</p>
    </div>
  );
}
