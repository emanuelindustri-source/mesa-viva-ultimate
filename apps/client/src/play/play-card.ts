import type { CaidaAction, CaidaView, ColorsAction } from '@mesa-viva/core';
import type { DropResult } from '@mesa-viva/engine-25d';
import type { GameSession } from './game-session.js';

type CaidaPlay = Extract<CaidaAction, { type: 'play' }>;

function caidaAction(session: GameSession, result: DropResult): CaidaPlay | null {
  const view = session.view as CaidaView;
  const actions = (session.legalActions as readonly CaidaAction[]).filter(
    (action): action is CaidaPlay => action.type === 'play' && action.cardId === result.cardId,
  );
  if (actions.length === 0) return null;
  if (result.zone !== null && result.zone.kind === 'capture') {
    const index = view.table.findIndex((card) => card.id === result.zone?.id);
    return actions.find((action) => action.captureIndex === index) ?? null;
  }
  if (result.zone === null && !result.tap) return null;
  const capture = actions.find((action) => action.captureIndex !== null);
  if (capture !== undefined) return capture;
  return actions.find((action) => action.captureIndex === null) ?? null;
}

function colorsAction(session: GameSession, result: DropResult): ColorsAction | null {
  if (result.zone === null && !result.tap) return null;
  const actions = (session.legalActions as readonly ColorsAction[]).filter(
    (action) => action.type === 'play' && action.cardId === result.cardId,
  );
  return actions[0] ?? null;
}

/** Traduce el gesto de arrastre o toque a una acción legal de core. */
export function actionForCardDrop(session: GameSession, result: DropResult): unknown | null {
  if (session.game.key === 'caida') return caidaAction(session, result);
  if (session.game.key === 'colores') return colorsAction(session, result);
  return null;
}

/** Ejecuta la jugada. Devuelve las líneas nuevas del registro o null. */
export function applyCardDrop(session: GameSession, result: DropResult): readonly string[] | null {
  const action = actionForCardDrop(session, result);
  if (action === null) return null;
  return session.act(action);
}
