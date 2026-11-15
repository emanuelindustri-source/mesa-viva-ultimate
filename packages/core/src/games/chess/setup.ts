import { validatePlayers } from '../../engine/config.js';
import type { GameConfig } from '../../engine/types.js';
import { BACK_RANK, squareName } from './board.js';
import type { ChessPiece, ChessState } from './types.js';

function piece(color: 'blanco' | 'negro', kind: ChessPiece['kind'], square: number): ChessPiece {
  return { id: `${color === 'blanco' ? 'b' : 'n'}-${kind}-${squareName(square)}`, kind, color };
}

export function createChessState(config: GameConfig, _rng: unknown): ChessState {
  validatePlayers(config, 2, 2);
  const board: (ChessPiece | null)[] = Array.from({ length: 64 }, () => null);
  for (let col = 0; col < 8; col += 1) {
    board[col] = piece('negro', BACK_RANK[col] ?? 'peon', col);
    board[8 + col] = piece('negro', 'peon', 8 + col);
    board[48 + col] = piece('blanco', 'peon', 48 + col);
    board[56 + col] = piece('blanco', BACK_RANK[col] ?? 'peon', 56 + col);
  }
  return {
    gameId: 'ajedrez',
    board,
    turn: 'blanco',
    castling: 'KQkq',
    enPassant: null,
    halfmove: 0,
    fullmove: 1,
    phase: 'playing',
    players: config.players.slice(0, 2).map((player, index) => ({
      id: player.id,
      name: player.name,
      color: index === 0 ? 'blanco' : 'negro',
    })),
    winners: [],
    endReason: null,
    lastMove: null,
    log: ['La mesa de ajedrez está lista. Juegan las blancas.'],
    seed: config.seed,
  };
}
