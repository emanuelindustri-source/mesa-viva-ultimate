import type { BotLevel } from '@mesa-viva/core';
import type { TableSnapshot } from '@mesa-viva/engine-25d';
import type { ActionOption } from './action-labels.js';
import type { GameKey } from './game-defs.js';
import type { PlayerSeat } from './game-session.js';

export interface RoomPlayer {
  readonly id: string;
  readonly name: string;
  readonly isHost: boolean;
  readonly connected: boolean;
}

export interface RoomLobby {
  readonly code: string;
  readonly hostId: string;
  readonly players: readonly RoomPlayer[];
  readonly gameKey: GameKey;
  readonly started: boolean;
}

export interface RoomView {
  readonly view: unknown;
  readonly snapshot: TableSnapshot;
  readonly actions: readonly ActionOption[];
  readonly currentPlayer: string | null;
  readonly result: unknown;
}

export interface RoomState {
  readonly gameKey: GameKey;
  readonly phase: string;
  readonly turnPlayer: string | null;
  readonly seats: readonly PlayerSeat[];
  readonly views: Readonly<Record<string, RoomView>>;
  readonly result: unknown;
}

export type RoomMessage =
  | { readonly type: 'hello'; readonly playerId: string; readonly name: string }
  | { readonly type: 'welcome'; readonly lobby: RoomLobby; readonly playerId: string }
  | { readonly type: 'lobby'; readonly lobby: RoomLobby }
  | { readonly type: 'start'; readonly gameKey: GameKey; readonly seats: readonly PlayerSeat[]; readonly seed: number; readonly botLevel: BotLevel }
  | { readonly type: 'action'; readonly playerId: string; readonly action: unknown }
  | { readonly type: 'state'; readonly state: RoomState }
  | { readonly type: 'chat'; readonly from: string; readonly name: string; readonly text: string; readonly at: number }
  | { readonly type: 'game'; readonly gameKey: GameKey }
  | { readonly type: 'error'; readonly message: string };

export function createRoomCode(seed = Date.now()): string {
  const value = Math.abs(Math.floor(seed)) % 1_000_000;
  return String(value).padStart(6, '0');
}

export function roomPeerId(code: string): string {
  return `mesa-viva-ultimate-${code}-host`;
}

export function roomLink(code: string, origin = globalThis.location?.origin ?? 'https://example.com', base = '/mesa-viva-ultimate/'): string {
  return `${origin}${base.replace(/\/$/, '')}/play/?sala=${code}`;
}

export function codeFromText(text: string): string | null {
  const direct = /^\d{6}$/.test(text.trim()) ? text.trim() : null;
  if (direct !== null) return direct;
  try {
    const url = new URL(text);
    const code = url.searchParams.get('sala');
    return code !== null && /^\d{6}$/.test(code) ? code : null;
  } catch {
    return null;
  }
}

export function sanitizeChat(text: string): string | null {
  const clean = text.replace(/\s+/g, ' ').trim().slice(0, 160);
  return clean.length === 0 ? null : clean;
}

export function roomMessage(value: unknown): RoomMessage | null {
  if (value === null || typeof value !== 'object') return null;
  const type = (value as { type?: unknown }).type;
  return typeof type === 'string' ? value as RoomMessage : null;
}
