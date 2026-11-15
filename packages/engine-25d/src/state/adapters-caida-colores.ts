import type { CaidaView, ColorsView } from '@mesa-viva/core';
import { baseSeat } from './adapter-shared.js';
import { type CardSnapshot, emptySnapshot, type TableSnapshot } from './snapshot.js';

/** Adapta la mesa de Caída Venezolana conservando la baraja española. */
export function snapshotFromCaida(view: CaidaView, viewerId: string): TableSnapshot {
  const base = emptySnapshot('caida', viewerId);
  const seats = view.players.map((player) => ({
    ...baseSeat(player.id, player.name, viewerId, player.score, player.id === view.turnPlayer),
    isDealer: player.id === view.dealerId,
    handCount: player.handCount,
    ...(player.canto !== null ? { badge: player.canto.kind } : {}),
  }));
  const tableCards: CardSnapshot[] = view.table.map((card, slot) => ({
    id: card.id,
    deck: 'espanola',
    rank: String(card.rank),
    suit: card.suit,
    faceUp: true,
    zone: 'table',
    slot,
  }));
  const hand: CardSnapshot[] = (view.players.find((player) => player.id === viewerId)?.hand ?? []).map((card, slot) => ({
    id: card.id,
    deck: 'espanola',
    rank: String(card.rank),
    suit: card.suit,
    faceUp: true,
    zone: 'hand',
    slot,
  }));
  return {
    ...base,
    phase: view.phase,
    turnPlayerId: view.turnPlayer,
    seats,
    tableCards,
    hand,
    canInteract: view.turnPlayer === viewerId && view.phase === 'playing',
  };
}

/** Adapta Cartas de Colores usando el mazo de color y su símbolo visible. */
export function snapshotFromColors(view: ColorsView, viewerId: string): TableSnapshot {
  const base = emptySnapshot('colores', viewerId);
  const seats = view.players.map((player) => ({
    ...baseSeat(player.id, player.name, viewerId, player.score, player.id === view.turnPlayer),
    handCount: player.handCount,
  }));
  const top = view.topCard;
  const tableCards: CardSnapshot[] = top === null ? [] : [{
    id: top.id,
    deck: 'color',
    rank: String(top.symbol),
    suit: top.color,
    label: String(top.symbol),
    faceUp: true,
    zone: 'discard',
    slot: 0,
  }];
  const hand: CardSnapshot[] = (view.players.find((player) => player.id === viewerId)?.hand ?? []).map((card, slot) => ({
    id: card.id,
    deck: 'color',
    rank: String(card.symbol),
    suit: card.color,
    label: String(card.symbol),
    faceUp: true,
    zone: 'hand',
    slot,
  }));
  return {
    ...base,
    phase: view.phase,
    turnPlayerId: view.turnPlayer,
    seats,
    tableCards,
    hand,
    canInteract: view.turnPlayer === viewerId && view.phase === 'playing',
  };
}
