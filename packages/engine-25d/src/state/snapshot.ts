export type CardDeck = 'espanola' | 'inglesa' | 'color';
export type CardZone = 'hand' | 'table' | 'dealer' | 'discard';

export interface CardSnapshot {
  readonly id: string;
  readonly deck: CardDeck;
  readonly rank: string;
  readonly suit: string;
  readonly label?: string;
  readonly faceUp: boolean;
  readonly zone: CardZone;
  readonly slot: number;
}

export interface TileSnapshot {
  readonly id: string;
  readonly a: number;
  readonly b: number;
  readonly faceUp: boolean;
  readonly orientation: 'horizontal' | 'vertical';
  readonly side: 'left' | 'right' | 'hand';
  readonly slot: number;
}

export interface SeatSnapshot {
  readonly id: string;
  readonly name: string;
  readonly rank: string;
  readonly isTurn: boolean;
  readonly isDealer: boolean;
  readonly isViewer: boolean;
  readonly handCount: number;
  readonly score: number;
  readonly bankroll?: number;
  readonly badge?: string;
  readonly chatBubble?: string;
}

export interface DiceSnapshot {
  readonly id: string;
  readonly face: number;
  readonly x: number;
  readonly y: number;
}

export interface ChipSnapshot {
  readonly id: string;
  readonly amount: number;
  readonly x: number;
  readonly y: number;
}

export interface TokenSnapshot {
  readonly id: string;
  readonly color: string;
  readonly kind: 'peon' | 'ficha' | 'piedra';
  readonly x: number;
  readonly y: number;
}

export type BoardKind = 'ajedrez' | 'damas' | 'go' | 'ludo' | 'ninguno';

export interface BoardSnapshot {
  readonly kind: BoardKind;
  readonly rows: number;
  readonly columns: number;
  readonly highlighted: readonly string[];
}

export interface TableSnapshot {
  readonly gameId: string;
  readonly phase: string;
  readonly turnPlayerId: string | null;
  readonly viewerId: string;
  readonly seats: readonly SeatSnapshot[];
  readonly hand: readonly CardSnapshot[];
  readonly tableCards: readonly CardSnapshot[];
  readonly tiles: readonly TileSnapshot[];
  readonly dice: readonly DiceSnapshot[];
  readonly chips: readonly ChipSnapshot[];
  readonly tokens: readonly TokenSnapshot[];
  readonly board: BoardSnapshot;
  readonly canInteract: boolean;
}

export const EMPTY_BOARD: BoardSnapshot = {
  kind: 'ninguno',
  rows: 0,
  columns: 0,
  highlighted: [],
};

export function emptySnapshot(gameId: string, viewerId: string): TableSnapshot {
  return {
    gameId,
    phase: 'idle',
    turnPlayerId: null,
    viewerId,
    seats: [],
    hand: [],
    tableCards: [],
    tiles: [],
    dice: [],
    chips: [],
    tokens: [],
    board: EMPTY_BOARD,
    canInteract: false,
  };
}

export function viewerSeatIndex(snapshot: TableSnapshot): number {
  return snapshot.seats.findIndex((seat) => seat.isViewer);
}

export function countFacedown(cards: readonly CardSnapshot[]): number {
  return cards.reduce((total, card) => total + (card.faceUp ? 0 : 1), 0);
}
