import type {
  BlackjackAction,
  CaidaAction,
  CaidaView,
  ColorsAction,
  ColorsView,
  DominoAction,
  DominoView,
} from '@mesa-viva/core';
import type { GameSession } from './game-session.js';

interface SpanishCardLike {
  readonly rank: number;
  readonly suit: string;
}

export interface ActionOption {
  readonly id: string;
  readonly label: string;
  readonly action: unknown;
  readonly emphasis?: 'primary' | 'danger' | 'ghost';
}

const SPANISH_RANK: Readonly<Record<number, string>> = { 1: 'As', 10: 'Sota', 11: 'Caballo', 12: 'Rey' };
const SPANISH_SUIT: Readonly<Record<string, string>> = { oro: 'oros', copa: 'copas', espada: 'espadas', basto: 'bastos' };

function spanishCard(card: SpanishCardLike): string {
  return `${SPANISH_RANK[card.rank] ?? String(card.rank)} de ${SPANISH_SUIT[card.suit] ?? card.suit}`;
}

function baseAction(action: unknown): string {
  return (action as { type?: string }).type ?? 'acción';
}

function caidaOptions(session: GameSession, actions: readonly unknown[]): ActionOption[] {
  const view = session.view as CaidaView;
  const hand = view.players.find((player) => player.id === session.viewerId)?.hand ?? [];
  return actions.map((action, index) => {
    const typed = action as CaidaAction;
    if (typed.type === 'next-round') return { id: `next-${index}`, label: 'Siguiente ronda', action, emphasis: 'primary' as const };
    const card = hand.find((item) => item.id === typed.cardId);
    const target = typed.captureIndex === null ? 'a la mesa' : `captura ${typed.captureIndex + 1}`;
    return { id: `play-${index}`, label: `${card === undefined ? 'Jugar carta' : spanishCard(card)} → ${target}`, action, emphasis: typed.captureIndex === null ? 'ghost' as const : 'primary' as const };
  });
}

function dominoOptions(session: GameSession, actions: readonly unknown[]): ActionOption[] {
  const view = session.view as DominoView;
  const hand = view.players.find((player) => player.id === session.viewerId)?.hand ?? [];
  return actions.map((action, index) => {
    const typed = action as DominoAction;
    if (typed.type === 'play') {
      const tile = hand.find((item) => item.id === typed.tileId);
      const tileLabel = tile === undefined ? typed.tileId : `${tile.a}–${tile.b}`;
      return { id: `play-${index}`, label: `Jugar ${tileLabel}${typed.side === null ? ' de salida' : ` al ${typed.side === 'left' ? 'izquierda' : 'derecha'}`}`, action, emphasis: 'primary' as const };
    }
    if (typed.type === 'draw') return { id: `draw-${index}`, label: 'Robar del pozo', action };
    if (typed.type === 'pass') return { id: `pass-${index}`, label: 'Pasar', action, emphasis: 'ghost' as const };
    return { id: `next-${index}`, label: 'Siguiente ronda', action, emphasis: 'primary' as const };
  });
}

function blackjackOptions(actions: readonly unknown[]): ActionOption[] {
  return actions.map((action, index) => {
    const typed = action as BlackjackAction;
    if (typed.type === 'bet') return { id: `bet-${index}`, label: `Apostar ${typed.amount} fichas`, action, emphasis: 'primary' as const };
    if (typed.type === 'hit') return { id: `hit-${index}`, label: 'Pedir carta', action, emphasis: 'primary' as const };
    if (typed.type === 'stand') return { id: `stand-${index}`, label: 'Plantarse', action, emphasis: 'ghost' as const };
    if (typed.type === 'double') return { id: `double-${index}`, label: 'Doblar', action, emphasis: 'danger' as const };
    return { id: `next-${index}`, label: 'Siguiente mano', action, emphasis: 'primary' as const };
  });
}

function colorsOptions(session: GameSession, actions: readonly unknown[]): ActionOption[] {
  const view = session.view as ColorsView;
  const hand = view.players.find((player) => player.id === session.viewerId)?.hand ?? [];
  return actions.map((action, index) => {
    const typed = action as ColorsAction;
    if (typed.type === 'play') {
      const card = hand.find((item) => item.id === typed.cardId);
      const cardLabel = card === undefined ? 'Jugar carta' : `${String(card.symbol)} ${card.color}`;
      return { id: `play-${index}`, label: typed.color === null ? cardLabel : `${cardLabel} → ${typed.color}`, action, emphasis: 'primary' as const };
    }
    if (typed.type === 'draw') return { id: `draw-${index}`, label: 'Robar carta', action };
    if (typed.type === 'pass') return { id: `pass-${index}`, label: 'Pasar', action, emphasis: 'ghost' as const };
    return { id: `next-${index}`, label: 'Siguiente ronda', action, emphasis: 'primary' as const };
  });
}

/** Convierte acciones legales de core en botones legibles para cualquier juego. */
export function actionOptionsFor(session: GameSession): readonly ActionOption[] {
  const actions = session.legalActions;
  if (actions.length === 0 || session.game.key === 'ajedrez') return [];
  if (session.game.key === 'caida') return caidaOptions(session, actions);
  if (session.game.key === 'domino') return dominoOptions(session, actions);
  if (session.game.key === 'blackjack') return blackjackOptions(actions);
  return colorsOptions(session, actions);
}

export function actionCount(session: GameSession): number {
  return actionOptionsFor(session).length;
}

export function actionLabel(action: unknown): string {
  return baseAction(action);
}
