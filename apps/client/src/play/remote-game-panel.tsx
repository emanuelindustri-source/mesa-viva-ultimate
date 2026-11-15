import type { GameResult } from '@mesa-viva/core';
import type { Theme } from '@mesa-viva/design-system';
import { Trophy } from 'lucide-react';
import { useMemo, useState } from 'preact/hooks';
import type { AppSettings } from '../ui/settings.js';
import { gameDefinition } from './game-defs.js';
import { buildHistory } from './history.js';
import { PlayHistoryDrawer } from './play-history-drawer.js';
import type { RoomState } from './room-protocol.js';
import { SeatOverlay } from './seat-overlay.js';
import { PHASE_LABEL } from './session-view.js';
import { TableHud } from './table-hud.js';
import { TableStageView } from './table-stage.js';

interface RemoteGamePanelProps {
  readonly state: RoomState;
  readonly playerId: string;
  readonly theme: Theme;
  readonly settings: AppSettings;
  readonly onAction: (action: unknown) => void;
  readonly onExit: () => void;
}

/** Vista de invitado con la misma mesa inmersiva; sin paneles de depuración. */
export function RemoteGamePanel({ state, playerId, theme, settings, onAction, onExit }: RemoteGamePanelProps) {
  const view = state.views[playerId];
  const [historyOpen, setHistoryOpen] = useState(false);
  const entries = useMemo(() => {
    const log = (view?.view as { log?: readonly string[] } | undefined)?.log ?? [];
    return buildHistory(log, view?.snapshot.seats ?? []);
  }, [view]);
  if (view === undefined) {
    return <div class="panel"><p>Cargando tu vista de la mesa…</p></div>;
  }
  const result = state.result as GameResult | null;
  const snapshot = view.snapshot;
  const turnSeat = snapshot.seats.find((seat) => seat.id === view.currentPlayer) ?? snapshot.seats.find((seat) => seat.isTurn);
  const viewerSeat = snapshot.seats.find((seat) => seat.isViewer);
  const chips = viewerSeat?.bankroll ?? viewerSeat?.score ?? 0;
  return (
    <div class="mesa-pantalla">
      <div class="mesa-pantalla__lienzo">
        <TableStageView theme={theme} snapshot={snapshot} rotation={settings.tableRotation} reducedMotion={settings.reducedMotion} />
      </div>
      <TableHud
        title={gameDefinition(state.gameKey).name}
        phaseLabel={PHASE_LABEL[state.phase] ?? 'Mesa'}
        turnName={turnSeat?.name ?? 'Mesa'}
        chips={chips}
        isMyTurn={view.currentPlayer === playerId}
        onExit={onExit}
        onHistory={() => setHistoryOpen((value) => !value)}
      />
      <SeatOverlay seats={snapshot.seats} bubbles={{}} />
      {view.actions.length > 0 && (
        <div class="barra-accion" role="toolbar" aria-label="Acciones de la mesa">
          <div class="barra-accion__contenido">
            {view.actions.map((action) => (
              <button class="boton-accion" type="button" key={action.id} onClick={() => onAction(action.action)}>{action.label}</button>
            ))}
          </div>
        </div>
      )}
      <PlayHistoryDrawer open={historyOpen} entries={entries} players={snapshot.seats.map((seat) => ({ id: seat.id, name: seat.name, score: seat.score }))} onClose={() => setHistoryOpen(false)} />
      {result !== null && (
        <div class="resultado">
          <div class="resultado__tarjeta">
            <span class="resultado__icono"><Trophy size={30} /></span>
            <h2>{result.winners.length > 0 ? 'Mesa terminada' : 'Tablas'}</h2>
            <p>{result.reason}</p>
            <div class="resultado__puntos">
              {Object.entries(result.scores).map(([id, score]) => <span key={id}>{snapshot.seats.find((seat) => seat.id === id)?.name ?? id}: <strong>{score}</strong></span>)}
            </div>
            <div class="resultado__acciones"><button class="boton-accion boton-accion--oro" type="button" onClick={onExit}>Volver al salón</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
