import type { SeatSnapshot } from '@mesa-viva/engine-25d';

export type HistoryKind = 'canto' | 'captura' | 'caida' | 'tranca' | 'juego' | 'ronda' | 'sistema';

export interface HistoryCard {
  readonly deck: 'espanola' | 'colores' | 'domino';
  readonly rank: string;
  readonly suit: string;
  readonly label?: string;
}

export interface HistoryEntry {
  readonly id: string;
  readonly playerId: string | null;
  readonly playerName: string;
  readonly color: string;
  readonly kind: HistoryKind;
  readonly text: string;
  readonly card: HistoryCard | null;
  readonly score: number | null;
}

export const SEAT_COLORS = ['#ffca52', '#57c7ff', '#ff7b8a', '#8ee06a'] as const;

const SPANISH = /(\d{1,2})\s+de\s+(oros|copas|espadas|bastos)/i;
const DOMINO = /(\d+)\s*[-–]\s*(\d+)/;
const COLOR = /(rojo|azul|verde|amarillo|negro)/i;
const SYMBOL = /(salta|reversa|roba dos|roba cuatro|comodín|comodin|\d+)/i;

function findSeat(line: string, seats: readonly SeatSnapshot[]): { seat: SeatSnapshot | null; index: number } {
  for (let index = 0; index < seats.length; index += 1) {
    const seat = seats[index];
    if (seat !== undefined && line.includes(seat.name)) return { seat, index };
  }
  return { seat: null, index: -1 };
}

function kindFor(line: string): HistoryKind {
  const text = line.toLowerCase();
  if (text.includes('cantó') || text.includes('canto')) return 'canto';
  if (text.includes('caída') || text.includes('caida')) return 'caida';
  if (text.includes('captura') || text.includes('recoge') || text.includes('captur')) return 'captura';
  if (text.includes('tranca') || text.includes('trancó')) return 'tranca';
  if (text.includes('gana') || text.includes('ronda terminada') || text.includes('partida ganada')) return 'ronda';
  if (text.includes('comienza') || text.includes('entrega') || text.includes('mal echada') || text.includes('mesa')) return 'sistema';
  return 'juego';
}

function cardFor(line: string): HistoryCard | null {
  const spanish = SPANISH.exec(line);
  if (spanish !== null) return { deck: 'espanola', rank: spanish[1] ?? '', suit: spanish[2] ?? '' };
  const domino = DOMINO.exec(line);
  if (domino !== null) return { deck: 'domino', rank: domino[1] ?? '0', suit: domino[2] ?? '0' };
  const color = COLOR.exec(line);
  if (color !== null) {
    const symbol = SYMBOL.exec(line)?.[1] ?? '•';
    return { deck: 'colores', rank: symbol, suit: color[1] ?? '', label: symbol };
  }
  return null;
}

/** Convierte el registro textual del motor en turnos ricos para el historial. */
export function buildHistory(log: readonly string[], seats: readonly SeatSnapshot[]): readonly HistoryEntry[] {
  const scores = new Map(seats.map((seat) => [seat.id, seat.score]));
  return log.slice(-160).map((line, index) => {
    const { seat, index: seatIndex } = findSeat(line, seats);
    return {
      id: `${index}-${line}`,
      playerId: seat?.id ?? null,
      playerName: seat?.name ?? 'Mesa',
      color: seatIndex >= 0 ? SEAT_COLORS[seatIndex % SEAT_COLORS.length] ?? '#ffca52' : '#b9ab8f',
      kind: kindFor(line),
      text: line,
      card: cardFor(line),
      score: seat === null ? null : scores.get(seat.id) ?? null,
    };
  });
}
