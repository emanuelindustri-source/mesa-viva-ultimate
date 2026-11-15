import { describe, expect, it } from 'vitest';
import { createRng } from '../src/engine/rng.js';
import type { GameConfig } from '../src/engine/types.js';
import { chooseChessAction } from '../src/games/chess/ai.js';
import { applyChessAction, legalChessActions } from '../src/games/chess/rules.js';
import { createChessState } from '../src/games/chess/setup.js';
import type { ChessAction, ChessState } from '../src/games/chess/types.js';
import { makeConfig } from './helpers.js';

function config(seed = 1): GameConfig {
  return makeConfig(2, seed);
}

function perft(state: ChessState, depth: number): number {
  if (depth === 0) return 1;
  const player = state.turn === 'blanco' ? 'p0' : 'p1';
  const moves = legalChessActions(state, player);
  if (depth === 1) return moves.length;
  let total = 0;
  for (const move of moves) {
    total += perft(applyChessAction(state, player, move), depth - 1);
  }
  return total;
}

describe('ajedrez', () => {
  it('genera 20, 400 y 8902 posiciones en perft 1–3', () => {
    const state = createChessState(config(), createRng(1));
    expect(perft(state, 1)).toBe(20);
    expect(perft(state, 2)).toBe(400);
    expect(perft(state, 3)).toBe(8902);
  });

  it('alterna turnos y registra la jugada', () => {
    const state = createChessState(config(), createRng(1));
    const moves = legalChessActions(state, 'p0');
    expect(moves.length).toBe(20);
    const next = applyChessAction(state, 'p0', moves[0] as ChessAction);
    expect(next.turn).toBe('negro');
    expect(next.log.some((line) => line.includes('mueve'))).toBe(true);
    expect(legalChessActions(next, 'p0')).toHaveLength(0);
    expect(legalChessActions(next, 'p1').length).toBeGreaterThan(0);
  });

  it('el bot elige una jugada legal', () => {
    const state = createChessState(config(), createRng(7));
    const moves = legalChessActions(state, 'p0');
    const chosen = chooseChessAction(state, 'p0', 'competitivo', moves);
    expect(moves.some((move) => move.from === chosen.from && move.to === chosen.to)).toBe(true);
  });
});
