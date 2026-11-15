import type { ChessView } from '@mesa-viva/core';
import type { Theme } from '@mesa-viva/design-system';
import type { DropResult } from '@mesa-viva/engine-25d';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { AppSettings } from '../ui/settings.js';
import { ActionBar } from './action-bar.js';
import type { ActionOption } from './action-labels.js';
import { ChessBoard } from './board-chess.js';
import { ChatDock } from './chat-dock.js';
import { GameResultOverlay } from './game-result.js';
import type { GameSession } from './game-session.js';
import { outcomeFor, signalForAction, vfxForLog, vfxForView } from './game-signals.js';
import { buildHistory } from './history.js';
import { applyCardDrop } from './play-card.js';
import { PlayHistoryDrawer } from './play-history-drawer.js';
import { SeatOverlay } from './seat-overlay.js';
import { PHASE_LABEL, readCantos, readLog } from './session-view.js';
import { TableHud } from './table-hud.js';
import { type SheetKind, TableSheets } from './table-sheets.js';
import { TableStageView } from './table-stage.js';
import type { useSensory } from './use-sensory.js';
import { GameVFXController } from './vfx.js';

interface GamePanelProps {
  readonly session: GameSession;
  readonly theme: Theme;
  readonly settings: AppSettings;
  readonly sensory: ReturnType<typeof useSensory>;
  readonly chips: number;
  readonly onExit: () => void;
  readonly onRestart: () => void;
  readonly onFinished: (outcome: 'victoria' | 'derrota' | 'empate') => void;
  readonly externalRevision?: number;
  readonly onChange?: () => void;
}


