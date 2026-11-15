import { el, safeId } from './svg.js';

export const SPANISH_SUITS = ['oros', 'copas', 'espadas', 'bastos'] as const;
export const ENGLISH_SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const SPANISH_RANKS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12] as const;
export const ENGLISH_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

export type SpanishSuit = (typeof SPANISH_SUITS)[number];
export type EnglishSuit = (typeof ENGLISH_SUITS)[number];
export type EnglishRank = (typeof ENGLISH_RANKS)[number];

export function spanishSuitGlyph(suit: SpanishSuit, color: string): string {
  const common = { fill: color, stroke: color, 'stroke-width': 3 };
  if (suit === 'oros') {
    return el(
      'g',
      {},
      el('circle', { r: 18, fill: 'none', stroke: color, 'stroke-width': 4 }) +
        el('circle', { r: 11, ...common }) +
        el('circle', { r: 3.5, fill: '#ffffff' }),
    );
  }
  if (suit === 'copas') {
    return el(
      'g',
      { fill: color, stroke: color, 'stroke-width': 3 },
      el('path', { d: 'M-15 -16 H15 V-4 C15 8 7 15 0 17 C-7 15 -15 8 -15 -4 Z' }) +
        el('path', { d: 'M0 17 V25 M-9 25 H9', fill: 'none', 'stroke-width': 4 }),
    );
  }
  if (suit === 'espadas') {
    return el(
      'g',
      { fill: color, stroke: color, 'stroke-width': 2 },
      el('path', { d: 'M0 -27 L6 -10 L4 12 L0 18 L-4 12 L-6 -10 Z' }) +
        el('rect', { x: -13, y: 12, width: 26, height: 4, rx: 2 }) +
        el('rect', { x: -2.5, y: 16, width: 5, height: 10, rx: 2 }),
    );
  }
  return el(
    'g',
    { fill: color, stroke: color, 'stroke-width': 2 },
    el('path', {
      d: 'M0 -27 C11 -27 13 -13 4 -7 C15 -3 13 10 4 13 V25 H-4 V13 C-13 10 -15 -3 -4 -7 C-13 -13 -11 -27 0 -27 Z',
    }),
  );
}

export function englishSuitGlyph(suit: EnglishSuit, color: string): string {
  if (suit === 'hearts') {
    return el('path', {
      fill: color,
      d: 'M0 25 C-30 3 -25 -25 -9 -25 C-3 -25 0 -20 0 -15 C0 -20 3 -25 9 -25 C25 -25 30 3 0 25 Z',
    });
  }
  if (suit === 'diamonds') {
    return el('path', { fill: color, d: 'M0 -27 L20 0 L0 27 L-20 0 Z' });
  }
  if (suit === 'clubs') {
    return el(
      'g',
      { fill: color },
      el('circle', { cx: 0, cy: -13, r: 10 }) +
        el('circle', { cx: -12, cy: 2, r: 10 }) +
        el('circle', { cx: 12, cy: 2, r: 10 }) +
        el('path', { d: 'M-4 6 H4 L7 26 H-7 Z' }),
    );
  }
  return el('path', {
    fill: color,
    d: 'M0 -27 C10 -12 22 -3 22 8 C22 18 13 24 5 20 C2 19 1 22 2 27 H-2 C-1 22 -2 19 -5 20 C-13 24 -22 18 -22 8 C-22 -3 -10 -12 0 -27 Z',
  });
}

export type PipPoint = readonly [number, number];

/** Posiciones normalizadas (0..1) para las cartas numéricas. */
export function pipPositions(count: number): readonly PipPoint[] {
  if (count <= 0) return [];
  if (count === 1) return [[0.5, 0.5]];
  if (count === 2) return [[0.5, 0.28], [0.5, 0.72]];
  if (count === 3) return [[0.5, 0.22], [0.5, 0.5], [0.5, 0.78]];
  if (count === 4) return [[0.32, 0.26], [0.68, 0.26], [0.32, 0.74], [0.68, 0.74]];
  if (count === 5) return [[0.32, 0.24], [0.68, 0.24], [0.5, 0.5], [0.32, 0.76], [0.68, 0.76]];
  if (count === 6) return [[0.32, 0.2], [0.68, 0.2], [0.32, 0.5], [0.68, 0.5], [0.32, 0.8], [0.68, 0.8]];
  if (count === 7) return [...pipPositions(6), [0.5, 0.35]];
  if (count === 8) {
    return [[0.32, 0.16], [0.68, 0.16], [0.32, 0.38], [0.68, 0.38], [0.32, 0.62], [0.68, 0.62], [0.32, 0.84], [0.68, 0.84]];
  }
  if (count === 9) {
    return [[0.28, 0.22], [0.5, 0.22], [0.72, 0.22], [0.28, 0.5], [0.5, 0.5], [0.72, 0.5], [0.28, 0.78], [0.5, 0.78], [0.72, 0.78]];
  }
  return [[0.32, 0.14], [0.68, 0.14], [0.32, 0.32], [0.68, 0.32], [0.32, 0.5], [0.68, 0.5], [0.32, 0.68], [0.68, 0.68], [0.32, 0.86], [0.68, 0.86]];
}

export function suitAssetId(suit: string): string {
  return safeId('palo', suit);
}
