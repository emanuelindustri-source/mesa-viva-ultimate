import type { GameResult } from '@mesa-viva/core';
import type { EffectId } from '@mesa-viva/sensory-engine';
import type { GameKey } from './game-defs.js';
import type { VfxEvent } from './vfx.js';

export function signalForAction(game: GameKey, action: unknown): EffectId {
  const type = (action as { type?: string }).type ?? '';
  if (type === 'bet') return 'ficha-colocar';
  if (type === 'play') return game === 'domino' ? 'ficha-colocar' : 'carta-deslizar';
  if (type === 'hit') return 'carta-deslizar';
  if (type === 'draw') return 'barajar';
  if (type === 'pass') return 'turno';
  if (type === 'next-round') return 'turno';
  if (game === 'domino') return 'ficha-colocar';
  return 'ui-click';
}

export function vfxForLog(game: GameKey, log: readonly string[], result: GameResult | null): VfxEvent | null {
  const text = log.join(' ').toLowerCase();
  if (result !== null) return result.winners.length === 0 ? null : 'victoria';
  if (game === 'caida' && (text.includes('cant') || text.includes('caída') || text.includes('caida'))) return 'canto';
  if (game === 'domino' && text.includes('tranca')) return 'tranca';
  if (game === 'domino' && text.includes('doble')) return 'doble';
  if (game === 'colores' && (text.includes('rev') || text.includes('comod') || text.includes('roba'))) return 'especial';
  if (game === 'blackjack' && text.includes('21')) return '21';
  if (game === 'blackjack' && text.includes('blackjack')) return 'blackjack';
  if (text.includes('captur')) return 'captura';
  return null;
}

export function outcomeFor(result: GameResult | null, humanIds: readonly string[]): 'victoria' | 'derrota' | 'empate' {
  if (result === null) return 'empate';
  if (result.winners.length === 0) return 'empate';
  return result.winners.some((id) => humanIds.includes(id)) ? 'victoria' : 'derrota';
}

interface BlackjackViewLike {
  readonly players: readonly {
    readonly id: string;
    readonly hand: { readonly total: number; readonly status: string; readonly outcome: string } | null;
  }[];
}

/** Blackjack no escribe un log legible: deduce el destello de la mano visible. */
export function vfxForView(game: GameKey, view: unknown, viewerId: string): VfxEvent | null {
  if (game !== 'blackjack') return null;
  const hand = (view as BlackjackViewLike).players.find((player) => player.id === viewerId)?.hand;
  if (hand === undefined || hand === null) return null;
  if (hand.status === 'blackjack') return 'blackjack';
  if (hand.total === 21) return '21';
  if (hand.outcome === 'win') return 'victoria';
  return null;
}
