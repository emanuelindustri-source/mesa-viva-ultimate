import { readInt, validatePlayers } from '../../engine/config.js';
import { createRng, type Rng } from '../../engine/rng.js';
import type { GameConfig } from '../../engine/types.js';
import { shuffle } from '../common/shuffle.js';
import { createDominoSet, handPips, isDouble, tilePips } from './tiles.js';
import type { DominoPlayer, DominoState } from './types.js';

function log(state: DominoState, message: string): void {
  state.log.push(message);
  if (state.log.length > 60) state.log.splice(0, state.log.length - 60);
}

function chooseStarter(players: readonly DominoPlayer[]): number {
  let bestDouble: { index: number; value: number } | null = null;
  let bestTile: { index: number; value: number } | null = null;
  for (let index = 0; index < players.length; index += 1) {
    const player = players[index];
    if (!player) continue;
    for (const tile of player.hand) {
      if (isDouble(tile) && (bestDouble === null || tile.a > bestDouble.value)) {
        bestDouble = { index, value: tile.a };
      }
      if (bestTile === null || tilePips(tile) > bestTile.value) {
        bestTile = { index, value: tilePips(tile) };
      }
    }
  }
  return bestDouble?.index ?? bestTile?.index ?? 0;
}

function dealRound(state: DominoState, rng: Rng): void {
  const deck = shuffle(createDominoSet(), rng);
  state.board = [];
  state.leftEnd = null;
  state.rightEnd = null;
  state.started = false;
  state.passesInRow = 0;
  state.matchWinners = [];
  state.endReason = null;
  for (const player of state.players) {
    player.hand = [];
  }
  for (let round = 0; round < 7; round += 1) {
    for (const player of state.players) {
      const tile = deck.shift();
      if (!tile) throw new Error('Fichas insuficientes para repartir el dominó');
      player.hand.push(tile);
    }
  }
  state.boneyard = deck;
  state.turnIndex = chooseStarter(state.players);
  state.phase = 'playing';
  log(state, `Ronda ${state.round}: comienza ${state.players[state.turnIndex]?.name ?? 'la mano'}`);
}

export function createDominoState(config: GameConfig, rng: Rng): DominoState {
  validatePlayers(config, 2, 4);
  if (config.players.length === 3) {
    throw new Error('El dominó solo admite 2 jugadores (1v1) o 4 jugadores (2v2)');
  }
  const targetScore = readInt(config.options, 'targetScore', 100, 20, 1000);
  const mode = config.players.length === 4 ? '2v2' : '1v1';
  const state: DominoState = {
    gameId: 'domino',
    mode,
    players: config.players.map((player) => ({
      id: player.id,
      name: player.name,
      hand: [],
      score: 0,
    })),
    boneyard: [],
    leftEnd: null,
    rightEnd: null,
    board: [],
    started: false,
    turnIndex: 0,
    passesInRow: 0,
    phase: 'playing',
    targetScore,
    seed: config.seed,
    round: 1,
    teamScores: mode === '2v2' ? [0, 0] : [],
    consecutiveVoidRounds: 0,
    lastRound: null,
    matchWinners: [],
    endReason: null,
    log: [],
  };
  dealRound(state, rng);
  return state;
}

export function nextDominoRound(state: DominoState): DominoState {
  state.round += 1;
  dealRound(state, createRng(state.seed + state.round * 7919));
  return state;
}

export function scoreDominoRound(
  state: DominoState,
  winnerIndex: number | null,
  blocked: boolean,
): DominoState {
  let winnerIds: string[] = [];
  let points = 0;
  if (!blocked && winnerIndex !== null) {
    if (state.mode === '1v1') {
      const winner = state.players[winnerIndex];
      const loser = state.players.find((_, index) => index !== winnerIndex);
      points = loser ? handPips(loser.hand) : 0;
      if (winner) winner.score += points;
      if (winner) winnerIds = [winner.id];
    } else {
      const team = winnerIndex % 2;
      const losers = state.players.filter((_, index) => index % 2 !== team);
      points = losers.reduce((total, player) => total + handPips(player.hand), 0);
      state.teamScores[team] = (state.teamScores[team] ?? 0) + points;
      winnerIds = state.players.filter((_, index) => index % 2 === team).map((p) => p.id);
    }
    state.consecutiveVoidRounds = 0;
    log(state, `Ronda ganada por ${winnerIds.join(' y ')} con ${points} puntos`);
  } else {
    const totals =
      state.mode === '1v1'
        ? [handPips(state.players[0]?.hand ?? []), handPips(state.players[1]?.hand ?? [])]
        : [0, 1].map((team) =>
            state.players
              .filter((_, index) => index % 2 === team)
              .reduce((total, player) => total + handPips(player.hand), 0),
          );
    const min = Math.min(...totals);
    const max = Math.max(...totals);
    if (totals[0] === totals[1]) {
      state.consecutiveVoidRounds += 1;
      state.lastRound = {
        round: state.round,
        winnerIds: [],
        points: 0,
        blocked: true,
        teamScores: [...state.teamScores],
      };
      if (state.consecutiveVoidRounds >= 3) {
        state.phase = 'match-over';
        state.endReason = 'empate';
        state.matchWinners = [];
        log(state, 'Tres trancas empatadas: la partida termina en empate');
        return state;
      }
      state.phase = 'round-over';
      log(state, 'Tranca empatada: la ronda queda nula');
      return state;
    }
    const winnerTeam = totals[0] === min ? 0 : 1;
    points = max;
    if (state.mode === '1v1') {
      const winner = state.players[winnerTeam];
      if (winner) winner.score += points;
      if (winner) winnerIds = [winner.id];
    } else {
      state.teamScores[winnerTeam] = (state.teamScores[winnerTeam] ?? 0) + points;
      winnerIds = state.players.filter((_, index) => index % 2 === winnerTeam).map((p) => p.id);
    }
    state.consecutiveVoidRounds = 0;
    log(state, `Tranca: gana ${winnerIds.join(' y ')} con ${points} puntos`);
  }

  state.lastRound = {
    round: state.round,
    winnerIds,
    points,
    blocked,
    teamScores: [...state.teamScores],
  };

  if (state.mode === '2v2') {
    const team = (state.teamScores[0] ?? 0) >= (state.teamScores[1] ?? 0) ? 0 : 1;
    if ((state.teamScores[team] ?? 0) >= state.targetScore) {
      state.matchWinners = state.players
        .filter((_, index) => index % 2 === team)
        .map((player) => player.id);
      state.phase = 'match-over';
      state.endReason = 'puntos';
      log(state, `Partida ganada por el equipo ${team + 1}`);
      return state;
    }
  } else {
    const winner = [...state.players].sort((a, b) => b.score - a.score)[0];
    if (winner && winner.score >= state.targetScore) {
      state.matchWinners = [winner.id];
      state.phase = 'match-over';
      state.endReason = 'puntos';
      log(state, `Partida ganada por ${winner.name}`);
      return state;
    }
  }
  state.phase = 'round-over';
  return state;
}
