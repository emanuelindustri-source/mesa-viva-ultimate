import { readInt, readString, validatePlayers } from '../../engine/config.js';
import { createRng } from '../../engine/rng.js';
import type { GameConfig } from '../../engine/types.js';
import { shuffle } from '../common/shuffle.js';
import { createSpanishDeck, type SpanishCard } from '../common/spanish-deck.js';
import { detectHandCanto } from './cantos.js';
import { logCaida } from './log.js';
import { finishMatchIfNeeded } from './match-end.js';
import type { CaidaRoundLine, CaidaState } from './types.js';

const MESA_ASC = [1, 2, 3, 4] as const;
const MESA_DESC = [4, 3, 2, 1] as const;

function drawOne(state: CaidaState): SpanishCard {
  const card = state.deck.shift();
  if (!card) throw new Error('El mazo de la Caída se agotó inesperadamente');
  return card;
}

function mesaSequence(state: CaidaState): readonly number[] {
  return state.mesaOrder === 'asc' ? MESA_ASC : MESA_DESC;
}

/** Reparte una ronda completa, puntúa la mesa y declara los cantos. */
function dealRound(state: CaidaState, rng: ReturnType<typeof createRng>): void {
  state.deck = shuffle(createSpanishDeck(), rng);
  state.table = [];
  state.mesaPoints = 0;
  state.malEchada = false;
  state.turn = 0;
  state.matchWinners = [];
  state.endReason = null;
  for (const player of state.players) {
    player.hand = [];
    player.captured = [];
    player.roundPoints = 0;
    player.canto = null;
  }
  const firstIndex = (state.dealerIndex + 1) % state.players.length;
  const ordered = [
    ...state.players.slice(firstIndex),
    ...state.players.slice(0, firstIndex),
  ];
  for (let r = 0; r < 3; r += 1) {
    for (const player of ordered) {
      player.hand.push(drawOne(state));
    }
  }
  for (let i = 0; i < 4; i += 1) {
    state.table.push(drawOne(state));
  }

  const sequence = mesaSequence(state);
  let prefix = 0;
  while (
    prefix < state.table.length &&
    state.table[prefix]?.rank === sequence[prefix]
  ) {
    prefix += 1;
  }
  state.mesaPoints = prefix;
  const dealer = state.players[state.dealerIndex];
  if (prefix === 0) {
    state.malEchada = true;
    const first = state.players[firstIndex];
    if (first) first.score += 1;
    logCaida(state, `${dealer?.name ?? 'Repartidor'} hizo mal echada; ${first?.name ?? 'mano'} gana 1 punto`);
  } else if (dealer) {
    dealer.score += prefix;
    logCaida(state, `${dealer.name} entregó la mesa y ganó ${prefix} puntos`);
  }

  for (const player of state.players) {
    const canto = detectHandCanto(player.hand);
    player.canto = canto;
    if (canto) {
      player.score += canto.value;
      player.roundPoints += canto.value;
      logCaida(state, `${player.name} cantó ${canto.label} (+${canto.value})`);
      if (canto.instantWin) {
        state.matchWinners = [player.id];
        state.phase = 'match-over';
        state.endReason = 'trivilin-12';
        logCaida(state, `${player.name} gana de inmediato con trivilín de reyes`);
        return;
      }
    }
  }
  if (finishMatchIfNeeded(state)) return;
  state.phase = 'playing';
  state.turnIndex = firstIndex;
  logCaida(state, `Comienza la ronda ${state.round} con ${state.players.length} jugadores`);
}

export function createCaidaState(
  config: GameConfig,
  rng: ReturnType<typeof createRng>,
): CaidaState {
  validatePlayers(config, 2, 4);
  const targetScore = readInt(config.options, 'targetScore', 24, 1, 100);
  const mesaOrder = readString(config.options, 'mesaOrder', 'asc', ['asc', 'desc'] as const);
  const state: CaidaState = {
    gameId: 'caida',
    players: config.players.map((player) => ({
      id: player.id,
      name: player.name,
      hand: [],
      captured: [],
      score: 0,
      roundPoints: 0,
      canto: null,
    })),
    deck: [],
    table: [],
    turnIndex: 0,
    dealerIndex: 0,
    phase: 'playing',
    targetScore,
    seed: config.seed,
    round: 1,
    turn: 0,
    mesaOrder,
    mesaPoints: 0,
    malEchada: false,
    tiebreakDeck: shuffle(createSpanishDeck(), createRng(config.seed + 104729)),
    lastRound: null,
    matchWinners: [],
    endReason: null,
    log: [],
  };
  dealRound(state, rng);
  return state;
}

export function nextCaidaRound(state: CaidaState): CaidaState {
  state.dealerIndex = (state.dealerIndex + 1) % state.players.length;
  state.round += 1;
  const rng = createRng(state.seed + state.round * 7919 + state.dealerIndex);
  dealRound(state, rng);
  return state;
}

export function endCaidaRound(state: CaidaState): CaidaState {
  const count = state.players.length;
  const lines: CaidaRoundLine[] = [];
  state.players.forEach((player, index) => {
    const threshold =
      count === 4 ? 10 : count === 3 && index !== state.dealerIndex ? 13 : count === 3 ? 14 : 20;
    const leftovers = Math.max(0, player.captured.length - threshold);
    player.score += leftovers;
    player.roundPoints += leftovers;
    const line: CaidaRoundLine = {
      id: player.id,
      canto: player.canto?.value ?? 0,
      captures: player.captured.length,
      leftovers,
      total: player.roundPoints,
    };
    lines.push(line);
    if (leftovers > 0) {
      logCaida(state, `${player.name} suma ${leftovers} por cartas sobrantes`);
    }
  });
  state.lastRound = {
    round: state.round,
    dealerId: state.players[state.dealerIndex]?.id ?? 'p0',
    lines,
    mesaPoints: state.mesaPoints,
    malEchada: state.malEchada,
  };
  if (!finishMatchIfNeeded(state)) {
    state.phase = 'round-over';
    logCaida(state, `Ronda ${state.round} terminada`);
  }
  return state;
}
