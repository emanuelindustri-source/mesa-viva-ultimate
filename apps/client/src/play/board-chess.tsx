import type { ChessKind, ChessView } from '@mesa-viva/core';
import { useEffect, useState } from 'preact/hooks';

const GLYPHS: Readonly<Record<ChessKind, readonly [string, string]>> = {
  rey: ['♔', '♚'],
  dama: ['♕', '♛'],
  torre: ['♖', '♜'],
  alfil: ['♗', '♝'],
  caballo: ['♘', '♞'],
  peon: ['♙', '♟'],
};
const NAMES: Readonly<Record<ChessKind, string>> = {
  rey: 'Rey', dama: 'Dama', torre: 'Torre', alfil: 'Alfil', caballo: 'Caballo', peon: 'Peón',
};
const FILES = 'abcdefgh';

interface ChessBoardProps {
  readonly view: ChessView;
  readonly viewerId: string;
  readonly onAction: (action: unknown) => void;
}

export function ChessBoard({ view, viewerId, onAction }: ChessBoardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const viewerColor = view.players.find((player) => player.id === viewerId)?.color ?? 'blanco';
  const myTurn = view.phase === 'playing' && view.turn === viewerColor;
  const targets = selected === null ? [] : view.legalMoves.filter((move) => move.from === selected);
  const targetSquares = new Set(targets.map((move) => move.to));
  const checkedKing = view.check ? view.pieces.find((piece) => piece.color === viewerColor && piece.kind === 'rey')?.square ?? null : null;

  useEffect(() => { setSelected(null); }, [view.turn, view.phase]);

  const clickSquare = (square: number): void => {
    if (!myTurn) return;
    const target = targets.find((move) => move.to === square);
    if (target !== undefined) {
      onAction({ type: 'move', from: target.from, to: target.to, ...(target.promotion !== undefined ? { promotion: target.promotion } : {}) });
      setSelected(null);
      return;
    }
    const piece = view.pieces.find((candidate) => candidate.square === square);
    setSelected(piece !== undefined && piece.color === viewerColor ? square : null);
  };

  const lastSquares = view.lastMove === null ? new Set<number>() : new Set([view.lastMove.from, view.lastMove.to]);

  return (
    <section class={`tablero-ajedrez ${view.phase === 'match-over' ? 'tablero-ajedrez--fin' : ''}`} aria-label="Tablero de ajedrez">
      <div class="tablero-ajedrez__marco">
        <div class="tablero-ajedrez__placa">
          <span>AJEDREZ DE CLUB</span>
          <strong>{view.turn === 'blanco' ? 'Juegan blancas' : 'Juegan negras'}</strong>
          {view.check && <em>Jaque</em>}
        </div>
        <div class="tablero-ajedrez__celdas">
          {Array.from({ length: 64 }, (_, square) => {
            const row = Math.floor(square / 8);
            const dark = (row + square) % 2 === 1;
            const file = FILES[square % 8] ?? '';
            const rank = 8 - row;
            const piece = view.pieces.find((candidate) => candidate.square === square);
            return (
              <button
                class={`casilla ${dark ? 'casilla--oscura' : 'casilla--clara'} ${selected === square ? 'casilla--elegida' : ''} ${lastSquares.has(square) ? 'casilla--ultima' : ''} ${checkedKing === square ? 'casilla--jaque' : ''}`}
                type="button"
                key={square}
                onClick={() => clickSquare(square)}
                aria-label={`${file}${rank}${piece === undefined ? '' : `, ${piece.color} ${NAMES[piece.kind]}`}`}
              >
                {targetSquares.has(square) && <span class={`objetivo ${piece !== undefined ? 'objetivo--captura' : ''}`} />}
                {(square >= 56 || square % 8 === 0) && <span class="casilla__coord">{square % 8 === 0 ? rank : file}</span>}
              </button>
            );
          })}
        </div>
        <div class="tablero-ajedrez__piezas" aria-hidden="true">
          {view.pieces.map((piece) => {
            const row = Math.floor(piece.square / 8);
            const col = piece.square % 8;
            const glyph = GLYPHS[piece.kind][piece.color === 'blanco' ? 0 : 1];
            return (
              <span
                class={`pieza-ajedrez pieza-ajedrez--${piece.color} ${selected === piece.square ? 'pieza-ajedrez--elegida' : ''}`}
                key={piece.id}
                style={{ transform: `translate(${col * 100}%, ${row * 100}%)` }}
              >
                {glyph}
              </span>
            );
          })}
        </div>
      </div>
      <p class="tablero-ajedrez__aviso">{view.phase === 'match-over' ? 'Partida terminada' : myTurn ? 'Toca una pieza y luego su casilla' : 'Esperando el turno rival'}</p>
    </section>
  );
}
