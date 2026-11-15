import type { GameResult, PlayerId } from '../../engine/types.js';

export type ChessColor = 'blanco' | 'negro';
export type ChessKind = 'peon' | 'torre' | 'caballo' | 'alfil' | 'dama' | 'rey';
export type ChessPromotion = 'dama' | 'torre' | 'alfil' | 'caballo';

export interface ChessPiece {
  readonly id: string;
  readonly kind: ChessKind;
  readonly color: ChessColor;
}

export interface ChessPlayer {
  readonly id: PlayerId;
  readonly name: string;
  readonly color: ChessColor;
}

export interface ChessMove {
  readonly type: 'move';
  readonly from: number;
  readonly to: number;
  readonly promotion?: ChessPromotion;
}

export type ChessAction = ChessMove;

export interface ChessState {
  readonly gameId: 'ajedrez';
  board: (ChessPiece | null)[];
  turn: ChessColor;
  castling: string;
  enPassant: number | null;
  halfmove: number;
  fullmove: number;
  phase: 'playing' | 'match-over';
  players: readonly ChessPlayer[];
  winners: PlayerId[];
  endReason: string | null;
  lastMove: { readonly from: number; readonly to: number } | null;
  log: string[];
  readonly seed: number;
}

export interface ChessMoveView {
  readonly from: number;
  readonly to: number;
  readonly promotion?: ChessPromotion;
  readonly capture: boolean;
}

export interface ChessPieceView extends ChessPiece {
  readonly square: number;
}

export interface ChessView {
  readonly gameId: 'ajedrez';
  readonly phase: ChessState['phase'];
  readonly turn: ChessColor;
  readonly pieces: readonly ChessPieceView[];
  readonly players: readonly ChessPlayer[];
  readonly legalMoves: readonly ChessMoveView[];
  readonly check: boolean;
  readonly lastMove: { readonly from: number; readonly to: number } | null;
  readonly result: GameResult | null;
  readonly log: readonly string[];
}
