import type { ChessView } from '@mesa-viva/core';
import { baseSeat } from './adapter-shared.js';
import { emptySnapshot, type SeatSnapshot, type TableSnapshot } from './snapshot.js';

/** El tablero de ajedrez se pinta en la capa DOM 2.5D; la mesa queda de fondo. */
export function snapshotFromChess(view: ChessView, viewerId: string): TableSnapshot {
  const base = emptySnapshot('ajedrez', viewerId);
  const seats: SeatSnapshot[] = view.players.map((player) => ({
    ...baseSeat(player.id, player.name, viewerId, 0, player.color === view.turn),
    handCount: 0,
  }));
  const viewerColor = view.players.find((player) => player.id === viewerId)?.color ?? 'blanco';
  return {
    ...base,
    phase: view.phase,
    turnPlayerId: view.players.find((player) => player.color === view.turn)?.id ?? null,
    seats,
    canInteract: view.phase === 'playing' && viewerColor === view.turn,
  };
}
