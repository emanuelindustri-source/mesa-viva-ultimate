import type { PerformanceState, PlayerMusicalState } from './types.js';

/** Prioriza energía de racha/canto y luego concentración por inactividad. */
export function derivePerformanceState(input: PlayerMusicalState = {}): PerformanceState {
  const streak = Math.max(0, input.streak ?? 0);
  const chants = Math.max(0, input.chants ?? 0);
  const tension = Math.min(1, Math.max(0, input.tension ?? 0));
  if (streak >= 3 || chants >= 2) return tension > 0.72 ? 'climax' : 'energia';
  if ((input.idleSeconds ?? 0) >= 6) return 'concentracion';
  if (tension > 0.82) return 'climax';
  return 'calma';
}

export function energyForState(state: PerformanceState): number {
  switch (state) {
    case 'concentracion': return 0.25;
    case 'energia': return 0.72;
    case 'climax': return 1;
    default: return 0.5;
  }
}

export function stateLabel(state: PerformanceState): string {
  switch (state) {
    case 'concentracion': return 'Concentración';
    case 'energia': return 'Energía';
    case 'climax': return 'Clímax';
    default: return 'Calma';
  }
}

export function densityForState(state: PerformanceState): number {
  if (state === 'concentracion') return 0.35;
  if (state === 'energia') return 0.82;
  if (state === 'climax') return 1;
  return 0.6;
}
