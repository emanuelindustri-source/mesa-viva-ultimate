import { History, X } from 'lucide-react';
import { CardArt } from './card-art.js';
import { type HistoryEntry, SEAT_COLORS } from './history.js';

interface PlayHistoryDrawerProps {
  readonly open: boolean;
  readonly entries: readonly HistoryEntry[];
  readonly players: readonly { readonly id: string; readonly name: string; readonly score: number }[];
  readonly onClose: () => void;
}

const KIND_LABEL: Readonly<Record<HistoryEntry['kind'], string>> = {
  canto: 'Canto',
  captura: 'Captura',
  caida: 'Caída',
  tranca: 'Tranca',
  juego: 'Jugada',
  ronda: 'Ronda',
  sistema: 'Mesa',
};

export function PlayHistoryDrawer({ open, entries, players, onClose }: PlayHistoryDrawerProps) {
  return (
    <aside class={`panel-historial ${open ? 'panel-historial--abierto' : ''}`} aria-label="Historial de jugadas" aria-hidden={!open}>
      <header class="panel-historial__cabecera">
        <span class="panel-historial__titulo"><History size={18} /> Historial</span>
        <button class="boton-hud" type="button" onClick={onClose} aria-label="Cerrar historial"><X size={18} /></button>
      </header>
      <div class="panel-historial__marcador">
        {players.map((player, index) => (
          <div class="marcador-jugador" key={player.id}>
            <i style={{ background: SEAT_COLORS[index % SEAT_COLORS.length] }} />
            <span>{player.name}</span>
            <strong>{player.score}</strong>
          </div>
        ))}
      </div>
      <div class="panel-historial__lista" role="log" aria-live="polite">
        {entries.length === 0 && <p class="panel-historial__vacio">La mesa aún no tiene jugadas.</p>}
        {entries.map((entry) => (
          <article class={`fila-historial fila-historial--${entry.kind}`} key={entry.id}>
            <span class="fila-historial__punto" style={{ background: entry.color }} />
            <div class="fila-historial__cuerpo">
              <header>
                <strong>{entry.playerName}</strong>
                <span>{KIND_LABEL[entry.kind]}</span>
                {entry.score !== null && <small>{entry.score} pts</small>}
              </header>
              <p>{entry.text}</p>
            </div>
            {entry.card !== null && <CardArt deck={entry.card.deck} rank={entry.card.rank} suit={entry.card.suit} className="arte-carta--historial" />}
          </article>
        ))}
      </div>
    </aside>
  );
}
