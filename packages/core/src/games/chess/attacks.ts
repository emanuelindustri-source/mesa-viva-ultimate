import { colOf, inBoard, rowOf, squareAt } from './board.js';
import type { ChessColor, ChessPiece } from './types.js';

const KNIGHT_STEPS: readonly (readonly [number, number])[] = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1],
];
const KING_STEPS: readonly (readonly [number, number])[] = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1],
];

export function isSquareAttacked(board: readonly (ChessPiece | null)[], square: number, by: ChessColor): boolean {
  const row = rowOf(square);
  const col = colOf(square);
  const pawnRow = by === 'blanco' ? row + 1 : row - 1;
  for (const fileDelta of [-1, 1]) {
    if (!inBoard(pawnRow, col + fileDelta)) continue;
    const attacker = board[squareAt(pawnRow, col + fileDelta)] ?? null;
    if (attacker !== null && attacker.color === by && attacker.kind === 'peon') return true;
  }
  for (const [dr, dc] of KNIGHT_STEPS) {
    if (!inBoard(row + dr, col + dc)) continue;
    const attacker = board[squareAt(row + dr, col + dc)] ?? null;
    if (attacker !== null && attacker.color === by && attacker.kind === 'caballo') return true;
  }
  for (const [dr, dc] of KING_STEPS) {
    if (!inBoard(row + dr, col + dc)) continue;
    const attacker = board[squareAt(row + dr, col + dc)] ?? null;
    if (attacker !== null && attacker.color === by && attacker.kind === 'rey') return true;
  }
  return ray(board, row, col, by, [[-1, 0], [1, 0], [0, -1], [0, 1]], 'torre')
    || ray(board, row, col, by, [[-1, -1], [-1, 1], [1, -1], [1, 1]], 'alfil');
}

function ray(
  board: readonly (ChessPiece | null)[],
  row: number,
  col: number,
  by: ChessColor,
  directions: readonly (readonly [number, number])[],
  slider: 'torre' | 'alfil',
): boolean {
  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    while (inBoard(r, c)) {
      const piece = board[squareAt(r, c)] ?? null;
      if (piece !== null) {
        if (piece.color === by && (piece.kind === slider || piece.kind === 'dama')) return true;
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return false;
}
