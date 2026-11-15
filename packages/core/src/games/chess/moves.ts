import { isSquareAttacked } from './attacks.js';
import {
  cloneBoard,
  colOf,
  findKing,
  inBoard,
  isPromotionRank,
  opposite,
  pawnDirection,
  rowOf,
  squareAt,
} from './board.js';
import type { ChessAction, ChessColor, ChessMove, ChessPiece, ChessPromotion, ChessState } from './types.js';

export interface MoveFlags {
  readonly capture: boolean;
  readonly castle: 'rey' | 'dama' | null;
  readonly enPassant: boolean;
  readonly promotion: ChessPromotion | null;
}

const PROMOTIONS: readonly ChessPromotion[] = ['dama', 'torre', 'alfil', 'caballo'];
const KNIGHT_STEPS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]] as const;
const KING_STEPS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]] as const;
const BISHOP_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const;
const ROOK_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const;

export function pseudoMoves(state: ChessState, from: number): ChessMove[] {
  const piece = state.board[from] ?? null;
  if (piece === null) return [];
  const row = rowOf(from);
  const col = colOf(from);
  const moves: ChessMove[] = [];
  const push = (to: number, promotion?: ChessPromotion): void => {
    const target = state.board[to] ?? null;
    if (target !== null && target.color === piece.color) return;
    if (promotion === undefined) moves.push({ type: 'move', from, to });
    else moves.push({ type: 'move', from, to, promotion });
  };
  if (piece.kind === 'peon') {
    const dir = pawnDirection(piece.color);
    const nextRow = row + dir;
    if (inBoard(nextRow, col) && (state.board[squareAt(nextRow, col)] ?? null) === null) {
      const to = squareAt(nextRow, col);
      if (isPromotionRank(piece.color, nextRow)) for (const promotion of PROMOTIONS) push(to, promotion);
      else {
        push(to);
        const startRow = piece.color === 'blanco' ? 6 : 1;
        const doubleRow = row + dir * 2;
        if (row === startRow && (state.board[squareAt(doubleRow, col)] ?? null) === null) push(squareAt(doubleRow, col));
      }
    }
    for (const dc of [-1, 1]) {
      const r = nextRow;
      const c = col + dc;
      if (!inBoard(r, c)) continue;
      const to = squareAt(r, c);
      const target = state.board[to] ?? null;
      const capture = target !== null && target.color !== piece.color;
      const enPassant = state.enPassant === to && target === null;
      if (!capture && !enPassant) continue;
      if (isPromotionRank(piece.color, r)) for (const promotion of PROMOTIONS) push(to, promotion);
      else push(to);
    }
    return moves;
  }
  if (piece.kind === 'caballo' || piece.kind === 'rey') {
    const steps = piece.kind === 'caballo' ? KNIGHT_STEPS : KING_STEPS;
    for (const [dr, dc] of steps) {
      if (inBoard(row + dr, col + dc)) push(squareAt(row + dr, col + dc));
    }
    if (piece.kind === 'rey') addCastling(state, piece.color, from, push);
    return moves;
  }
  const dirs = piece.kind === 'alfil' ? BISHOP_DIRS : piece.kind === 'torre' ? ROOK_DIRS : [...BISHOP_DIRS, ...ROOK_DIRS];
  for (const [dr, dc] of dirs) {
    let r = row + dr;
    let c = col + dc;
    while (inBoard(r, c)) {
      const to = squareAt(r, c);
      const target = state.board[to] ?? null;
      if (target === null) push(to);
      else {
        if (target.color !== piece.color) push(to);
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return moves;
}

function addCastling(state: ChessState, color: ChessColor, from: number, push: (to: number) => void): void {
  const home = color === 'blanco' ? 60 : 4;
  if (from !== home) return;
  const enemy = opposite(color);
  if (isSquareAttacked(state.board, home, enemy)) return;
  const kingSide = color === 'blanco' ? 'K' : 'k';
  const queenSide = color === 'blanco' ? 'Q' : 'q';
  const rookKing = state.board[home + 3] ?? null;
  if (state.castling.includes(kingSide) && rookKing?.kind === 'torre' && rookKing.color === color
    && (state.board[home + 1] ?? null) === null && (state.board[home + 2] ?? null) === null
    && !isSquareAttacked(state.board, home + 1, enemy)) push(home + 2);
  const rookQueen = state.board[home - 4] ?? null;
  if (state.castling.includes(queenSide) && rookQueen?.kind === 'torre' && rookQueen.color === color
    && (state.board[home - 1] ?? null) === null && (state.board[home - 2] ?? null) === null && (state.board[home - 3] ?? null) === null
    && !isSquareAttacked(state.board, home - 1, enemy)) push(home - 2);
}

export function moveFlags(state: ChessState, move: ChessAction): MoveFlags {
  const piece = state.board[move.from] ?? null;
  const target = state.board[move.to] ?? null;
  const castle = piece?.kind === 'rey' && colOf(move.from) === 4 && Math.abs(colOf(move.to) - 4) === 2
    ? colOf(move.to) > 4 ? 'rey' : 'dama' : null;
  return {
    capture: target !== null,
    castle,
    enPassant: piece?.kind === 'peon' && target === null && colOf(move.from) !== colOf(move.to),
    promotion: piece?.kind === 'peon' && isPromotionRank(piece.color, rowOf(move.to))
      ? move.promotion ?? 'dama' : null,
  };
}

export function applyToBoard(board: readonly (ChessPiece | null)[], move: ChessAction, flags: MoveFlags): (ChessPiece | null)[] {
  const next = cloneBoard(board);
  const piece = next[move.from] ?? null;
  if (piece === null) return next;
  next[move.from] = null;
  if (flags.enPassant) {
    const captured = piece.color === 'blanco' ? move.to + 8 : move.to - 8;
    next[captured] = null;
  }
  next[move.to] = flags.promotion === null ? { ...piece } : { ...piece, kind: flags.promotion };
  if (flags.castle !== null) {
    const rookFrom = flags.castle === 'rey' ? move.from + 3 : move.from - 4;
    const rookTo = flags.castle === 'rey' ? move.from + 1 : move.from - 1;
    const rook = next[rookFrom] ?? null;
    if (rook !== null) {
      next[rookFrom] = null;
      next[rookTo] = rook;
    }
  }
  return next;
}

export function kingInCheck(state: ChessState, color: ChessColor): boolean {
  const king = findKing(state.board, color);
  return king >= 0 && isSquareAttacked(state.board, king, opposite(color));
}

export function legalMovesFrom(state: ChessState, from: number): ChessMove[] {
  const piece = state.board[from] ?? null;
  if (piece === null) return [];
  return pseudoMoves(state, from).filter((move) => {
    const after = applyToBoard(state.board, move, moveFlags(state, move));
    const king = findKing(after, piece.color);
    return king < 0 || !isSquareAttacked(after, king, opposite(piece.color));
  });
}

export function allLegalMoves(state: ChessState, color: ChessColor): ChessMove[] {
  const moves: ChessMove[] = [];
  for (let square = 0; square < 64; square += 1) {
    if ((state.board[square] ?? null)?.color !== color) continue;
    moves.push(...legalMovesFrom(state, square));
  }
  return moves;
}

export function hasAnyLegalMove(state: ChessState, color: ChessColor): boolean {
  return allLegalMoves(state, color).length > 0;
}
