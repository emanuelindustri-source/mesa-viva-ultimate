import type { BotLevel } from '@mesa-viva/core';
import type { GameKey } from './game-defs.js';
import { GameSession, type PlayerSeat } from './game-session.js';
import type { RoomState, RoomView } from './room-protocol.js';
import type { RoomService } from './room-service.js';

/** Anfitrión autoritativo: aplica acciones y envía a cada jugador solo su vista. */
export class RoomGameHost {
  readonly gameKey: GameKey;
  readonly session: GameSession;
  private readonly room: RoomService;

  constructor(room: RoomService, gameKey: GameKey, seats: readonly PlayerSeat[], seed: number, botLevel: BotLevel) {
    this.room = room;
    this.gameKey = gameKey;
    this.session = new GameSession({ game: gameKey, mode: 'online', humanName: seats[0]?.name ?? 'Anfitrión', botLevel, seed, seats });
  }

  start(): void {
    this.room.startGame({
      gameKey: this.gameKey,
      seats: this.session.seats,
      seed: this.session.seed,
      botLevel: this.session.botLevel,
    });
    this.broadcast();
  }

  handleAction(playerId: string, action: unknown): void {
    if (this.session.currentPlayer !== playerId) return;
    this.session.act(action);
    this.session.autoPlayBots();
    this.broadcast();
  }

  stateFor(playerId: string): RoomState {
    const view = this.session.viewFor(playerId);
    const snapshot = this.session.snapshotFor(playerId);
    const roomView: RoomView = {
      view,
      snapshot,
      actions: this.session.currentPlayer === playerId ? this.session.actionOptions() : [],
      currentPlayer: this.session.currentPlayer,
      result: this.session.result,
    };
    return {
      gameKey: this.gameKey,
      phase: snapshot.phase,
      turnPlayer: snapshot.turnPlayerId,
      seats: this.session.seats,
      views: { [playerId]: roomView },
      result: this.session.result,
    };
  }

  broadcast(): void {
    for (const seat of this.session.seats) {
      if (seat.kind === 'human') this.room.sendStateTo(seat.id, this.stateFor(seat.id));
    }
  }
}
