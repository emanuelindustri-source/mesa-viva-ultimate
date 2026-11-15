import type { SeatSnapshot } from '@mesa-viva/engine-25d';
import { PlayerAvatar } from './player-avatar.js';

const RANK_LABEL: Readonly<Record<string, string>> = {
  novato: 'N',
  'jugador-de-club': 'C',
  'maestro-de-mesa': 'M',
  leyenda: 'L',
};

interface SeatOverlayProps {
  readonly seats: readonly SeatSnapshot[];
  readonly bubbles: Readonly<Record<string, string>>;
  readonly canto?: Readonly<Record<string, string>>;
}

/** Tarjetas de jugador en las esquinas, sobre la mesa 2.5D. */
export function SeatOverlay({ seats, bubbles, canto = {} }: SeatOverlayProps) {
  const ordered = [...seats].sort((first, second) => Number(second.isViewer) - Number(first.isViewer));
  return (
    <section class={`asientos-flotantes asientos-flotantes--${Math.min(4, ordered.length)}`} aria-label="Jugadores de la mesa">
      {ordered.map((seat, index) => (
        <article class={`tarjeta-jugador tarjeta-jugador--${index} ${seat.isTurn ? 'tarjeta-jugador--turno' : ''} ${seat.isViewer ? 'tarjeta-jugador--yo' : ''}`} key={seat.id}>
          <div class="tarjeta-jugador__marco">
            <PlayerAvatar seed={index + 1} />
            <span class="tarjeta-jugador__rango" title={`Rango ${seat.rank}`}>{RANK_LABEL[seat.rank] ?? seat.rank.slice(0, 1).toUpperCase()}</span>
            {seat.isDealer && <span class="tarjeta-jugador__crupier">D</span>}
          </div>
          <div class="tarjeta-jugador__datos">
            <strong>{seat.isViewer ? 'Tú' : seat.name}</strong>
            <small>{seat.bankroll !== undefined ? `${seat.bankroll} fichas` : `${seat.score} pts`}</small>
            <span class="tarjeta-jugador__mano" role="img" aria-label={`${seat.handCount} cartas`}>
              {Array.from({ length: Math.min(5, seat.handCount) }, (_, card) => <i key={card} />)}
            </span>
          </div>
          {seat.isTurn && <span class="tarjeta-jugador__turno">Turno</span>}
          {canto[seat.id] !== undefined && <span class="tarjeta-jugador__canto">{canto[seat.id]}</span>}
          {bubbles[seat.id] !== undefined && <span class="globo-comic">{bubbles[seat.id]}</span>}
        </article>
      ))}
    </section>
  );
}
