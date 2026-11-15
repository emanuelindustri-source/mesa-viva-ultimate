import type { GameResult, PlayerId } from '../../engine/types.js';
import { kingInCheck, moveFlags } from './moves.js';
import { chessColorOf, chessResult, legalChessActions } from './rules.js';
import type { ChessPieceView, ChessState, ChessView } from './types.js';

export type { ChessView } from './types.js';

export function viewChessState(state: ChessState, viewer: PlayerId): ChessView {
  const color = chessColorOf(state, viewer);
  const legal = color !== null && state.turn === color && state.phase === 'playing'
    ? legalChessActions(state, viewer)
    : [];
  const pieces: ChessPieceView[] = [];
  for (let square = 0; square < 64; square += 1) {
    const piece = state.board[square] ?? null;
    if (piece !== null) pieces.push({ ...piece, square });
  }
  const result: GameResult | null = chessResult(state);
  return {
    gameId: 'ajedrez',
    phase: state.phase,
    turn: state.turn,
    pieces,
    players: state.players,
    legalMoves: legal.map((move) => {
      const flags = moveFlags(state, move);
      return {
        from: move.from,
        to: move.to,
        ...(move.promotion !== undefined ? { promotion: move.promotion } : {}),
        capture: flags.capture || flags.enPassant,
      };
    }),
    check: color !== null && kingInCheck(state, color),
    lastMove: state.lastMove,
    result,
    log: state.log,
  };
}
