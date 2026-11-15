import type { GameResult } from '@mesa-viva/core';
import { describe, expect, it } from 'vitest';
import { outcomeFor, signalForAction, vfxForLog, vfxForView } from './game-signals.js';

const result = (winners: readonly string[]): GameResult => ({
  winners,
  scores: {},
  reason: 'fin',
}) as unknown as GameResult;

describe('señales de partida', () => {
  it('mapea acciones a efectos sensoriales', () => {
    expect(signalForAction('caida', { type: 'play' })).toBe('carta-deslizar');
    expect(signalForAction('domino', { type: 'play' })).toBe('ficha-colocar');
    expect(signalForAction('blackjack', { type: 'bet' })).toBe('ficha-colocar');
    expect(signalForAction('colores', { type: 'draw' })).toBe('barajar');
    expect(signalForAction('caida', { type: 'desconocida' })).toBe('ui-click');
  });

  it('elige destellos por juego y evento', () => {
    expect(vfxForLog('caida', ['Ana cantó caída'], null)).toBe('canto');
    expect(vfxForLog('domino', ['Tranca en la mesa'], null)).toBe('tranca');
    expect(vfxForLog('domino', ['Doble seis de salida'], null)).toBe('doble');
    expect(vfxForLog('colores', ['Se jugó reversa'], null)).toBe('especial');
    expect(vfxForLog('blackjack', ['Mano de 21'], null)).toBe('21');
    expect(vfxForLog('caida', ['Ana capturó la mesa'], null)).toBe('captura');
    expect(vfxForLog('caida', ['Partida terminada'], result(['p0']))).toBe('victoria');
    expect(vfxForLog('caida', ['Nada'], null)).toBeNull();
  });

  it('determina victoria, derrota y empate para los humanos', () => {
    expect(outcomeFor(result(['p0']), ['p0'])).toBe('victoria');
    expect(outcomeFor(result(['p1']), ['p0'])).toBe('derrota');
    expect(outcomeFor(result([]), ['p0'])).toBe('empate');
    expect(outcomeFor(null, ['p0'])).toBe('empate');
  });

  it('detecta 21 y blackjack en la mano visible', () => {
    const view = (total: number, status: string, outcome = 'pending') => ({
      players: [{ id: 'p0', hand: { total, status, outcome } }],
    });
    expect(vfxForView('blackjack', view(21, 'blackjack'), 'p0')).toBe('blackjack');
    expect(vfxForView('blackjack', view(21, 'stood'), 'p0')).toBe('21');
    expect(vfxForView('blackjack', view(18, 'stood', 'win'), 'p0')).toBe('victoria');
    expect(vfxForView('blackjack', view(18, 'stood', 'loss'), 'p0')).toBeNull();
    expect(vfxForView('caida', view(21, 'stood'), 'p0')).toBeNull();
  });
});
