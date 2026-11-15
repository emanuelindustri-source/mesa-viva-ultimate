import { type DataConnection, Peer } from 'peerjs';
import type { GameKey } from './game-defs.js';
import { withDisconnected, withPlayer } from './room-lobby.js';
import {
  createRoomCode,
  type RoomLobby,
  type RoomMessage,
  type RoomPlayer,
  type RoomState,
  roomMessage,
  roomPeerId,
  sanitizeChat,
} from './room-protocol.js';
import { guestPeerId, peerOptions, type RoomCallbacks, type RoomStartPayload } from './room-support.js';
/** Salón híbrido: anfitrión autoritativo y clientes que solo envían acciones. */
export class RoomService {
  private peer: Peer | null = null;
  private role: 'host' | 'guest' | null = null;
  private code = '';
  private playerId = '';
  private readonly connections = new Map<DataConnection, string>();
  private readonly byPlayer = new Map<string, DataConnection>();
  private hostConnection: DataConnection | null = null;
  private lobby: RoomLobby | null = null;
  private readonly callbacks: RoomCallbacks;
  private actionHandler: ((playerId: string, action: unknown) => void) | null = null;
  constructor(callbacks: RoomCallbacks = {}) {
    this.callbacks = callbacks;
  }
  get currentPlayerId(): string {
    return this.playerId;
  }
  get isHost(): boolean {
    return this.role === 'host';
  }
  setActionHandler(handler: (playerId: string, action: unknown) => void): void {
    this.actionHandler = handler;
  }
  async host(name: string, gameKey: GameKey = 'caida'): Promise<string> {
    this.dispose();
    this.role = 'host';
    this.code = createRoomCode();
    this.playerId = 'p0';
    this.lobby = { code: this.code, hostId: 'p0', players: [{ id: 'p0', name, isHost: true, connected: true }], gameKey, started: false };
    this.callbacks.onStatus?.('Abriendo sala…', false);
    return new Promise<string>((resolve, reject) => {
      const peer = new Peer(roomPeerId(this.code), peerOptions());
      this.peer = peer;
      peer.on('open', () => {
        this.callbacks.onStatus?.(`Sala ${this.code} abierta`, true);
        this.callbacks.onLobby?.(this.lobby as RoomLobby);
        this.callbacks.onAssigned?.('p0', this.code);
        resolve(this.code);
      });
      peer.on('connection', (connection) => this.accept(connection));
      peer.on('error', (error) => {
        this.callbacks.onStatus?.(`No se pudo abrir la sala: ${error.message}`, false);
        reject(error);
      });
    });
  }
  async join(code: string, name: string): Promise<void> {
    this.dispose();
    this.role = 'guest';
    this.code = code;
    this.callbacks.onStatus?.('Conectando a la sala…', false);
    await new Promise<void>((resolve, reject) => {
      const peer = new Peer(guestPeerId(this.code), peerOptions());
      this.peer = peer;
      peer.on('open', () => {
        const connection = peer.connect(roomPeerId(code), { reliable: true });
        this.hostConnection = connection;
        this.bind(connection);
        connection.on('open', () => {
          connection.send({ type: 'hello', playerId: this.playerId || `guest-${Date.now()}`, name } satisfies RoomMessage);
          resolve();
        });
      });
      peer.on('error', (error) => {
        this.callbacks.onStatus?.(`No se pudo unir: ${error.message}`, false);
        reject(error);
      });
    });
  }
  startGame(payload: RoomStartPayload): void {
    if (!this.isHost) return;
    this.broadcast({ type: 'start', ...payload });
    this.callbacks.onStart?.(payload);
  }
  broadcastState(state: RoomState): void {
    if (!this.isHost) return;
    this.broadcast({ type: 'state', state });
  }
  sendStateTo(playerId: string, state: RoomState): void {
    if (!this.isHost) return;
    this.byPlayer.get(playerId)?.send({ type: 'state', state });
  }
  sendAction(action: unknown): void {
    if (this.isHost) return;
    if (this.hostConnection !== null) {
      this.hostConnection.send({ type: 'action', playerId: this.playerId, action } satisfies RoomMessage);
    }
  }
  sendChat(text: string, name: string): void {
    const clean = sanitizeChat(text);
    if (clean === null) return;
    const message: RoomMessage = { type: 'chat', from: this.playerId, name, text: clean, at: Date.now() };
    if (this.isHost) this.broadcast(message);
    else this.hostConnection?.send(message);
    this.callbacks.onChat?.(this.playerId, name, clean);
  }
  changeGame(gameKey: GameKey): void {
    if (!this.isHost) return;
    this.broadcast({ type: 'game', gameKey });
  }
  leave(): void {
    this.dispose();
  }
  private accept(connection: DataConnection): void {
    connection.on('data', (raw) => this.receive(connection, raw));
    connection.on('close', () => {
      const id = this.connections.get(connection);
      this.connections.delete(connection);
      if (id !== undefined) this.byPlayer.delete(id);
      this.removePlayer(id);
    });
    connection.on('error', () => this.callbacks.onError?.('Se perdió una conexión'));
  }
  private bind(connection: DataConnection): void {
    connection.on('data', (raw) => this.receive(connection, raw));
    connection.on('close', () => this.callbacks.onStatus?.('Conexión cerrada', false));
  }
  private receive(connection: DataConnection, raw: unknown): void {
    const message = roomMessage(raw);
    if (message === null) return;
    if (this.isHost) this.receiveHost(connection, message);
    else this.receiveGuest(message);
  }
  private receiveHost(connection: DataConnection, message: RoomMessage): void {
    if (message.type === 'hello') {
      const id = `p${this.lobby?.players.length ?? 1}`;
      this.connections.set(connection, id);
      this.byPlayer.set(id, connection);
      this.playerId = 'p0';
      this.addPlayer({ id, name: message.name, isHost: false, connected: true });
      connection.send({ type: 'welcome', lobby: this.lobby as RoomLobby, playerId: id } satisfies RoomMessage);
      this.broadcastLobby();
    }
    if (message.type === 'action') {
      this.callbacks.onAction?.(message.playerId, message.action);
      this.actionHandler?.(message.playerId, message.action);
    }
    if (message.type === 'chat') {
      const clean = sanitizeChat(message.text);
      if (clean !== null) {
        this.broadcast({ type: 'chat', from: message.from, name: message.name, text: clean, at: message.at });
        this.callbacks.onChat?.(message.from, message.name, clean);
      }
    }
  }
  private receiveGuest(message: RoomMessage): void {
    if (message.type === 'welcome') {
      this.playerId = message.playerId;
      this.lobby = message.lobby;
      this.callbacks.onAssigned?.(message.playerId, message.lobby.code);
      this.callbacks.onLobby?.(message.lobby);
      this.callbacks.onStatus?.(`Sala ${message.lobby.code}`, true);
    }
    if (message.type === 'lobby') { this.lobby = message.lobby; this.callbacks.onLobby?.(message.lobby); }
    if (message.type === 'start') this.callbacks.onStart?.(message);
    if (message.type === 'state') this.callbacks.onState?.(message.state);
    if (message.type === 'chat') this.callbacks.onChat?.(message.from, message.name, message.text);
    if (message.type === 'game') this.callbacks.onGame?.(message.gameKey);
    if (message.type === 'error') this.callbacks.onError?.(message.message);
  }
  private addPlayer(player: RoomPlayer): void { this.lobby = withPlayer(this.lobby, player); }
  private removePlayer(id: string | undefined): void {
    const next = withDisconnected(this.lobby, id);
    if (next === null) return;
    this.lobby = next;
    this.broadcastLobby();
  }
  private broadcastLobby(): void {
    if (this.lobby !== null) this.broadcast({ type: 'lobby', lobby: this.lobby });
  }
  private broadcast(message: RoomMessage): void {
    for (const connection of this.byPlayer.values()) connection.send(message);
  }
  private dispose(): void {
    for (const connection of this.connections.keys()) connection.close();
    this.connections.clear();
    this.byPlayer.clear();
    this.hostConnection?.close();
    this.hostConnection = null;
    this.peer?.destroy();
    this.peer = null;
    this.role = null;
  }
}
