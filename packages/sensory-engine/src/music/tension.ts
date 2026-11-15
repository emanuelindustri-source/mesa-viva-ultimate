import { clamp01 } from '../types.js';
import type { MusicPhase, TensionInput, TensionSnapshot } from './types.js';

export const PHASE_TENSION_WEIGHTS: Readonly<Record<MusicPhase, number>> = Object.freeze({
  preparacion: 0.12,
  apuesta: 0.34,
  turno: 0.5,
  resolucion: 0.78,
  final: 1,
});

/** Tensión de partida: mezcla fase, marcador, apuesta, cartas y presión externa. */
export function deriveTension(input: TensionInput = {}): TensionSnapshot {
  const phase = input.phase ?? 'turno';
  const roundProgress = input.totalRounds !== undefined && input.totalRounds > 0
    ? clamp01((input.round ?? 0) / input.totalRounds)
    : 0;
  const closeness = input.scoreGap !== undefined && input.maxScore !== undefined && input.maxScore > 0
    ? 1 - clamp01(input.scoreGap / input.maxScore)
    : 0.45;
  const stake = input.bankroll !== undefined && input.bankroll > 0
    ? clamp01((input.chipsAtStake ?? 0) / input.bankroll)
    : 0;
  const lateGame = input.totalCards !== undefined && input.totalCards > 0
    ? 1 - clamp01((input.cardsLeft ?? input.totalCards) / input.totalCards)
    : 0;
  const pressure = clamp01(input.pressure ?? 0);
  const finalBonus = phase === 'final' ? 0.14 : 0;
  const raw = 0.04
    + PHASE_TENSION_WEIGHTS[phase] * 0.3
    + roundProgress * 0.18
    + closeness * 0.16
    + stake * 0.15
    + lateGame * 0.1
    + (input.humanTurn === true ? 0.05 : 0)
    + (input.decisive === true ? 0.12 : 0)
    + pressure * 0.15
    + finalBonus;
  const tension = clamp01(raw);
  return { tension, phase, label: tensionLabel(tension) };
}

export function tensionLabel(tension: number): string {
  const value = clamp01(tension);
  if (value < 0.25) return 'calma';
  if (value < 0.45) return 'interés';
  if (value < 0.65) return 'tensión';
  if (value < 0.82) return 'alta';
  return 'crítica';
}

/** Suaviza el cambio para que la música no salte entre frames. */
export function smoothTension(current: number, target: number, deltaSeconds: number, speed = 2.4): number {
  const amount = clamp01(1 - Math.exp(-Math.max(0, speed) * Math.max(0, deltaSeconds)));
  return clamp01(current + (clamp01(target) - current) * amount);
}

export function tensionFromScore(scoreGap: number, maxScore: number): number {
  if (maxScore <= 0) return 0.5;
  return 1 - clamp01(Math.abs(scoreGap) / maxScore);
}
