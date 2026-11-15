import {
  type EffectId,
  type FestivalId,
  festivalProfile,
  SensorySession,
  type StemId,
  stemMix,
} from '@mesa-viva/sensory-engine';
import { useEffect, useRef, useState } from 'preact/hooks';
import { SENSORY_FESTIVALS, SENSORY_GESTURES, SENSORY_STEMS } from './sensory-data.js';
import './sensory-lab.css';

type Levels = Readonly<Record<StemId, number>>;

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function SensoryLab() {
  const sessionRef = useRef<SensorySession | null>(null);
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [festival, setFestival] = useState<FestivalId>('dia-normal');
  const [tension, setTension] = useState(18);
  const [levels, setLevels] = useState<Levels>(() => stemMix(0.18, festivalProfile('dia-normal')));
  const [message, setMessage] = useState('El audio espera tu primer toque. Nada suena hasta que tú quieras.');
  const [engine, setEngine] = useState('Audio perezoso · 48 kHz · HRTF');

  useEffect(() => () => {
    void sessionRef.current?.dispose();
    sessionRef.current = null;
  }, []);

  const ensureSession = (): SensorySession => {
    if (sessionRef.current === null) {
      sessionRef.current = new SensorySession({
        festival,
        autoTick: true,
        preferences: { musicVolume: 0.5, effectsVolume: 0.8, hapticsEnabled: true },
      });
    }
    return sessionRef.current;
  };

  const sync = (session: SensorySession): void => {
    session.setFestival(festival);
    session.setTension(tension / 100);
  };

  const activate = async (): Promise<void> => {
    const session = ensureSession();
    const status = await session.unlock();
    sync(session);
    if (status.state === 'activo') {
      setActive(true);
      const haptics = session.status.haptics;
      const hapticLabel = haptics.source === 'capacitor' ? 'Capacitor' : haptics.source === 'web' ? 'háptica web' : 'sin háptica';
      setEngine(`${Math.round(status.sampleRate / 1000)} kHz · ${haptics.available ? hapticLabel : 'háptica no disponible'}`);
      setMessage('Mesa activa. Mueve la tensión y escucha cómo entran los ocho stems.');
    } else {
      setMessage(status.reason);
    }
  };

  const chooseFestival = (id: FestivalId): void => {
    setFestival(id);
    setLevels(stemMix(tension / 100, festivalProfile(id)));
    sessionRef.current?.setFestival(id);
    setMessage(`${festivalProfile(id).label} · tempo ${festivalProfile(id).tempo} BPM · ${festivalProfile(id).motif}`);
  };

  const moveTension = (value: number): void => {
    const safe = Math.min(100, Math.max(0, value));
    setTension(safe);
    setLevels(stemMix(safe / 100, festivalProfile(festival)));
    sessionRef.current?.setTension(safe / 100);
  };

  const trigger = (event: EffectId, label: string): void => {
    const session = ensureSession();
    void session.unlock().then((status) => {
      if (status.state === 'activo') setActive(true);
      sync(session);
      const result = session.play(event);
      const mode = result?.effect?.mode === 'hrtf' ? '3D HRTF' : result?.effect?.mode ?? 'sin audio';
      setMessage(`${label} · ${mode}${result?.haptic === null || result?.haptic === undefined ? '' : ' · háptica'}`);
    }).catch(() => setMessage('El navegador bloqueó el audio. Toca de nuevo.'));
  };

  const toggleMute = (): void => {
    const next = !muted;
    setMuted(next);
    sessionRef.current?.setMuted(next);
    setMessage(next ? 'Silencio. Las reglas y los turnos siguen intactos.' : 'Audio restaurado.');
  };

  return (
    <section class="seccion" id="sensorial" aria-labelledby="titulo-sensorial">
      <div class="seccion__titulo">
        <p class="sobrelinea">Fase 4 · Motor Sensorial</p>
        <h2 id="titulo-sensorial">La mesa suena, vibra y respira.</h2>
        <p>
          Ocho stems sincronizados, audio 3D HRTF y háptica de precisión reaccionan a la tensión
          de la partida y a las 19 festividades locales. Todo se sintetiza en tu dispositivo.
        </p>
      </div>
      <div class="lab">
        <div class="lab__cabecera">
          <div>
            <span class="lab__sello">Laboratorio sensorial</span>
            <h3>Mezcla adaptativa en vivo</h3>
            <p>Sube la tensión y observa cómo el pad cede el paso al pulso, el bajo, la melodía y el acento festivo.</p>
          </div>
          <div class="lab__botones">
            <button class={`boton ${active ? 'boton--activo' : 'boton--principal'}`} type="button" onClick={activate}>
              {active ? '✓ Sonido activo' : 'Activar sonido'}
            </button>
            <button class="boton boton--secundario" type="button" aria-pressed={muted} disabled={!active} onClick={toggleMute}>
              {muted ? 'Reactivar audio' : 'Silenciar'}
            </button>
          </div>
        </div>

        <div class="lab__cuerpo">
          <ol class="stems" aria-label="Mezcla de los ocho stems musicales">
            {SENSORY_STEMS.map((stem) => {
              const level = levels[stem.id] ?? 0;
              return (
                <li class={`stem stem--${stem.id}`} key={stem.id}>
                  <div class="stem__pista">
                    <span class="stem__relleno" style={{ height: `${Math.max(5, Math.round(level * 100))}%` }} />
                  </div>
                  <strong>{stem.label}</strong>
                  <span class="stem__valor">{percent(level)}</span>
                  <p>{stem.role}</p>
                </li>
              );
            })}
          </ol>

          <div class="lab__controles">
            <label class="lab__tension">
              <span>Tensión de la partida</span>
              <input
                type="range"
                min="0"
                max="100"
                value={tension}
                aria-valuetext={`${tension} por ciento`}
                onInput={(event) => moveTension(Number(event.currentTarget.value))}
              />
              <strong>{tension}%</strong>
            </label>
            <fieldset class="festivales">
              <legend class="lab__leyenda">Festividad local</legend>
              {SENSORY_FESTIVALS.map((choice) => (
                <button
                  class={`festival ${festival === choice.id ? 'festival--activo' : ''}`}
                  key={choice.id}
                  type="button"
                  aria-pressed={festival === choice.id}
                  onClick={() => chooseFestival(choice.id)}
                >
                  <span class="festival__punto" style={{ background: choice.color }} />
                  {choice.label}
                </button>
              ))}
            </fieldset>
            <fieldset class="gestos">
              <legend class="lab__leyenda">Probar gestos</legend>
              {SENSORY_GESTURES.map((gesture) => (
                <button class="gesto" key={gesture.event} type="button" onClick={() => trigger(gesture.event, gesture.label)}>
                  <span aria-hidden="true">{gesture.icon}</span>
                  {gesture.label}
                </button>
              ))}
            </fieldset>
            <p class="lab__estado" aria-live="polite">{message}</p>
            <div class="lab__ficha">
              <span>{engine}</span>
              <span>Limitador maestro</span>
              <span>8 voces HRTF</span>
              <span>Cero archivos externos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
