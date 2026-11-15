import { act, type BotLevel, createRng, type GameConfig, type GameResult } from '@mesa-viva/core';
import { type ActionOption, actionOptionsFor } from './action-labels.js';
import { type GameDefinition, type GameKey, gameDefinition } from './game-defs.js';

export type PlayMode = 'solo' | 'local' | 'online';
export type SeatKind = 'human' | 'bot';

export interface PlayerSeat {
  readonly id: string;
  readonly name: string;
  readonly kind: SeatKind;
}

export interface NewGameOptions {
  readonly game: GameKey;
  readonly mode: PlayMode;
  readonly humanName: string;
  readonly botLevel: BotLevel;
  readonly seed?: number;
  readonly humanCount?: number;
  readonly seats?: readonly PlayerSeat[];
}

export function createSeats(options: NewGameOptions): PlayerSeat[] {
  const definition = gameDefinition(options.game);
  if (options.seats !== undefined) return [...options.seats];
  const count = Math.max(definition.minPlayers, Math.min(definition.maxPlayers, options.humanCount ?? definition.defaultPlayers));
  if (options.mode === 'solo') {
    const seats: PlayerSeat[] = [{ id: 'p0', name: options.humanName, kind: 'human' }];
    for (let index = 1; index < count; index += 1) seats.push({ id: `p${index}`, name: `Bot ${index}`, kind: 'bot' });
    return seats;
  }
  return Array.from({ length: count }, (_, index) => ({
    id: `p${index}`,
    name: index === 0 ? options.humanName : `Jugador ${index + 1}`,
    kind: 'human',
  }));
}

/** Envuelve cualquier módulo de core con estado, asientos y vistas por jugador. */
export class GameSession {
  readonly game: GameDefinition;
  readonly seats: readonly PlayerSeat[];
  readonly botLevel: BotLevel;
  readonly mode: PlayMode;
  readonly seed: number;
  private state: unknown;
  private viewer: string;
  private previousLog = 0;

  constructor(options: NewGameOptions) {
    this.game = gameDefinition(options.game);
    this.seats = createSeats(options);
    this.botLevel = options.botLevel;
    this.mode = options.mode;
    this.seed = options.seed ?? Date.now();
    const config: GameConfig = {
      players: this.seats.map((seat) => ({ id: seat.id, name: seat.name, kind: seat.kind })),
      seed: this.seed,
    };
    this.state = this.game.module.createInitialState(config, createRng(this.seed));
    this.viewer = this.seats.find((seat) => seat.kind === 'human')?.id ?? 'p0';
  }

  get viewerId(): string {
    return this.viewer;
  }

  setViewer(id: string): void {
    if (this.seats.some((seat) => seat.id === id)) this.viewer = id;
  }

  get currentPlayer(): string | null {
    return this.game.module.currentPlayer(this.state);
  }

  get result(): GameResult | null {
    return this.game.module.result(this.state);
  }

  get legalActions(): readonly unknown[] {
    const player = this.currentPlayer;
    return player === null ? [] : this.game.module.legalActions(this.state, player);
  }

  get view(): unknown {
    return this.game.module.view(this.state, this.viewer);
  }

  viewFor(playerId: string): unknown {
    return this.game.module.view(this.state, playerId);
  }

  snapshotFor(playerId: string) {
    return this.game.snapshot(this.game.module.view(this.state, playerId), playerId);
  }

  seat(id: string): PlayerSeat | undefined {
    return this.seats.find((seat) => seat.id === id);
  }

  isBot(id: string | null): boolean {
    return id !== null && this.seat(id)?.kind === 'bot';
  }

  act(action: unknown): readonly string[] {
    const player = this.currentPlayer;
    if (player === null) return [];
    const before = this.logLength();
    this.state = act(this.game.module, this.state, player, action);
    const view = this.view as { log?: readonly string[] };
    const log = view.log ?? [];
    const fresh = log.slice(before);
    this.previousLog = log.length;
    return fresh;
  }

  botStep(): boolean {
    const player = this.currentPlayer;
    if (!this.isBot(player) || player === null) return false;
    const legal = this.game.module.legalActions(this.state, player);
    if (legal.length === 0) return false;
    const action = this.game.choose(this.state, player, this.botLevel, legal);
    this.act(action);
    return true;
  }

  autoPlayBots(maxSteps = 24): number {
    let steps = 0;
    while (steps < maxSteps && this.result === null && this.isBot(this.currentPlayer)) {
      if (!this.botStep()) break;
      steps += 1;
    }
    return steps;
  }

  actionOptions(): readonly ActionOption[] {
    return actionOptionsFor(this);
  }

  private logLength(): number {
    const view = this.view as { log?: readonly string[] };
    return Math.min(this.previousLog, view.log?.length ?? 0);
  }
}

export function newGameSession(options: NewGameOptions): GameSession {
  return new GameSession(options);
}
