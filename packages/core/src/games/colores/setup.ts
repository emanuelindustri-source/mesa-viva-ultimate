import { readBoolean, readInt, validatePlayers } from '../../engine/config.js';
import { createRng, type Rng } from '../../engine/rng.js';
import type { GameConfig } from '../../engine/types.js';
import { shuffle } from '../common/shuffle.js';
import { createColorsDeck } from './deck.js';
import type { ColorsCard, ColorsState } from './types.js';

function log(state: ColorsState, message: string): void {
  state.log.push(message);
  if (state.log.length > 60) state.log.splice(0, state.log.length - 60);
}

function dealRound(state: ColorsState, rng: Rng): void {
  const deck = shuffle(createColorsDeck(), rng);
  state.discard = [];
  state.drawnCardId = null;
  state.direction = 1;
  state.turn = 0;
  state.matchWinners = [];
  state.endReason = null;
  for (const player of state.players) player.hand = [];
  for (let round = 0; round < 7; round += 1) {
    for (const player of state.players) {
      const card = deck.shift();
      if (!card) throw new Error('Baraja de Colores insuficiente');
      player.hand.push(card);
    }
  }
  const returned: ColorsCard[] = [];
  let first: ColorsCard | undefined;
  while (deck.length > 0) {
    const candidate = deck.shift();
    if (!candidate) break;
    if (typeof candidate.symbol === 'number') {
      first = candidate;
      break;
    }
    returned.push(candidate);
  }
  if (!first) throw new Error('No se encontró una carta numérica inicial');
  state.discard = [first];
  state.currentColor = first.color === 'negro' ? 'rojo' : first.color;
  state.drawPile = [...returned, ...deck];
  state.phase = 'playing';
  state.turnIndex = (state.round - 1) % state.players.length;
  log(state, `Ronda ${state.round}: inicia ${state.players[state.turnIndex]?.name ?? 'la mesa'}`);
}

export function createColorsState(config: GameConfig, rng: Rng): ColorsState {
  validatePlayers(config, 2, 4);
  const targetScore = readInt(config.options, 'targetScore', 500, 50, 5000);
  const strictWild4 = readBoolean(config.options, 'strictWild4', false);
  const state: ColorsState = {
    gameId: 'colores',
    players: config.players.map((player) => ({
      id: player.id,
      name: player.name,
      hand: [],
      score: 0,
    })),
    drawPile: [],
    discard: [],
    currentColor: 'rojo',
    direction: 1,
    turnIndex: 0,
    phase: 'playing',
    targetScore,
    seed: config.seed,
    round: 1,
    turn: 0,
    drawnCardId: null,
    strictWild4,
    lastRound: null,
    matchWinners: [],
    endReason: null,
    log: [],
  };
  dealRound(state, rng);
  return state;
}

export function nextColorsRound(state: ColorsState): ColorsState {
  state.round += 1;
  dealRound(state, createRng(state.seed + state.round * 7919));
  return state;
}
