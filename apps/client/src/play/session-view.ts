import type { GameSession } from './game-session.js';

export const PHASE_LABEL: Readonly<Record<string, string>> = {
  playing: 'En juego',
  betting: 'Apuestas',
  settled: 'Mano cerrada',
  'round-over': 'Ronda cerrada',
  'match-over': 'Partida terminada',
  'session-over': 'Sesión terminada',
};

export function readLog(session: GameSession): readonly string[] {
  const view = session.view as { log?: readonly string[] };
  return view.log ?? [];
}

export function readCantos(session: GameSession): Readonly<Record<string, string>> {
  if (session.game.key !== 'caida') return {};
  const players = (session.view as { players?: readonly { id: string; canto: { label: string } | null }[] }).players ?? [];
  return Object.fromEntries(players.flatMap((player) => player.canto === null ? [] : [[player.id, `¡${player.canto.label}!`]]));
}
