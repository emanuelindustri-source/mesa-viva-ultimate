import { type BotLevel, chooseBest } from '../../ai/types.js';
import { legalCaidaActions } from '../../games/caida/rules.js';
import type { CaidaAction, CaidaState } from '../../games/caida/types.js';
import type { SpanishRank } from '../../games/common/spanish-deck.js';
import { caidaPoints } from '../../games/common/spanish-deck.js';

function unseenRanks(state: CaidaState, playerId: string): Map<SpanishRank, number> {
  const counts = new Map<SpanishRank, number>();
  const deckRanks: SpanishRank[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
  for (const rank of deckRanks) counts.set(rank, 4);
  const me = state.players.find((player) => player.id === playerId);
  const seen = [
    ...(me?.hand ?? []),
    ...state.table,
    ...state.players.flatMap((player) => player.captured),
  ];
  for (const card of seen) {
    counts.set(card.rank, (counts.get(card.rank) ?? 0) - 1);
  }
  return counts;
}

function actionCard(state: CaidaState, playerId: string, action: CaidaAction) {
  if (action.type !== 'play') return null;
  return state.players
    .find((player) => player.id === playerId)
    ?.hand.find((card) => card.id === action.cardId) ?? null;
}

function immediatePoints(state: CaidaState, playerId: string, action: CaidaAction): number {
  if (action.type !== 'play' || action.captureIndex === null) return 0;
  const card = actionCard(state, playerId, action);
  if (!card) return 0;
  const index = action.captureIndex;
  const wasLast = index === state.table.length - 1;
  if (index === 0) return wasLast ? 5 : 4;
  return wasLast ? caidaPoints(card.rank) : 0;
}

function capturedCount(state: CaidaState, action: CaidaAction): number {
  if (action.type !== 'play' || action.captureIndex === null) return 0;
  return state.table.length - action.captureIndex;
}

function risk(state: CaidaState, playerId: string, action: CaidaAction): number {
  const card = actionCard(state, playerId, action);
  if (!card) return 100;
  const unseen = unseenRanks(state, playerId);
  const total = [...unseen.values()].reduce((sum, value) => sum + value, 0);
  return total === 0 ? 0 : ((unseen.get(card.rank) ?? 0) / total) * 10;
}

export function chooseCaidaAction(
  state: CaidaState,
  playerId: string,
  level: BotLevel,
  legal?: readonly CaidaAction[],
): CaidaAction {
  const actions = legal ?? legalCaidaActions(state, playerId);
  if (actions.length === 0) throw new Error('La Caída no tiene acciones legales');
  if (level === 'novato') {
    const capture = actions.find((action) => action.type === 'play' && action.captureIndex !== null);
    if (capture) return capture;
    const picked = actions[state.turn % actions.length];
    if (picked) return picked;
    const first = actions[0];
    if (!first) throw new Error('La Caída no tiene acciones legales');
    return first;
  }
  return chooseBest(actions, (action) => {
    if (action.type === 'next-round') return 1;
    const base = immediatePoints(state, playerId, action) * 10 + capturedCount(state, action);
    if (level === 'competitivo') {
      return action.captureIndex !== null ? base : -risk(state, playerId, action);
    }
    const card = actionCard(state, playerId, action);
    const pairBonus =
      card && state.players.some(
        (player) => player.id === playerId && player.hand.filter((item) => item.rank === card.rank).length > 1,
      )
        ? 2
        : 0;
    return base * 2 - risk(state, playerId, action) + pairBonus;
  });
}
