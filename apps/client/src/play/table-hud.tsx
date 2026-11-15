import { ArrowLeft, Coins, History, Settings, Volume2 } from 'lucide-react';

interface TableHudProps {
  readonly title: string;
  readonly phaseLabel: string;
  readonly turnName: string;
  readonly chips: number;
  readonly isMyTurn: boolean;
  readonly onExit: () => void;
  readonly onHistory: () => void;
  readonly onAudio?: () => void;
  readonly onSettings?: () => void;
}

/** HUD de una sola línea y botones flotantes de solo iconos. */
export function TableHud({ title, phaseLabel, turnName, chips, isMyTurn, onExit, onHistory, onAudio, onSettings }: TableHudProps) {
  return (
    <>
      <header class="hud-mesa">
        <button class="boton-hud" type="button" onClick={onExit} aria-label="Volver al salón"><ArrowLeft size={20} /></button>
        <div class="hud-mesa__titulo">
          <strong>{title}</strong>
          <span class={`hud-mesa__turno ${isMyTurn ? 'hud-mesa__turno--yo' : ''}`}>
            <i /> {phaseLabel} · {turnName}
          </span>
        </div>
        <span class="hud-mesa__fichas"><Coins size={15} /> {chips}</span>
      </header>
      <nav class="hud-lateral" aria-label="Controles de mesa">
        <button class="boton-hud" type="button" onClick={onHistory} aria-label="Historial de jugadas"><History size={20} /></button>
        {onAudio !== undefined && <button class="boton-hud" type="button" onClick={onAudio} aria-label="Audio multicanal"><Volume2 size={20} /></button>}
        {onSettings !== undefined && <button class="boton-hud" type="button" onClick={onSettings} aria-label="Ajustes"><Settings size={20} /></button>}
      </nav>
    </>
  );
}
