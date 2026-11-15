import {
  type ComposerInstrument,
  type EffectId,
  type FestivalId,
  festivalProfile,
  type OutputMode,
  type PerformanceState,
  SensorySession,
} from '@mesa-viva/sensory-engine';
import { useEffect, useRef, useState } from 'preact/hooks';
import { FestivalPicker, GestureButtons, OutputModes, StateModes } from './sensory-controls.js';
import {
  INITIAL_LEVELS,
  SENSORY_INSTRUMENTS,
} from './sensory-data.js';
import './sensory-lab.css';

type Levels = Readonly<Record<ComposerInstrument, number>>;

function percent(value: number): string {
  return `${Math.min(100, Math.round(value * 100))}%`;
}

export function SensoryLab() {
  const sessionRef = useRef<SensorySession | null>(null);
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [festival, setFestival] = useState<FestivalId>('dia-normal');
  const [outputMode, setOutputMode] = useState<OutputMode>('auto');
  const [state, setState] = useState<PerformanceState>('calma');
  const [levels, setLevels] = useState<Levels>(INITIAL_LEVELS);
  const [outputLabel, setOutputLabel] = useState('Auto · se detecta al activar');
  const [message, setMessage] = useState('La banda sonora espera tu primer toque. Nada suena hasta que tú quieras.');
  const [engine, setEngine] = useState('Estudio · 48 kHz · limitador -1 dBFS');

  useEffect(() => () => {
    void sessionRef.current?.dispose();
    sessionRef.current = null;
  }, []);

  const ensureSession = (): SensorySession => {
    if (sessionRef.current === null) {
      sessionRef.current = new SensorySession({
        festival,
        musicEngine: 'studio',
        outputMode,
        soundtrackBars: 48,
        autoTick: true,
        preferences: { musicVolume: 0.55, effectsVolume: 0.8, hapticsEnabled: true },
      });
    }
    return sessionRef.current;
  };

  const sync = (session: SensorySession): void => {
    session.setFestival(festival);
    session.setPlayerState(state);
    session.setOutputMode(outputMode);
    setLevels(session.status.soundtrack?.instrumentLevels ?? INITIAL_LEVELS);
    setOutputLabel(`${session.outputStatus.label} · ${session.outputStatus.channels} canales`);
  };

  const activate = async (): Promise<void> => {
    const session = ensureSession();
    const status = await session.unlock();
    sync(session);
    if (status.state === 'activo') {
      setActive(true);
      const haptics = session.status.haptics;
      setEngine(`${session.outputStatus.label} · 48 kHz · ${haptics.available ? haptics.source : 'sin háptica'}`);
      setMessage('Banda sonora activa. Cambia de estado, festividad o salida y escucha la orquesta.');
    } else {
      setMessage(status.reason);
    }
  };

  const chooseFestival = (id: FestivalId): void => {
    setFestival(id);
    sessionRef.current?.setFestival(id);
    const profile = festivalProfile(id);
    setMessage(`${profile.label} · ${profile.tempo} BPM · ${profile.motif}`);
  };

  const chooseOutput = (mode: OutputMode): void => {
    setOutputMode(mode);
    sessionRef.current?.setOutputMode(mode);
    const status = sessionRef.current?.outputStatus;
    if (status === undefined) {
      setOutputLabel(`${mode} · al activar`);
      setMessage(`${mode} seleccionado para el próximo arranque.`);
      return;
    }
    setOutputLabel(`${status.label} · ${status.channels} canales`);
    setLevels(sessionRef.current?.status.soundtrack?.instrumentLevels ?? INITIAL_LEVELS);
    setMessage(status.fallback ? `${mode} no disponible; usando ${status.label} (${status.channels} canales).` : status.description);
  };

  const chooseState = (next: PerformanceState): void => {
    setState(next);
    const applied = sessionRef.current?.setPlayerState(next) ?? next;
    setLevels(sessionRef.current?.status.soundtrack?.instrumentLevels ?? INITIAL_LEVELS);
    setMessage(`Estado ${applied}. La orquesta ajusta densidad, graves y percusión.`);
  };

  const trigger = (event: EffectId, label: string, modal: string): void => {
    const session = ensureSession();
    void session.unlock().then((status) => {
      if (status.state === 'activo') setActive(true);
      sync(session);
      const result = session.play(event);
      setMessage(`${label} · ${result?.effect?.mode ?? modal}${result?.haptic === null || result?.haptic === undefined ? '' : ' · háptica'}`);
    }).catch(() => setMessage('El navegador bloqueó el audio. Toca de nuevo.'));
  };

  const sparkle = (): void => {
    const session = ensureSession();
    void session.unlock().then(() => {
      sync(session);
      const sfx = session.playHarmonicSfx('sparkle', 69);
      setMessage(sfx === null ? 'El SFX armónico espera al acorde activo.' : `Chime afinado en ${sfx.midi} · ${Math.round(sfx.frequency)} Hz`);
    });
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
        <p class="sobrelinea">Fase 5 · Audio de estudio en vivo</p>
        <h2 id="titulo-sensorial">La mesa suena, vibra y respira.</h2>
        <p>
          Ocho instrumentos orgánicos, voz tarareando y salida multicanal 2.0–7.1.
          Todo se sintetiza a 48 kHz en tu dispositivo, sin archivos externos.
        </p>
      </div>
      <div class="lab">
        <div class="lab__cabecera">
          <div>
            <span class="lab__sello">Estudio · compositor de forma larga</span>
            <h3>Banda sonora multicanal en vivo</h3>
            <p>Movimientos de 32–64 compases con pregunta y respuesta entre voz, Rhodes y cuatro. Los graves viajan al LFE.</p>
          </div>
          <div class="lab__botones">
            <button class={`boton ${active ? 'boton--activo' : 'boton--principal'}`} type="button" onClick={activate}>
              {active ? '✓ Banda sonora activa' : 'Activar banda sonora'}
            </button>
            <button class="boton boton--secundario" type="button" aria-pressed={muted} disabled={!active} onClick={toggleMute}>
              {muted ? 'Reactivar audio' : 'Silenciar'}
            </button>
          </div>
        </div>

        <div class="lab__cuerpo">
          <ol class="stems" aria-label="Instrumentos de la banda sonora">
            {SENSORY_INSTRUMENTS.map((instrument) => {
              const level = levels[instrument.id] ?? 0;
              const max = Math.max(0.001, ...Object.values(levels));
              return (
                <li class={`stem stem--${instrument.id}`} key={instrument.id}>
                  <div class="stem__pista">
                    <span class="stem__relleno" style={{ height: `${Math.max(6, Math.round((level / max) * 100))}%` }} />
                  </div>
                  <strong>{instrument.label}</strong>
                  <span class="stem__valor">{percent(level)}</span>
                  <p>{instrument.role} · {instrument.zone}</p>
                </li>
              );
            })}
          </ol>

          <div class="lab__controles">
            <OutputModes selected={outputMode} onSelect={chooseOutput} />
            <StateModes selected={state} onSelect={chooseState} />
            <FestivalPicker selected={festival} onSelect={chooseFestival} />
            <GestureButtons onTrigger={(event, label) => trigger(event, label, 'mono')} onSparkle={sparkle} />
            <p class="lab__estado" aria-live="polite">{message}</p>
            <div class="lab__ficha">
              <span>{engine}</span>
              <span>{outputLabel}</span>
              <span>32–64 compases</span>
              <span>Voz · formantes /m/ /u/ /o/</span>
              <span>Cero archivos externos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
