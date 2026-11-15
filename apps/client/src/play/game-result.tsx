import type { GameResult } from '@mesa-viva/core';
import { Crown, RotateCcw, Trophy } from 'lucide-react';
import type { ActionOption } from './action-labels.js';
import type { GameSession } from './game-session.js';

interface GameResultOverlayProps {
  readonly result: GameResult | null;
  readonly session: GameSession;
  readonly outcome: 'victoria' | 'derrota' | 'empate';
  readonly onRestart: () => void;
  readonly onExit: () => void;
  readonly actions?: readonly ActionOption[];
  readonly onAction?: (action: ActionOption) => void;
}

export function GameResultOverlay({ result, session, outcome, onRestart, onExit, actions = [], onAction }: GameResultOverlayProps) {
  if (result === null) return null;
  const names = result.winners.map((id) => session.seat(id)?.name ?? id).join(' y ');
  return (
    <div class="resultado">
      <div class="resultado__tarjeta">
        <span class="resultado__icono">{outcome === 'victoria' ? <Trophy size={30} /> : outcome === 'empate' ? <Crown size={30} /> : <RotateCcw size={30} />}</span>
        <p class="sobrelinea">{outcome === 'victoria' ? 'Victoria' : outcome === 'empate' ? 'Empate' : 'Derrota'}</p>
        <h2>{names.length > 0 ? names : 'La mesa queda en tablas'}</h2>
        <p>{result.reason}</p>
        <div class="resultado__puntos">
          {Object.entries(result.scores).map(([id, score]) => <span key={id}>{session.seat(id)?.name ?? id}: <strong>{score}</strong></span>)}
        </div>
        {actions.length > 0 && onAction !== undefined && (
          <div class="resultado__acciones">
            {actions.map((action) => <button class="boton boton--principal" type="button" key={action.id} onClick={() => onAction(action)}>{action.label}</button>)}
          </div>
        )}
        <div class="resultado__acciones">
          <button class="boton boton--principal" type="button" onClick={onRestart}>Nueva partida</button>
          <button class="boton boton--secundario" type="button" onClick={onExit}>Volver al salón</button>
        </div>
      </div>
    </div>
  );
}
