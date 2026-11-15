import { sameAction } from '../../engine/action-key.js';
import { IllegalActionError } from '../../engine/errors.js';
import type { GameResult, PlayerId } from '../../engine/types.js';
import { findKing, opposite, squareName } from './board.js';
import {
  allLegalMoves,
  applyToBoard,
  hasAnyLegalMove,
  kingInCheck,
  moveFlags,
} from './moves.js';
import type { ChessAction, ChessColor, ChessKind, ChessState } from './types.js';

const KIND_NAME: Readonly<Record<ChessKind, string>> = {
  peon: 'peón',
  torre: 'torre',
  caballo: 'caballo',
  alfil: 'alfil',
  dama: 'dama',
  rey: 'rey',
};

function log(state: ChessState, message: string): void {
  state.log.push(message);
  if (state.log.length > 80) state.log.splice(0, state.log.length - 80);
}

export function chessColorOf(state: ChessState, player: PlayerId): ChessColor | null {
  return state.players.find((candidate) => candidate.id === player)?.color ?? null;
}

export function currentChessPlayer(state: ChessState): PlayerId | null {
  if (state.phase === 'match-over') return null;
  return state.players.find((player) => player.color === state.turn)?.id ?? null;
}

export function legalChessActions(state: ChessState, player: PlayerId): ChessAction[] {
  if (state.phase === 'match-over') return [];
  const color = chessColorOf(state, player);
  if (color === null || color !== state.turn) return [];
  return allLegalMoves(state, color);
}

function updateCastling(state: ChessState, from: number, to: number): void {
  let rights = state.castling;
  if (from === 60 || to === 60) rights = rights.replaceAll('K', '').replaceAll('Q', '');
  if (from === 4 || to === 4) rights = rights.replaceAll('k', '').replaceAll('q', '');
  if (from === 63 || to === 63) rights = rights.replaceAll('K', '');
  if (from === 56 || to === 56) rights = rights.replaceAll('Q', '');
  if (from === 7 || to === 7) rights = rights.replaceAll('k', '');
  if (from === 0 || to === 0) rights = rights.replaceAll('q', '');
  state.castling = rights;
}

function insufficientMaterial(state: ChessState): boolean {
  const pieces = state.board.filter((piece) => piece !== null);
  if (pieces.length > 4) return false;
  return pieces.every((piece) => piece.kind === 'rey' || piece.kind === 'alfil' || piece.kind === 'caballo');
}

function finish(state: ChessState, winners: PlayerId[], reason: string): ChessState {
  state.phase = 'match-over';
  state.winners = winners;
  state.endReason = reason;
  log(state, reason);
  return state;
}

export function applyChessAction(state: ChessState, player: PlayerId, action: ChessAction): ChessState {
  if (!legalChessActions(state, player).some((candidate) => sameAction(candidate, action))) {
    throw new IllegalActionError(`Movimiento de ajedrez ilegal para ${player}`);
  }
  const mover = state.players.find((candidate) => candidate.id === player);
  if (!mover) throw new IllegalActionError('Jugador desconocido');
  const next: ChessState = {
    ...state,
    board: state.board,
    players: state.players,
    winners: [...state.winners],
    log: [...state.log],
  };
  const piece = next.board[action.from] ?? null;
  if (piece === null) throw new IllegalActionError('Casilla de origen vacía');
  const flags = moveFlags(next, action);
  next.board = applyToBoard(next.board, action, flags);
  updateCastling(next, action.from, action.to);
  const rowDelta = Math.abs(Math.floor(action.from / 8) - Math.floor(action.to / 8));
  next.enPassant = piece.kind === 'peon' && rowDelta === 2 ? (action.from + action.to) / 2 : null;
  next.halfmove = piece.kind === 'peon' || flags.capture ? 0 : next.halfmove + 1;
  next.lastMove = { from: action.from, to: action.to };
  if (piece.color === 'negro') next.fullmove += 1;
  next.turn = opposite(piece.color);
  const target = state.board[action.to] ?? null;
  const suffix = flags.promotion === null ? '' : ` y corona ${KIND_NAME[flags.promotion]}`;
  const capture = target !== null || flags.enPassant ? ` captura a ${KIND_NAME[target?.kind ?? 'peon']}` : '';
  log(next, `${mover.name} mueve ${KIND_NAME[piece.kind]} ${squareName(action.from)}→${squareName(action.to)}${suffix}${capture}`);

  const enemy = next.turn;
  const enemyPlayer = next.players.find((candidate) => candidate.color === enemy);
  const inCheck = kingInCheck(next, enemy);
  if (inCheck) log(next, `${enemyPlayer?.name ?? 'El rival'} está en jaque`);
  if (!hasAnyLegalMove(next, enemy)) {
    return inCheck
      ? finish(next, [player], `${mover.name} da jaque mate`)
      : finish(next, [], 'Rey ahogado: tablas');
  }
  if (next.halfmove >= 100) return finish(next, [], 'Tablas por la regla de 50 movimientos');
  if (insufficientMaterial(next)) return finish(next, [], 'Tablas por material insuficiente');
  return next;
}

export function chessResult(state: ChessState): GameResult | null {
  if (state.phase !== 'match-over') return null;
  const scores: Record<PlayerId, number> = {};
  for (const player of state.players) scores[player.id] = state.winners.includes(player.id) ? 1 : state.winners.length === 0 ? 0.5 : 0;
  return { winners: state.winners, scores, reason: state.endReason ?? 'jaque mate' };
}

export function checkSquare(state: ChessState): number {
  return findKing(state.board, state.turn);
}
