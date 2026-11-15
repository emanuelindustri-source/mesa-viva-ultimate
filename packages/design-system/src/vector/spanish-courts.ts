import type { SpanishSuit } from './glyphs.js';
import { spanishSuitArt } from './spanish-art.js';
import { el } from './svg.js';

const SKIN = '#efc59b';
const SKIN_SHADE = '#cf9a6a';
const HAIR = '#3b2416';
const GOLD = '#e0a81c';
const GOLD_LIGHT = '#ffe89a';
const INK = '#40301f';
const CLOTH: Readonly<Record<SpanishSuit, readonly [string, string, string]>> = {
  oros: ['#8e1f2f', '#b3243a', '#e0a81c'],
  copas: ['#1f3f6e', '#2b5a94', '#e0a81c'],
  espadas: ['#26553a', '#357a4f', '#e0a81c'],
  bastos: ['#4b2d78', '#633f96', '#e0a81c'],
};

function face(): string {
  return (
    el('ellipse', { cx: 0, cy: -70, rx: 27, ry: 31, fill: SKIN }) +
    el('path', { d: 'M-27 -78 C-22 -108 22 -108 27 -78 C20 -94 -20 -94 -27 -78 Z', fill: HAIR }) +
    el('path', { d: 'M-25 -76 C-36 -64 -32 -46 -24 -44 C-27 -56 -25 -68 -20 -74 Z', fill: HAIR }) +
    el('path', { d: 'M25 -76 C36 -64 32 -46 24 -44 C27 -56 25 -68 20 -74 Z', fill: HAIR }) +
    el('ellipse', { cx: -9, cy: -73, rx: 3.4, ry: 4.2, fill: INK }) +
    el('ellipse', { cx: 9, cy: -73, rx: 3.4, ry: 4.2, fill: INK }) +
    el('path', { d: 'M-6 -60 Q0 -56 6 -60', fill: 'none', stroke: SKIN_SHADE, 'stroke-width': 2, 'stroke-linecap': 'round' }) +
    el('path', { d: 'M-11 -81 Q-9 -84 -6 -82 M6 -82 Q9 -84 11 -81', fill: 'none', stroke: HAIR, 'stroke-width': 2, 'stroke-linecap': 'round' })
  );
}

function crown(): string {
  return (
    el('path', { d: 'M-30 -98 L-22 -124 L-8 -108 L0 -132 L8 -108 L22 -124 L30 -98 Z', fill: GOLD, stroke: '#9a6c05', 'stroke-width': 2 }) +
    el('circle', { cx: 0, cy: -116, r: 3.4, fill: '#b3172f' }) +
    el('circle', { cx: -20, cy: -112, r: 2.6, fill: '#2b5a94' }) +
    el('circle', { cx: 20, cy: -112, r: 2.6, fill: '#2b5a94' }) +
    el('rect', { x: -30, y: -101, width: 60, height: 6, rx: 3, fill: GOLD_LIGHT })
  );
}

function cap(): string {
  return (
    el('path', { d: 'M-27 -93 C-22 -116 22 -116 27 -93 C12 -100 -12 -100 -27 -93 Z', fill: '#8e1f2f' }) +
    el('path', { d: 'M20 -109 C36 -130 44 -126 50 -116 C40 -112 32 -108 24 -101 Z', fill: '#e0a81c', opacity: 0.9 }) +
    el('path', { d: 'M-27 -93 Q0 -87 27 -93', fill: 'none', stroke: GOLD_LIGHT, 'stroke-width': 3 })
  );
}

function robe(suit: SpanishSuit, tier: 'sota' | 'caballo' | 'rey'): string {
  const [dark, mid, trim] = CLOTH[suit];
  const shoulders = tier === 'rey' ? 46 : 38;
  return (
    el('path', {
      d: `M-${shoulders} -30 C-${shoulders + 6} 10 -30 92 -34 118 L34 118 C30 92 ${shoulders + 6} 10 ${shoulders} -30 C20 -44 -20 -44 -${shoulders} -30 Z`,
      fill: mid, stroke: dark, 'stroke-width': 3,
    }) +
    el('path', { d: `M-${shoulders} -30 C-10 -40 10 -40 ${shoulders} -30 L${shoulders - 8} -12 C8 -20 -8 -20 -${shoulders - 8} -12 Z`, fill: trim, opacity: 0.9 }) +
    el('path', { d: 'M-10 -26 L0 6 L10 -26 L6 60 H-6 Z', fill: '#f7e9c8', opacity: 0.92 }) +
    el('path', { d: 'M-6 18 H6 M-7 33 H7 M-8 48 H8', stroke: trim, 'stroke-width': 2.4 }) +
    el('path', { d: `M-${shoulders - 6} 4 C-56 34 -50 82 -46 112`, fill: 'none', stroke: dark, 'stroke-width': 3, opacity: 0.65 }) +
    el('path', { d: `M${shoulders - 6} 4 C56 34 50 82 46 112`, fill: 'none', stroke: dark, 'stroke-width': 3, opacity: 0.65 })
  );
}

function emblem(suit: SpanishSuit, x: number, y: number, scale: number): string {
  return el('g', { transform: `translate(${x} ${y}) scale(${scale})` }, spanishSuitArt(suit));
}