export function GamePanel({ session, theme, settings, sensory, chips, onExit, onRestart, onFinished, externalRevision = 0, onChange }: GamePanelProps) {
  const [revision, setRevision] = useState(0);
  const [curtain, setCurtain] = useState(false);
  const [reported, setReported] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1180);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [bubbles, setBubbles] = useState<Readonly<Record<string, string>>>({});
  const [notice, setNotice] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const vfx = useRef<GameVFXController | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bump = (): void => setRevision((value) => value + 1);
  const result = session.result;
  const current = session.currentPlayer;
  const humanIds = session.seats.filter((seat) => seat.kind === 'human').map((seat) => seat.id);
  const outcome = outcomeFor(result, humanIds);
  const phase = (session.view as { phase?: string }).phase ?? '';
  const snapshot = session.snapshotFor(session.viewerId);
  const turnSeat = current === null ? undefined : session.seat(current);
  const log = readLog(session);
  const entries = useMemo(() => buildHistory(log, snapshot.seats), [revision, externalRevision, log, snapshot.seats]);
  const cantos = readCantos(session);
  const isMyTurn = current === session.viewerId && result === null;

  const say = (playerId: string, message: string): void => {
    setBubbles((previous) => ({ ...previous, [playerId]: message }));
    const timer = setTimeout(() => setBubbles((previous) => {
      const next = { ...previous };
      delete next[playerId];
      return next;
    }), 3200);
    timers.current.push(timer);
  };
  const flash = (message: string): void => {
    setNotice(message);
    const timer = setTimeout(() => setNotice(''), 2200);
    timers.current.push(timer);
  };

  useEffect(() => {
    vfx.current = new GameVFXController(root.current);
    void sensory.unlock();
    return () => {
      vfx.current?.destroy();
      vfx.current = null;
      for (const timer of timers.current) clearTimeout(timer);
      timers.current = [];
    };
  }, []);
  useEffect(() => {
    setReported(false);
    setCurtain(false);
    setBubbles({});
  }, [session]);
  useEffect(() => { if (externalRevision > 0) bump(); }, [externalRevision]);
  useEffect(() => {
    if (result === null || reported) return;
    setReported(true);
    onFinished(outcome);
    sensory.celebrate(outcome === 'derrota' ? 'derrota' : 'victoria');
    vfx.current?.trigger(session.game.key, outcome === 'derrota' ? 'derrota' : 'victoria');
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
    if (result !== null || phase === 'match-over' || phase === 'round-over' || phase === 'settled' || phase === 'session-over') return;
    if (current === null || !session.isBot(current)) return;
    const timer = setTimeout(() => {
      session.autoPlayBots();
      sensory.setPlayerState({ tension: 0.55, streak: 1 });
      onChange?.();
      bump();
    }, 640);
    return () => clearTimeout(timer);
  }, [revision, current, phase, result, session, sensory, onChange]);

  const afterAction = (action: unknown): void => {
    sensory.play(signalForAction(session.game.key, action));
    sensory.setPlayerState({ tension: result === null ? 0.5 : 0.9, streak: 1 });
    const event = vfxForView(session.game.key, session.view, session.viewerId) ?? vfxForLog(session.game.key, log, session.result);
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
  };
  const perform = (action: unknown): void => {
    try {
      session.act(action);
      afterAction(action);
    } catch {
      flash('Esa jugada no es válida ahora.');
    }
  };

  const act = (option: ActionOption): void => perform(option.action);

  const drop = (dropResult: DropResult): void => {
    if (dropResult.zone === null && !dropResult.tap) return;
    try {
      const fresh = applyCardDrop(session, dropResult);
      if (fresh === null) return;
      const line = fresh.join(' ').toLowerCase();
      if (line.includes('caída') || line.includes('caida')) say(session.viewerId, '¡Caída!');
      else if (line.includes('captura')) say(session.viewerId, '¡Captura!');
      afterAction({ type: 'play' });
    } catch {
      flash('Esa carta no se puede jugar ahora.');
    }
  };

  const canto = (playerId: string, label: string): void => {
    say(playerId, label);
    sensory.play('celebracion');
    vfx.current?.trigger('caida', 'canto');
  };

  const chat = (message: string): void => {
    say(session.viewerId, message);
    sensory.play('ui-click');
  };

  const actions = curtain || current !== session.viewerId ? [] : session.actionOptions();
  const chessView = session.game.key === 'ajedrez' ? session.view as ChessView : null;
  return (
    <div class="mesa-pantalla" ref={root}>
      <div class="mesa-pantalla__lienzo">
        <TableStageView theme={theme} snapshot={snapshot} rotation={settings.tableRotation} reducedMotion={settings.reducedMotion} onShake={(value) => sensory.onShake(value)} onFaceDown={(value) => sensory.onFaceDown(value)} onCardDrop={drop} />
      </div>
      <TableHud title={session.game.name} phaseLabel={PHASE_LABEL[phase] ?? 'Mesa'} turnName={turnSeat?.name ?? 'Mesa'} chips={chips} isMyTurn={isMyTurn} onExit={onExit} onHistory={() => setHistoryOpen((value) => !value)} onAudio={() => setSheet('audio')} onSettings={() => setSheet('settings')} />
      <SeatOverlay seats={snapshot.seats} bubbles={bubbles} canto={cantos} />
      {chessView !== null && !curtain && <ChessBoard view={chessView} viewerId={session.viewerId} onAction={perform} />}
      {notice.length > 0 && <div class="aviso-mesa" role="status">{notice}</div>}
      {!curtain && <ActionBar session={session} actions={actions} phase={phase} onAct={act} onCanto={canto} />}
      <ChatDock open={chatOpen} onToggle={() => setChatOpen((value) => !value)} onSend={chat} />
      <PlayHistoryDrawer open={historyOpen} entries={entries} players={snapshot.seats.map((seat) => ({ id: seat.id, name: seat.name, score: seat.score }))} onClose={() => setHistoryOpen(false)} />
      <TableSheets kind={sheet} settings={settings} sensory={sensory} onClose={() => setSheet(null)} />
      {curtain && (
        <div class="cortina">
          <div class="cortina__tarjeta">
            <p class="sobrelinea">Pasa y juega</p>
            <h2>Turno de {turnSeat?.name ?? 'la mesa'}</h2>
            <p>La mano está oculta para cuidar tu privacidad. Entrega el dispositivo y pulsa cuando estés listo.</p>
            <button class="boton-accion boton-accion--oro" type="button" onClick={() => setCurtain(false)}>Mostrar mi mano</button>
          </div>
        </div>
      )}
      <GameResultOverlay result={result} session={session} outcome={outcome} actions={session.result === null ? actions : []} onAction={act} onRestart={onRestart} onExit={onExit} />
    </div>
  );
}
