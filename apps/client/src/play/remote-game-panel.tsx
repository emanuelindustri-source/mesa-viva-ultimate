import type { GameResult } from '@mesa-viva/core';
import type { Theme } from '@mesa-viva/design-system';
import { ArrowLeft, Crown } from 'lucide-react';
import type { AppSettings } from '../ui/settings.js';
import { GameDetailsView } from './game-details.js';
import type { RoomState } from './room-protocol.js';
import { TableStageView } from './table-stage.js';

interface RemoteGamePanelProps {
  readonly state: RoomState;
  readonly playerId: string;
  readonly theme: Theme;
  readonly settings: AppSettings;
  readonly onAction: (action: unknown) => void;
  readonly onExit: () => void;
}

/** Vista de invitado: el anfitrión envía solo la mano y acciones de este jugador. */
export function RemoteGamePanel({ state, playerId, theme, settings, onAction, onExit }: RemoteGamePanelProps) {
  const view = state.views[playerId];
  if (view === undefined) {
    return <div class="panel"><p>Cargando tu vista de la mesa…</p></div>;
  }
  const result = state.result as GameResult | null;
  return (
    <div class="juego">
      <header class="juego__cabecera">
        <button class="icono-boton" type="button" onClick={onExit} aria-label="Salir de la sala"><ArrowLeft size={20} /></button>
        <div><p class="sobrelinea">Sala online · {state.turnPlayer ?? 'mesa'}</p><h1>{state.gameKey}</h1></div>
        <span class="pastilla">{state.phase}</span>
      </header>
      <div class="juego__cuerpo">
        <div class="juego__mesa">
          <TableStageView theme={theme} snapshot={view.snapshot} rotation={settings.tableRotation} reducedMotion={settings.reducedMotion} />
          <GameDetailsView gameKey={state.gameKey} view={view.view} viewerId={playerId} />
        </div>
        <aside class="juego__acciones">
          <div class="juego__acciones-cabecera"><span>Tu turno</span><span class="pastilla">{view.actions.length} acciones</span></div>
          {view.actions.length === 0 ? <p class="vacio">Esperando a los demás jugadores…</p> : (
            <div class="juego__botones">
              {view.actions.map((action) => <button class="boton boton--principal" type="button" key={action.id} onClick={() => onAction(action.action)}>{action.label}</button>)}
            </div>
          )}
          {result !== null && (
            <div class="resultado-inline"><Crown size={18} /><strong>{result.winners.length > 0 ? 'Mesa terminada' : 'Empate'}</strong><span>{result.reason}</span></div>
          )}
        </aside>
      </div>
    </div>
  );
}
