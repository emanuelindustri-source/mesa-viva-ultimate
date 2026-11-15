import type { ChessColor, ChessKind, ChessPiece, ChessState } from './types.js';

export const FILES = 'abcdefgh';
export const CHESS_KINDS: readonly ChessKind[] = ['peon', 'torre', 'caballo', 'alfil', 'dama', 'rey'];
export const PIECE_VALUE: Readonly<Record<ChessKind, number>> = {
  peon: 1,
  caballo: 3,
  alfil: 3,
  torre: 5,
  dama: 9,
  rey: 1000,
};

export function opposite(color: ChessColor): ChessColor {
  return color === 'blanco' ? 'negro' : 'blanco';
}

export function rowOf(square: number): number {
  return Math.floor(square / 8);
}

export function colOf(square: number): number {
  return square % 8;
}

export function inBoard(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function squareAt(row: number, col: number): number {
  return row * 8 + col;
}

export function squareName(square: number): string {
  const file = FILES[colOf(square)] ?? '?';
  return `${file}${8 - rowOf(square)}`;
}

export function pieceAt(board: readonly (ChessPiece | null)[], square: number): ChessPiece | null {
  return board[square] ?? null;
}

export function findKing(board: readonly (ChessPiece | null)[], color: ChessColor): number {
  return board.findIndex((piece) => piece !== null && piece.kind === 'rey' && piece.color === color);
}

export function cloneBoard(board: readonly (ChessPiece | null)[]): (ChessPiece | null)[] {
  return board.map((piece) => (piece === null ? null : { ...piece }));
}

export function cloneChessState(state: ChessState): ChessState {
  return {
    ...state,
    board: cloneBoard(state.board),
    players: state.players.map((player) => ({ ...player })),
    winners: [...state.winners],
    log: [...state.log],
  };
}

export function isPromotionRank(color: ChessColor, row: number): boolean {
  return color === 'blanco' ? row === 0 : row === 7;
}

export function pawnDirection(color: ChessColor): number {
  return color === 'blanco' ? -1 : 1;
}

export function homeRow(color: ChessColor): number {
  return color === 'blanco' ? 7 : 0;
}

export const BACK_RANK: readonly ChessKind[] = ['torre', 'caballo', 'alfil', 'dama', 'rey', 'alfil', 'caballo', 'torre'];
