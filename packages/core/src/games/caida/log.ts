import type { CaidaState } from './types.js';

export function logCaida(state: CaidaState, message: string): void {
  state.log.push(message);
  if (state.log.length > 60) state.log.splice(0, state.log.length - 60);
}
