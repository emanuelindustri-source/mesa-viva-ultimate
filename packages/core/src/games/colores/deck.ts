import { COLORS, type ColorsCard, type ColorsColor, type ColorsSymbol } from './types.js';

function symbolValue(symbol: ColorsSymbol): number {
  if (typeof symbol === 'number') return symbol;
  if (symbol === 'comodin' || symbol === 'roba4') return 50;
  return 20;
}

function card(
  color: ColorsColor | 'negro',
  symbol: ColorsSymbol,
  copy: number,
): ColorsCard {
  return { id: `${color}-${String(symbol)}-${copy}`, color, symbol, value: symbolValue(symbol) };
}

/** Baraja original de 108 cartas: 4 colores + 8 comodines. */
export function createColorsDeck(): ColorsCard[] {
  const deck: ColorsCard[] = [];
  for (const color of COLORS) {
    deck.push(card(color, 0, 0));
    for (let number = 1; number <= 9; number += 1) {
      deck.push(card(color, number, 0), card(color, number, 1));
    }
    for (const symbol of ['salta', 'reversa', 'roba2'] as const) {
      deck.push(card(color, symbol, 0), card(color, symbol, 1));
    }
  }
  for (let copy = 0; copy < 4; copy += 1) {
    deck.push(card('negro', 'comodin', copy), card('negro', 'roba4', copy));
  }
  return deck;
}
