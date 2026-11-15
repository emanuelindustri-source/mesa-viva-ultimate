import { describe, expect, it } from 'vitest';
import { createRng } from '../src/engine/rng.js';
import { type PlayReport, playToEnd } from '../src/engine/runtime.js';
import type { GameConfig, IGameModule } from '../src/engine/types.js';
import { chooseBlackjackAction } from '../src/games/blackjack/ai.js';
import { blackjackModule } from '../src/games/blackjack/module.js';
import { chooseCaidaAction } from '../src/games/caida/ai.js';
import { caidaModule } from '../src/games/caida/module.js';
import { chooseColorsAction } from '../src/games/colores/ai.js';
import { colorsModule } from '../src/games/colores/module.js';
import { chooseDominoAction } from '../src/games/domino/ai.js';
import { dominoModule } from '../src/games/domino/module.js';
import { makeConfig } from './helpers.js';

function configFor(game: 'caida' | 'domino' | 'blackjack' | 'colores', seed: number): GameConfig {
  if (game === 'caida') return makeConfig(2 + (seed % 3), seed, { targetScore: 8 });
  if (game === 'domino') {
    return makeConfig(seed % 2 === 0 ? 2 : 4, seed, { targetScore: 20 });
  }
  if (game === 'blackjack') {
    return makeConfig(1 + (seed % 3), seed, { maxRounds: 1, startingBankroll: 1000 });
  }
  return makeConfig(2 + (seed % 3), seed, { targetScore: 50 });
}

function runGame(
  game: 'caida' | 'domino' | 'blackjack' | 'colores',
  seed: number,
): PlayReport<unknown> {
  const config = configFor(game, seed);
  if (game === 'caida') {
    const initial = caidaModule.createInitialState(config, createRng(seed));
    return playToEnd(caidaModule, initial, (state, player, legal) =>
      chooseCaidaAction(state, player, 'competitivo', legal),
    );
  }
  if (game === 'domino') {
    const initial = dominoModule.createInitialState(config, createRng(seed));
    return playToEnd(dominoModule, initial, (state, player, legal) =>
      chooseDominoAction(state, player, 'competitivo', legal),
    );
  }
  if (game === 'blackjack') {
    const initial = blackjackModule.createInitialState(config, createRng(seed));
    return playToEnd(blackjackModule, initial, (state, player, legal) =>
      chooseBlackjackAction(state, player, 'competitivo', legal),
    );
  }
  const initial = colorsModule.createInitialState(config, createRng(seed));
  return playToEnd(colorsModule, initial, (state, player, legal) =>
    chooseColorsAction(state, player, 'competitivo', legal),
  );
}

function resultOf(game: 'caida' | 'domino' | 'blackjack' | 'colores', state: unknown) {
  if (game === 'caida') return caidaModule.result(state as never);
  if (game === 'domino') return dominoModule.result(state as never);
  if (game === 'blackjack') return blackjackModule.result(state as never);
  return colorsModule.result(state as never);
}

function moduleOf(game: 'caida' | 'domino' | 'blackjack' | 'colores'): IGameModule<never, never, never> {
  if (game === 'caida') return caidaModule as unknown as IGameModule<never, never, never>;
  if (game === 'domino') return dominoModule as unknown as IGameModule<never, never, never>;
  if (game === 'blackjack') return blackjackModule as unknown as IGameModule<never, never, never>;
  return colorsModule as unknown as IGameModule<never, never, never>;
}

const GAMES = ['caida', 'domino', 'blackjack', 'colores'] as const;

describe('1.000 partidas simuladas por juego', () => {
  it('termina sin acciones ilegales ni estados bloqueados', () => {
    for (const game of GAMES) {
      for (let seed = 1; seed <= 1000; seed += 1) {
        let report: PlayReport<unknown>;
        try {
          report = runGame(game, seed);
        } catch (error) {
          throw new Error(
            `${game} falló con semilla ${seed}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
        if (!report.finished) {
          throw new Error(`${game} no terminó con semilla ${seed}`);
        }
        const result = resultOf(game, report.state);
        if (result === null) {
          throw new Error(`${game} terminó sin resultado con semilla ${seed}`);
        }
        for (const [player, score] of Object.entries(result.scores)) {
          if (!Number.isFinite(score)) {
            throw new Error(`${game} puntaje inválido para ${player} (semilla ${seed})`);
          }
        }
      }
      expect(moduleOf(game).meta.id.length).toBeGreaterThan(0);
    }
  }, 180_000);
});

describe('golden replay', () => {
  it('reproduce exactamente las mismas partidas con la misma semilla', () => {
    for (const game of GAMES) {
      const first = runGame(game, 777);
      const second = runGame(game, 777);
      expect(JSON.stringify(resultOf(game, first.state))).toBe(
        JSON.stringify(resultOf(game, second.state)),
      );
      expect(JSON.stringify(first.state)).toBe(JSON.stringify(second.state));
    }
  });
});
