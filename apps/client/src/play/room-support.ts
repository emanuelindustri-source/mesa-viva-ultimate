import type { BotLevel } from '@mesa-viva/core';
import type { GameKey } from './game-defs.js';
import type { PlayerSeat } from './game-session.js';
import type { RoomLobby, RoomState } from './room-protocol.js';

export interface RoomStartPayload {
  readonly gameKey: GameKey;
  readonly seats: readonly PlayerSeat[];
  readonly seed: number;
  readonly botLevel: BotLevel;
}

export interface RoomCallbacks {
  readonly onStatus?: (text: string, ready: boolean) => void;
  readonly onLobby?: (lobby: RoomLobby) => void;
  readonly onAssigned?: (playerId: string, code: string) => void;
  readonly onStart?: (payload: RoomStartPayload) => void;
  readonly onState?: (state: RoomState) => void;
  readonly onChat?: (from: string, name: string, text: string) => void;
  readonly onGame?: (gameKey: GameKey) => void;
  readonly onError?: (message: string) => void;
  readonly onAction?: (playerId: string, action: unknown) => void;
}

const STUN: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
];

interface TurnBridge {
  readonly url?: string;
  readonly username?: string;
  readonly credential?: string;
}

/** STUN público + TURN inyectado por el anfitrión nativo o la configuración local. */
export function iceServers(target: unknown = globalThis): RTCIceServer[] {
  const turn = (target as { MesaVivaTurn?: TurnBridge }).MesaVivaTurn;
  if (typeof turn?.url !== 'string' || turn.url.trim().length === 0) return [...STUN];
  return [
    ...STUN,
    {
      urls: turn.url,
      ...(turn.username !== undefined ? { username: turn.username } : {}),
      ...(turn.credential !== undefined ? { credential: turn.credential } : {}),
    },
  ];
}

export function peerOptions(target: unknown = globalThis): { debug: number; config: { iceServers: RTCIceServer[] } } {
  return { debug: 0, config: { iceServers: iceServers(target) } };
}

export function guestPeerId(code: string): string {
  return `mesa-viva-guest-${code}-${Date.now()}`;
}
