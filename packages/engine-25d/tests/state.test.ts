import type {
  BlackjackView,
  CaidaView,
  ColorsView,
  DominoView,
} from '@mesa-viva/core';
import { describe, expect, it } from 'vitest';
import {
  snapshotFromBlackjack,
  snapshotFromCaida,
  snapshotFromColors,
  snapshotFromDomino,
} from '../src/state/adapters.js';
import { countFacedown, emptySnapshot, viewerSeatIndex } from '../src/state/snapshot.js';

const blackjack: BlackjackView = {
  gameId: 'blackjack',
  phase: 'playing',
  round: 1,
  roundsPlayed: 0,
  maxRounds: 20,
  dealer: {
    cards: [{ id: 'd1', rank: 'K', suit: 'corazones' }],
    hidden: true,
    total: 10,
  },
  players: [{
    id: 'p1',
    name: 'Ana Pérez',
    bankroll: 950,
    hand: {
      cards: [
        { id: 'c1', rank: 'A', suit: 'picas' },
        { id: 'c2', rank: 'K', suit: 'diamantes' },
      ],
      total: 21,
      soft: true,
      bet: 50,
      doubled: false,
      status: 'blackjack',
      outcome: 'pending',
      payout: 0,
    },
  }],
  turnPlayer: 'p1',
  betPlayer: null,
  minBet: 5,
  maxBet: 100,
  shoeCount: 40,
  result: null,
  log: [],
};

const domino: DominoView = {
  gameId: 'domino',
  mode: '1v1',
  phase: 'playing',
  leftEnd: 6,
  rightEnd: 2,
  board: [{
    tile: { id: 'ficha-domino-6-2', a: 6, b: 2 },
    side: 'left',
    flipped: false,
  }],
  boneyardCount: 10,
  players: [
    { id: 'p1', name: 'Ana', handCount: 6, totalPips: 24, score: 10, hand: [{ id: 'ficha-domino-3-3', a: 3, b: 3 }] },
    { id: 'p2', name: 'Luis', handCount: 6, totalPips: 20, score: 8, hand: null },
  ],
  turnPlayer: 'p1',
  round: 1,
  targetScore: 100,
  teamScores: [10, 8],
  lastRound: null,
  result: null,
  log: [],
};

const caida: CaidaView = {
  gameId: 'caida',
  phase: 'playing',
  round: 1,
  targetScore: 24,
  dealerId: 'p2',
  turnPlayer: 'p1',
  table: [
    { id: '1-oro', rank: 1, suit: 'oro' },
    { id: '7-copa', rank: 7, suit: 'copa' },
  ],
  deckCount: 30,
  mesaPoints: 2,
  malEchada: false,
  players: [
    { id: 'p1', name: 'Ana', handCount: 3, capturedCount: 0, score: 0, roundPoints: 0, canto: null, hand: [{ id: '3-espada', rank: 3, suit: 'espada' }] },
    { id: 'p2', name: 'Luis', handCount: 3, capturedCount: 0, score: 0, roundPoints: 0, canto: null, hand: null },
  ],
  lastRound: null,
  result: null,
  log: [],
};

const colors: ColorsView = {
  gameId: 'colores',
  phase: 'playing',
  round: 1,
  targetScore: 200,
  currentColor: 'rojo',
  direction: 1,
  topCard: { id: 'rojo-5', color: 'rojo', symbol: 5, value: 5 },
  drawCount: 40,
  players: [
    { id: 'p1', name: 'Ana', score: 0, handCount: 2, hand: [{ id: 'azul-salta', color: 'azul', symbol: 'salta', value: 20 }] },
    { id: 'p2', name: 'Luis', score: 0, handCount: 2, hand: null },
  ],
  turnPlayer: 'p1',
  drawnCardId: null,
  lastRound: null,
  result: null,
  log: [],
};

describe('puente headless con @mesa-viva/core', () => {
  it('convierte blackjack sin duplicar reglas y revela la carta oculta', () => {
    const snapshot = snapshotFromBlackjack(blackjack, 'p1');
    expect(snapshot.gameId).toBe('blackjack');
    expect(snapshot.seats).toHaveLength(2);
    expect(snapshot.seats[0]?.isDealer).toBe(true);
    expect(snapshot.hand).toHaveLength(2);
    expect(snapshot.tableCards).toHaveLength(2);
    expect(snapshot.tableCards[1]?.faceUp).toBe(false);
    expect(countFacedown(snapshot.tableCards)).toBe(1);
    expect(snapshot.chips[0]?.amount).toBe(50);
    expect(snapshot.canInteract).toBe(true);
    expect(viewerSeatIndex(snapshot)).toBe(1);
  });

  it('convierte dominó, caída y colores a las mismas primitivas', () => {
    const dominoSnapshot = snapshotFromDomino(domino, 'p1');
    expect(dominoSnapshot.tiles).toHaveLength(2);
    expect(dominoSnapshot.tiles[0]?.side).toBe('left');
    expect(dominoSnapshot.tiles[1]?.side).toBe('hand');
    expect(dominoSnapshot.canInteract).toBe(true);

    const caidaSnapshot = snapshotFromCaida(caida, 'p1');
    expect(caidaSnapshot.tableCards).toHaveLength(2);
    expect(caidaSnapshot.tableCards[0]?.deck).toBe('espanola');
    expect(caidaSnapshot.seats[1]?.isDealer).toBe(true);

    const colorsSnapshot = snapshotFromColors(colors, 'p1');
    expect(colorsSnapshot.tableCards[0]?.deck).toBe('color');
    expect(colorsSnapshot.tableCards[0]?.suit).toBe('rojo');
    expect(colorsSnapshot.hand[0]?.label).toBe('salta');
    expect(colorsSnapshot.canInteract).toBe(true);
  });

  it('crea un snapshot vacío estable', () => {
    const snapshot = emptySnapshot('demo', 'yo');
    expect(snapshot.seats).toEqual([]);
    expect(snapshot.board.kind).toBe('ninguno');
    expect(viewerSeatIndex(snapshot)).toBe(-1);
    expect(countFacedown([])).toBe(0);
  });
});
