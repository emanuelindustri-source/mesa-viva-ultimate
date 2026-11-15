import type { SpanishSuit } from './glyphs.js';
import { el } from './svg.js';

/**
 * Ilustración vectorial de los cuatro palos de la baraja española.
 * Cada grupo se dibuja centrado en (0,0) con un alto aproximado de 52.
 */

const GOLD = '#e0a81c';
const GOLD_DARK = '#9a6c05';
const GOLD_LIGHT = '#ffe89a';
const RUBY = '#b3172f';
const RUBY_DARK = '#7a0c1d';
const STEEL = '#9fc4dd';
const STEEL_DARK = '#3d6d8f';
const WOOD = '#8a4b1f';
const WOOD_DARK = '#5a2d0d';
const LEAF = '#3f8f3a';
const LEAF_LIGHT = '#7fc55b';

export function oroArt(): string {
  const rays = Array.from({ length: 12 }, (_, index) =>
    el('line', {
      x1: 0, y1: -27, x2: 0, y2: -22,
      stroke: GOLD_LIGHT, 'stroke-width': 2, 'stroke-linecap': 'round',
      transform: `rotate(${index * 30})`, opacity: 0.9,
    }),
  ).join('');
  return el('g', {},
    el('circle', { r: 26, fill: GOLD_DARK }) +
    el('circle', { r: 23.5, fill: GOLD }) +
    el('circle', { r: 20, fill: 'none', stroke: GOLD_LIGHT, 'stroke-width': 2 }) +
    rays +
    el('circle', { r: 15, fill: GOLD_LIGHT, opacity: 0.5 }) +
    el('circle', { r: 14, fill: GOLD }) +
    el('path', {
      d: 'M-6 8 C-6 -2 -1 -4 2 -9 C4 -4 9 -2 8 4 C7 10 1 12 -6 8 Z',
      fill: GOLD_DARK, opacity: 0.85,
    }) +
    el('path', { d: 'M-2 -7 C0 -3 2 0 5 3', fill: 'none', stroke: GOLD_LIGHT, 'stroke-width': 1.6, 'stroke-linecap': 'round' }),
    );
}

export function copaArt(): string {
  return el('g', {},
    el('path', { d: 'M-18 -22 H18 V-8 C18 6 9 14 0 16 C-9 14 -18 6 -18 -8 Z', fill: RUBY }) +
    el('path', { d: 'M-18 -22 H18 V-14 H-18 Z', fill: GOLD }) +
    el('path', { d: 'M-13 -9 C-13 2 -7 8 0 10 C7 8 13 2 13 -9', fill: 'none', stroke: GOLD_LIGHT, 'stroke-width': 2.4 }) +
    el('circle', { cx: 0, cy: -3, r: 4.5, fill: RUBY_DARK }) +
    el('circle', { cx: 0, cy: -3, r: 2.2, fill: GOLD_LIGHT }) +
    el('rect', { x: -2.5, y: 16, width: 5, height: 9, fill: GOLD }) +
    el('path', { d: 'M-13 25 H13 L9 20 H-9 Z', fill: GOLD }) +
    el('path', { d: 'M-18 25 H18', stroke: GOLD_DARK, 'stroke-width': 2, 'stroke-linecap': 'round' }) +
    el('circle', { cx: -14, cy: -6, r: 4, fill: GOLD }) +
    el('circle', { cx: 14, cy: -6, r: 4, fill: GOLD }) +
    el('path', { d: 'M-9 -18 C-6 -14 -6 -8 -8 -3', fill: 'none', stroke: '#ffffff', 'stroke-width': 2, opacity: 0.55 }),
  );
}

export function espadaArt(): string {
  return el('g', {},
    el('path', { d: 'M0 -30 C4 -22 5 -12 3 2 L0 10 L-3 2 C-5 -12 -4 -22 0 -30 Z', fill: STEEL }) +
    el('path', { d: 'M0 -30 C2 -22 2 -12 1 2 L0 10 Z', fill: '#ffffff', opacity: 0.55 }) +
    el('path', { d: 'M-11 10 Q0 5 11 10 L10 14 Q0 10 -10 14 Z', fill: GOLD }) +
    el('circle', { cx: 0, cy: 12, r: 3, fill: RUBY }) +
    el('rect', { x: -2, y: 14, width: 4, height: 11, rx: 2, fill: WOOD_DARK }) +
    el('circle', { cx: 0, cy: 26, r: 3.4, fill: GOLD }) +
    el('path', { d: 'M9 8 C16 2 22 5 24 12 C18 15 12 15 9 8 Z', fill: RUBY }) +
    el('path', { d: 'M-9 8 C-16 2 -22 5 -24 12 C-18 15 -12 15 -9 8 Z', fill: RUBY_DARK, opacity: 0.85 }),
  );
}

export function bastoArt(): string {
  return el('g', {},
    el('path', { d: 'M-5 26 C-8 12 -8 -10 -3 -26 C1 -30 5 -27 6 -20 C4 -6 6 12 5 26 Z', fill: WOOD }) +
    el('path', { d: 'M-2 24 C-4 10 -4 -9 0 -23 C1.5 -25 3 -23 3 -18 C1 -6 3 10 2 24 Z', fill: '#b9773d', opacity: 0.7 }) +
    el('path', { d: 'M5 2 C13 -3 18 1 20 8 C13 10 7 8 5 2 Z', fill: LEAF }) +
    el('path', { d: 'M-4 -6 C-12 -12 -17 -9 -19 -2 C-12 1 -6 -1 -4 -6 Z', fill: LEAF_LIGHT }) +
    el('path', { d: 'M4 -16 C11 -21 16 -18 18 -11 C12 -8 6 -10 4 -16 Z', fill: LEAF }) +
    el('path', { d: 'M-3 12 C-10 8 -15 10 -17 16 C-10 19 -5 17 -3 12 Z', fill: LEAF_LIGHT }) +
    el('line', { x1: 12, y1: 1, x2: 20, y2: 8, stroke: LEAF_LIGHT, 'stroke-width': 1, opacity: 0.7 }) +
    el('line', { x1: -12, y1: -10, x2: -18, y2: -2, stroke: LEAF_LIGHT, 'stroke-width': 1, opacity: 0.7 }),
  );
}

export function spanishSuitArt(suit: SpanishSuit): string {
  if (suit === 'oros') return oroArt();
  if (suit === 'copas') return copaArt();
  if (suit === 'espadas') return espadaArt();
  return bastoArt();
}

export const SPANISH_SUIT_INK: Readonly<Record<SpanishSuit, string>> = {
  oros: GOLD_DARK,
  copas: RUBY,
  espadas: STEEL_DARK,
  bastos: LEAF,
};
