import type { Theme } from '@mesa-viva/design-system';
import { ArrowLeft, DoorOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { AppSettings } from '../ui/settings.js';
import { GameDetails } from './game-details.js';
import { GameResultOverlay } from './game-result.js';
import type { GameSession } from './game-session.js';
import { outcomeFor, signalForAction, vfxForLog, vfxForView } from './game-signals.js';
import { TableStageView } from './table-stage.js';
import type { useSensory } from './use-sensory.js';
import { GameVFXController } from './vfx.js';

interface GamePanelProps {
  readonly session: GameSession;
  readonly theme: Theme;
  readonly settings: AppSettings;
  readonly sensory: ReturnType<typeof useSensory>;
  readonly onExit: () => void;
  readonly onRestart: () => void;
  readonly onFinished: (outcome: 'victoria' | 'derrota' | 'empate') => void;
  readonly externalRevision?: number;
  readonly onChange?: () => void;
}

export function GamePanel({ session, theme, settings, sensory, onExit, onRestart, onFinished, externalRevision = 0, onChange }: GamePanelProps) {
  const [revision, setRevision] = useState(0);
  const [curtain, setCurtain] = useState(false);
  const [reported, setReported] = useState(false);
  const vfxHost = useRef<HTMLDivElement>(null);
  const vfx = useRef<GameVFXController | null>(null);
  const bump = (): void => setRevision((value) => value + 1);
  const result = session.result;
  const current = session.currentPlayer;
  const humanIds = session.seats.filter((seat) => seat.kind === 'human').map((seat) => seat.id);
  const outcome = outcomeFor(result, humanIds);
  const phase = (session.view as { phase?: string }).phase ?? '';
  const viewer = session.seat(session.viewerId);
  const turnSeat = current === null ? undefined : session.seat(current);

  useEffect(() => {
    vfx.current = new GameVFXController(vfxHost.current);
    void sensory.unlock();
    return () => {
      vfx.current?.destroy();
      vfx.current = null;
    };
  }, []);

  useEffect(() => {
    if (externalRevision > 0) bump();
  }, [externalRevision]);

  useEffect(() => {
    if (result !== null && !reported) {
      setReported(true);
      onFinished(outcome);
      sensory.celebrate(outcome === 'derrota' ? 'derrota' : 'victoria');
      vfx.current?.trigger(session.game.key, outcome === 'derrota' ? 'derrota' : 'victoria');
    }
  }, [result, reported, outcome, onFinished, session.game.key, sensory]);

  useEffect(() => {
    if (session.mode !== 'local' || result !== null) return;
    if (turnSeat?.kind === 'human' && current !== null && current !== session.viewerId) {
      session.setViewer(current);
      setCurtain(true);
      bump();
    }
  }, [revision, current, result, session, turnSeat]);

  useEffect(() => {
    if (result !== null || phase === 'match-over' || phase === 'round-over') return;
    if (current === null || !session.isBot(current)) return;
    const timer = setTimeout(() => {
      session.autoPlayBots();
      sensory.setPlayerState({ tension: 0.55, streak: 1 });
      bump();
    }, 620);
    return () => clearTimeout(timer);
  }, [revision, current, phase, result, session, sensory]);

  const act = (option: import('./action-labels.js').ActionOption): void => {
    try {
      const log = session.act(option.action);
      sensory.play(signalForAction(session.game.key, option.action));
      sensory.setPlayerState({ tension: result === null ? 0.5 : 0.9, streak: 1 });
      const event = vfxForView(session.game.key, session.view, session.viewerId)
        ?? vfxForLog(session.game.key, log, session.result);
      if (event !== null) vfx.current?.trigger(session.game.key, event);
      if (session.mode === 'local') {
        const next = session.currentPlayer;
        if (next !== null && session.seat(next)?.kind === 'human' && next !== session.viewerId) {
          session.setViewer(next);
          setCurtain(true);
        }
      }
      onChange?.();
      bump();
    } catch {
      bump();
    }
  };

  const actions = curtain || current !== session.viewerId ? [] : session.actionOptions();
  return (
    <div class="juego" ref={vfxHost}>
      <header class="juego__cabecera">
        <button class="icono-boton" type="button" onClick={onExit} aria-label="Salir de la partida"><ArrowLeft size={20} /></button>
        <div>
          <p class="sobrelinea">{session.mode === 'solo' ? '1 jugador · bots' : session.mode === 'local' ? 'Mesa compartida' : 'Sala online'}</p>
          <h1>{session.game.name}</h1>
        </div>
        <div class="juego__turno">
          <span class="pastilla">{phase}</span>
          <span>{turnSeat === undefined ? 'Mesa' : `Turno: ${turnSeat.name}`}</span>
        </div>
      </header>

      <div class="juego__cuerpo">
        <div class="juego__mesa">
          <TableStageView
            theme={theme}
            snapshot={session.snapshotFor(session.viewerId)}
            rotation={settings.tableRotation}
            reducedMotion={settings.reducedMotion}
            onShake={(intensity) => sensory.onShake(intensity)}
            onFaceDown={(down) => sensory.onFaceDown(down)}
          />
          <GameDetails session={session} />
        </div>
        <aside class="juego__acciones" aria-label="Acciones disponibles">
          <div class="juego__acciones-cabecera">
            <span>{curtain ? 'Privacidad' : viewer?.name ?? 'Mesa'}</span>
            <span class="pastilla">{actions.length} acciones</span>
          </div>
          {actions.length === 0 ? (
            <p class="vacio">{result !== null ? 'Partida terminada.' : phase === 'round-over' ? 'Ronda terminada. Revisa el resultado.' : 'Esperando a la mesa…'}</p>
          ) : (
            <div class="juego__botones">
              {actions.map((action) => (
                <button class={`boton ${action.emphasis === 'danger' ? 'boton--peligro' : action.emphasis === 'ghost' ? 'boton--secundario' : 'boton--principal'}`} key={action.id} type="button" onClick={() => act(action)}>
                  {action.label}
                </button>
              ))}
            </div>
          )}
          <div class="juego__pie">
            <span class="pastilla"><DoorOpen size={13} /> {session.seats.length} asientos</span>
            <span class="pastilla">Semilla {session.seed}</span>
          </div>
        </aside>
      </div>

      {curtain && (
        <div class="cortina">
          <div class="cortina__tarjeta">
            <p class="sobrelinea">Pasa y juega</p>
            <h2>Turno de {turnSeat?.name ?? 'la mesa'}</h2>
            <p>La mano está oculta para cuidar tu privacidad. Entrega el dispositivo y pulsa cuando estés listo.</p>
            <button class="boton boton--principal" type="button" onClick={() => setCurtain(false)}>Mostrar mi mano</button>
          </div>
        </div>
      )}

      <GameResultOverlay result={result} session={session} outcome={outcome} actions={session.result === null ? actions : []} onAction={act} onRestart={onRestart} onExit={onExit} />
    </div>
  );
}
