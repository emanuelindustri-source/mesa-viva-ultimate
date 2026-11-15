import type { RoomLobby, RoomPlayer } from './room-protocol.js';

/** Actualiza la lista de asientos conservando el orden del salón. */
export function withPlayer(lobby: RoomLobby | null, player: RoomPlayer): RoomLobby | null {
  if (lobby === null) return null;
  return {
    ...lobby,
    players: [...lobby.players.filter((item) => item.id !== player.id), player],
  };
}

export function withDisconnected(lobby: RoomLobby | null, id: string | undefined): RoomLobby | null {
  if (lobby === null || id === undefined) return null;
  return {
    ...lobby,
    players: lobby.players.map((player) =>
      player.id === id ? { ...player, connected: false } : player,
    ),
  };
}
