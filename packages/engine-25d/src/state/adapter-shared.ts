import type { SeatSnapshot } from './snapshot.js';

export function baseSeat(
  id: string,
  name: string,
  viewerId: string,
  score: number,
  isTurn: boolean,
): SeatSnapshot {
  return {
    id,
    name,
    rank: 'novato',
    isTurn,
    isDealer: false,
    isViewer: id === viewerId,
    handCount: 0,
    score,
  };
}