function king(suit: SpanishSuit): string {
  return (
    robe(suit, 'rey') +
    el('path', { d: 'M-44 -22 C-72 10 -66 78 -58 118 L-24 118 C-34 70 -34 22 -22 -16 Z', fill: CLOTH[suit][0] }) +
    el('path', { d: 'M44 -22 C72 10 66 78 58 118 L24 118 C34 70 34 22 22 -16 Z', fill: CLOTH[suit][0] }) +
    face() +
    el('path', { d: 'M-16 -46 C-8 -36 8 -36 16 -46 C12 -58 -12 -58 -16 -46 Z', fill: '#e8ddc4' }) +
    crown() +
    el('rect', { x: -3, y: -42, width: 6, height: 46, rx: 3, fill: GOLD }) +
    el('circle', { cx: 0, cy: 12, r: 8, fill: GOLD, stroke: GOLD_LIGHT, 'stroke-width': 2 }) +
    emblem(suit, 0, 12, 0.42) +
    el('path', { d: 'M-48 20 C-62 50 -60 84 -56 112', fill: 'none', stroke: GOLD, 'stroke-width': 3 }) +
    el('path', { d: 'M48 20 C62 50 60 84 56 112', fill: 'none', stroke: GOLD, 'stroke-width': 3 })
  );
}

function caballo(suit: SpanishSuit): string {
  return (
    el('path', {
      d: 'M-78 104 C-72 54 -48 14 -16 -4 C10 -18 34 -12 48 4 C66 24 66 64 58 104 Z',
      fill: '#6d4227', stroke: '#3f2412', 'stroke-width': 3,
    }) +
    el('path', { d: 'M-78 104 L-60 104 L-48 56 L-30 104 L-12 104 L-2 34 L18 104 L38 104 L46 44 L58 104 L78 104', fill: 'none', stroke: '#3f2412', 'stroke-width': 3 }) +
    el('path', { d: 'M38 2 C50 -30 74 -38 88 -22 C98 -8 90 10 70 14 C58 16 46 12 38 2 Z', fill: '#7a4a2b', stroke: '#3f2412', 'stroke-width': 3 }) +
    el('path', { d: 'M80 -30 L86 -44 L92 -28 Z', fill: '#3f2412' }) +
    el('circle', { cx: 76, cy: -16, r: 3.4, fill: '#f9f0dc' }) +
    el('path', { d: 'M-34 -20 C-26 -54 -6 -66 14 -54 C28 -45 30 -26 22 -12 C10 4 -18 6 -34 -20 Z', fill: CLOTH[suit][1], stroke: CLOTH[suit][0], 'stroke-width': 3 }) +
    el('circle', { cx: -6, cy: -64, r: 17, fill: SKIN }) +
    el('path', { d: 'M-23 -68 C-18 -88 6 -88 11 -68 C2 -78 -14 -78 -23 -68 Z', fill: HAIR }) +
    el('circle', { cx: -11, cy: -64, r: 2.4, fill: INK }) +
    el('circle', { cx: 1, cy: -64, r: 2.4, fill: INK }) +
    el('path', { d: 'M-16 -92 L-22 -104 L-8 -98 Z', fill: CLOTH[suit][2] }) +
    el('path', { d: 'M-20 8 C-42 28 -44 60 -40 84', fill: 'none', stroke: CLOTH[suit][2], 'stroke-width': 5, 'stroke-linecap': 'round' }) +
    el('path', { d: 'M12 -6 C34 4 40 20 38 34', fill: 'none', stroke: CLOTH[suit][2], 'stroke-width': 5, 'stroke-linecap': 'round' }) +
    el('rect', { x: -8, y: 20, width: 26, height: 7, rx: 3, transform: 'rotate(-24 5 24)', fill: GOLD }) +
    emblem(suit, 24, 40, 0.36)
  );
}

function sota(suit: SpanishSuit): string {
  return (
    robe(suit, 'sota') +
    face() +
    cap() +
    el('path', { d: 'M-38 2 C-54 26 -56 60 -50 92', fill: 'none', stroke: CLOTH[suit][2], 'stroke-width': 4, 'stroke-linecap': 'round' }) +
    el('path', { d: 'M38 2 C54 26 58 58 52 92', fill: 'none', stroke: '#f7e9c8', 'stroke-width': 4, 'stroke-linecap': 'round' }) +
    el('g', { transform: 'rotate(16 0 60)' }, emblem(suit, 0, 60, 0.72)) +
    el('path', { d: 'M-42 38 C-62 54 -68 78 -64 100', fill: 'none', stroke: GOLD, 'stroke-width': 2.4, opacity: 0.85 }) +
    el('path', { d: 'M42 38 C62 54 68 78 64 100', fill: 'none', stroke: GOLD, 'stroke-width': 2.4, opacity: 0.85 })
  );
}

export function courtArt(suit: SpanishSuit, tier: 'sota' | 'caballo' | 'rey'): string {
  return el('g', {}, tier === 'rey' ? king(suit) : tier === 'caballo' ? caballo(suit) : sota(suit));
}
