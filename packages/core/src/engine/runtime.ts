import { sameAction } from './action-key.js';
import { IllegalActionError } from './errors.js';
import type { IGameModule, PlayerId } from './types.js';

/** Valida y aplica una acción. Lanza IllegalActionError si no es legal. */
export function act<S, A, V>(
  module: IGameModule<S, A, V>,
  state: S,
  player: PlayerId,
  action: A,
): S {
  const legal = module.legalActions(state, player);
  if (!legal.some((candidate) => sameAction(candidate, action))) {
    throw new IllegalActionError(
      `Acción ilegal para ${player} en ${module.meta.id}: ${JSON.stringify(action)}`,
    );
  }
  return module.applyAction(state, player, action);
}

export interface PlayReport<S> {
  readonly state: S;
  readonly steps: number;
  readonly finished: boolean;
}

export type ActionChooser<S, A> = (
  state: S,
  player: PlayerId,
  legal: readonly A[],
) => A;

/** Ejecuta una partida completa con un selector de acciones determinista. */
export function playToEnd<S, A, V>(
  module: IGameModule<S, A, V>,
  initialState: S,
  choose: ActionChooser<S, A>,
  maxSteps = 5000,
): PlayReport<S> {
  let state = initialState;
  for (let steps = 0; steps < maxSteps; steps += 1) {
    if (module.result(state) !== null) {
      return { state, steps, finished: true };
    }
    const player = module.currentPlayer(state);
    if (player === null) {
      return { state, steps, finished: false };
    }
    const legal = module.legalActions(state, player);
    if (legal.length === 0) {
      throw new IllegalActionError(
        `No hay acciones legales para ${player} en ${module.meta.id}`,
      );
    }
    const action = choose(state, player, legal);
    state = act(module, state, player, action);
  }
  throw new IllegalActionError(
    `La partida de ${module.meta.id} superó ${maxSteps} pasos`,
  );
}
