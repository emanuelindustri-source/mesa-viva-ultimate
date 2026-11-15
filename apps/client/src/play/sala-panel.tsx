import { Play, Plus, Trash2, Users } from 'lucide-react';
import type { PlayerSeat } from './game-session.js';
import { PlayerAvatar } from './player-avatar.js';
import { addGuest, removeGuest, renameGuest, type SalaGuest } from './sala-store.js';

interface SalaPanelProps {
  readonly ownerName: string;
  readonly guests: readonly SalaGuest[];
  readonly gameName: string;
  readonly onGuests: (guests: readonly SalaGuest[]) => void;
  readonly onStart: (seats: readonly PlayerSeat[]) => void;
}

/** Sala persistente: los invitados acompañan varias partidas seguidas. */
export function SalaPanel({ ownerName, guests, gameName, onGuests, onStart }: SalaPanelProps) {
  const seats: PlayerSeat[] = [
    { id: 'p0', name: ownerName, kind: 'human' },
    ...guests.map((guest, index) => ({ id: `p${index + 1}`, name: guest.name, kind: 'human' as const })),
  ];
  return (
    <section class="play-seccion sala-juegos">
      <div class="sala-juegos__cabecera">
        <div>
          <p class="sobrelinea"><Users size={13} /> Sala de juegos</p>
          <h2>Tus invitados se quedan en la mesa</h2>
          <p class="sala-juegos__nota">Juega varias partidas seguidas sin volver a crear la sala. Cambia de juego y la misma mesa te espera.</p>
        </div>
        <div class="sala-juegos__acciones">
          <button class="boton boton--principal" type="button" onClick={() => onStart(seats)}><Play size={17} /> Jugar {gameName}</button>
          <button class="boton boton--secundario" type="button" onClick={() => onGuests(addGuest(guests))} disabled={guests.length >= 3}><Plus size={16} /> Invitar</button>
        </div>
      </div>
      <div class="sala-juegos__rejilla">
        <article class="invitado invitado--owner">
          <PlayerAvatar seed={1} />
          <div><strong>{ownerName}</strong><small>Anfitrión</small></div>
          <span class="invitado__insignia">TÚ</span>
        </article>
        {guests.map((guest, index) => (
          <article class="invitado" key={guest.id}>
            <PlayerAvatar seed={guest.avatar} />
            <div>
              <input value={guest.name} aria-label={`Nombre de ${guest.name}`} maxLength={18} onChange={(event) => onGuests(renameGuest(guests, guest.id, event.currentTarget.value))} />
              <small>Invitado {index + 1}</small>
            </div>
            <button class="invitado__quitar" type="button" aria-label={`Quitar a ${guest.name}`} onClick={() => onGuests(removeGuest(guests, guest.id))}><Trash2 size={15} /></button>
          </article>
        ))}
        {guests.length === 0 && <p class="sala-juegos__vacio">Invita a alguien para compartir el dispositivo.</p>}
      </div>
    </section>
  );
}
