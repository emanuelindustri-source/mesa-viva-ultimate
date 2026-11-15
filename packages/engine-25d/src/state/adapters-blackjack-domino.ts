import type { BlackjackView, DominoView } from '@mesa-viva/core';
import { baseSeat } from './adapter-shared.js';
import {
  type CardSnapshot,
  emptySnapshot,
  type SeatSnapshot,
  type TableSnapshot,
  type TileSnapshot,
} from './snapshot.js';

/** Adapta la vista de blackjack al modelo de presentación, sin reglas nuevas. */
export function snapshotFromBlackjack(view: BlackjackView, viewerId: string): TableSnapshot {
  const base = emptySnapshot('blackjack', viewerId);
  const seats: SeatSnapshot[] = [
    {
      ...baseSeat('dealer', 'Crupier', viewerId, 0, false),
      rank: 'casa',
      isDealer: true,
      handCount: view.dealer.cards.length + (view.dealer.hidden ? 1 : 0),
    },
    ...view.players.map((player) => ({
      ...baseSeat(player.id, player.name, viewerId, player.bankroll, player.id === view.turnPlayer),
      handCount: player.hand?.cards.length ?? 0,
      bankroll: player.bankroll,
    })),
  ];
  const tableCards: CardSnapshot[] = view.dealer.cards.map((card, slot) => ({
    id: card.id,
    deck: 'inglesa',
    rank: card.rank,
    suit: card.suit,
    faceUp: true,
    zone: 'dealer',
    slot,
  }));
  if (view.dealer.hidden) {
    tableCards.push({
      id: 'dealer-hidden',
      deck: 'inglesa',
      rank: '?',
      suit: '?',
      faceUp: false,
      zone: 'dealer',
      slot: tableCards.length,
    });
  }
  const viewer = view.players.find((player) => player.id === viewerId);
  const hand: CardSnapshot[] = (viewer?.hand?.cards ?? []).map((card, slot) => ({
    id: card.id,
    deck: 'inglesa',
    rank: card.rank,
    suit: card.suit,
    faceUp: true,
    zone: 'hand',
    slot,
  }));
  const bet = viewer?.hand?.bet ?? 0;
  return {
    ...base,
    phase: view.phase,
    turnPlayerId: view.turnPlayer ?? view.betPlayer,
    seats,
    hand,
    tableCards,
    chips: bet > 0 ? [{ id: 'apuesta', amount: bet, x: 0, y: -60 }] : [],
    canInteract: view.turnPlayer === viewerId || view.betPlayer === viewerId,
  };
}

/** Adapta dominó: el tablero se convierte en fichas con lado y orden. */
export function snapshotFromDomino(view: DominoView, viewerId: string): TableSnapshot {
  const base = emptySnapshot('domino', viewerId);
  const seats = view.players.map((player) => ({
    ...baseSeat(player.id, player.name, viewerId, player.score, player.id === view.turnPlayer),
    handCount: player.handCount,
  }));
  const tiles: TileSnapshot[] = view.board.map((placement, slot) => ({
    id: placement.tile.id,
    a: placement.tile.a,
    b: placement.tile.b,
    faceUp: true,
    orientation: placement.flipped ? 'vertical' : 'horizontal',
    side: placement.side,
    slot,
  }));
  const hand: TileSnapshot[] = (view.players.find((player) => player.id === viewerId)?.hand ?? []).map((tile, slot) => ({
    id: tile.id,
    a: tile.a,
    b: tile.b,
    faceUp: true,
    orientation: 'horizontal',
    side: 'hand',
    slot,
  }));
  return {
    ...base,
    phase: view.phase,
    turnPlayerId: view.turnPlayer,
    seats,
    tiles: [...tiles, ...hand],
    canInteract: view.turnPlayer === viewerId && view.phase === 'playing',
  };
}
