import type { CaidaView } from '@mesa-viva/core';
import { CardDropSession, type DropResult, type DropZone } from '@mesa-viva/engine-25d';
import { describe, expect, it } from 'vitest';
import { newGameSession } from './game-session.js';
import { applyCardDrop } from './play-card.js';

const mesa: DropZone = { id: 'mesa', kind: 'table', x: 0, y: 0, width: 500, height: 400 };

function humanTurnSession() {
  for (let seed = 1; seed < 300; seed += 1) {
    const session = newGameSession({ game: 'caida', mode: 'solo', humanName: 'Ana', botLevel: 'novato', seed });
    session.autoPlayBots(8);
    if (session.currentPlayer === session.viewerId && session.result === null) return session;
  }
  throw new Error('No se encontró una semilla con turno humano');
}

function firstCard(session: ReturnType<typeof humanTurnSession>): string {
  const view = session.view as CaidaView;
  const hand = view.players.find((player) => player.id === session.viewerId)?.hand ?? [];
  const card = hand[0];
  if (card === undefined) throw new Error('La mano está vacía');
  return card.id;
}

describe('arrastrar y soltar cartas ejecuta la jugada', () => {
  it('soltar sobre la mesa juega la carta y avanza el turno', () => {
    const session = humanTurnSession();
    const cardId = firstCard(session);
    const before = session.currentPlayer;
    const result: DropResult = { cardId, zone: mesa, tap: false, at: { x: 200, y: 200 } };
    const fresh = applyCardDrop(session, result);
    expect(fresh).not.toBeNull();
    const view = session.view as CaidaView;
    const hand = view.players.find((player) => player.id === session.viewerId)?.hand ?? [];
    expect(hand.some((card) => card.id === cardId)).toBe(false);
    expect(view.log.some((line) => line.includes('juega'))).toBe(true);
    expect(session.currentPlayer !== before || view.phase !== 'playing').toBe(true);
  });

  it('pointerupoutside ejecuta la jugada sin dejar la carta trabada', () => {
    const session = humanTurnSession();
    const cardId = firstCard(session);
    const before = session.currentPlayer;
    const drop = new CardDropSession({
      onPlay: (dropResult) => { applyCardDrop(session, dropResult); },
    });
    drop.begin(cardId, { x: 40, y: 320 });
    drop.move({ x: 260, y: 180 }, [mesa]);
    drop.release({ x: 280, y: 190 }, [mesa], 'pointerupoutside');
    expect(drop.active).toBe(false);
    const view = session.view as CaidaView;
    expect(view.log.some((line) => line.includes('juega'))).toBe(true);
    expect(session.currentPlayer !== before || view.phase !== 'playing').toBe(true);
  });

  it('pointercancel libera el gesto y no juega', () => {
    const session = humanTurnSession();
    const cardId = firstCard(session);
    const before = session.currentPlayer;
    const drop = new CardDropSession({
      onPlay: (dropResult) => { applyCardDrop(session, dropResult); },
    });
    drop.begin(cardId, { x: 40, y: 320 });
    drop.move({ x: 260, y: 180 }, [mesa]);
    drop.cancel();
    expect(drop.active).toBe(false);
    expect(session.currentPlayer).toBe(before);
  });
});
