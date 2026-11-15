import { pipPositions, SPANISH_RANKS, SPANISH_SUITS, type SpanishSuit } from './glyphs.js';
import { SPANISH_SUIT_INK, spanishSuitArt } from './spanish-art.js';
import { courtArt } from './spanish-courts.js';
import { el, safeId, svgRoot, svgText } from './svg.js';
import type { CardPalette, SvgAsset } from './types.js';

const WIDTH = 300;
const HEIGHT = 480;
const PAPER = '#fbf3de';
const PAPER_SHADE = '#efe0bd';
const INK = '#3a2a18';
const CORNER_TITLES: Readonly<Record<10 | 11 | 12, string>> = { 10: 'SOTA', 11: 'CABALLO', 12: 'REY' };

export const SPANISH_CARD_PALETTE: CardPalette = {
  paper: PAPER,
  ink: INK,
  border: '#6d4c41',
  accent: '#b8860b',
};

function miniSuit(suit: SpanishSuit, scale: number): string {
  return el('g', { transform: `scale(${scale})` }, spanishSuitArt(suit));
}

function index(rank: number, suit: SpanishSuit): string {
  const ink = SPANISH_SUIT_INK[suit];
  const label = rank <= 7 ? String(rank) : String(rank);
  return (
    svgText(label, {
      x: 34, y: 56, 'font-size': rank === 10 ? 34 : 38, 'font-weight': 800, 'text-anchor': 'middle',
      'font-family': 'Georgia, serif', fill: ink, 'letter-spacing': -1,
    }) +
    el('g', { transform: 'translate(34 88)' }, miniSuit(suit, 0.62))
  );
}

function paperMarks(): string {
  const flecks = [
    [58, 196, 1.6], [104, 132, 1.2], [238, 168, 1.5], [212, 322, 1.1],
    [78, 388, 1.4], [152, 424, 1.2], [246, 250, 1.3], [126, 66, 1.1],
  ];
  return flecks
    .map(([cx, cy, r]) => el('circle', { cx, cy, r, fill: PAPER_SHADE, opacity: 0.55 }))
    .join('');
}

function numericFace(rank: number, suit: SpanishSuit): string {
  const spots = pipPositions(rank);
  const scale = rank === 1 ? 2.25 : rank <= 3 ? 1.5 : rank <= 6 ? 1.35 : 1.18;
  const watermark = el('g', { transform: 'translate(150 246) scale(3.6)', opacity: 0.07 }, spanishSuitArt(suit));
  return (
    watermark +
    spots
      .map(([x, y]) => el('g', { transform: `translate(${x * 300} ${96 + y * 292}) scale(${scale})`, opacity: 0.98 }, spanishSuitArt(suit)))
      .join('')
  );
}

function courtFace(rank: 10 | 11 | 12, suit: SpanishSuit): string {
  const tier = rank === 10 ? 'sota' : rank === 11 ? 'caballo' : 'rey';
  const title = CORNER_TITLES[rank];
  const ink = SPANISH_SUIT_INK[suit];
  const panel =
    el('rect', { x: 32, y: 66, width: 236, height: 330, rx: 14, fill: '#f7e7c2', opacity: 0.55 }) +
    el('rect', { x: 36, y: 70, width: 228, height: 322, rx: 11, fill: 'none', stroke: ink, 'stroke-width': 1.6, opacity: 0.55 }) +
    el('path', { d: 'M44 96 H64 M44 96 V116 M256 96 H236 M256 96 V116', fill: 'none', stroke: ink, 'stroke-width': 2, opacity: 0.5 }) +
    el('path', { d: 'M44 366 H64 M44 366 V346 M256 366 H236 M256 366 V346', fill: 'none', stroke: ink, 'stroke-width': 2, opacity: 0.5 });
  return (
    panel +
    el('g', { transform: 'translate(150 250) scale(1.02)' }, courtArt(suit, tier)) +
    el('rect', { x: 52, y: 404, width: 196, height: 26, rx: 13, fill: ink, opacity: 0.92 }) +
    svgText(title, {
      x: 150, y: 423, 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle',
      'font-family': 'Georgia, serif', fill: '#fff8e6', 'letter-spacing': 5,
    })
  );
}

export function buildSpanishCard(suit: SpanishSuit, rank: number): SvgAsset {
  const title = `Carta española ${rank} de ${suit}`;
  const body =
    el('rect', { width: WIDTH, height: HEIGHT, rx: 22, fill: '#bd9455' }) +
    el('rect', { x: 3, y: 3, width: WIDTH - 6, height: HEIGHT - 6, rx: 20, fill: PAPER }) +
    el('rect', { x: 9, y: 9, width: WIDTH - 18, height: HEIGHT - 18, rx: 16, fill: 'none', stroke: INK, 'stroke-width': 3.4, opacity: 0.9 }) +
    el('rect', { x: 16, y: 16, width: WIDTH - 32, height: HEIGHT - 32, rx: 12, fill: 'none', stroke: '#b8860b', 'stroke-width': 2, opacity: 0.8 }) +
    el('path', { d: 'M3 446 Q150 468 297 446 L297 477 Q150 480 3 477 Z', fill: '#e8d3a6', opacity: 0.5 }) +
    paperMarks() +
    el('path', { d: 'M22 74 H74', stroke: SPANISH_SUIT_INK[suit], 'stroke-width': 2, opacity: 0.5 }) +
    el('path', { d: 'M226 406 H278', stroke: SPANISH_SUIT_INK[suit], 'stroke-width': 2, opacity: 0.5 }) +
    index(rank, suit) +
    el('g', { transform: 'translate(266 392) rotate(180)' }, index(rank, suit)) +
    (rank >= 10 ? courtFace(rank as 10 | 11 | 12, suit) : numericFace(rank, suit)) +
    el('g', { transform: 'translate(150 452)' },
      el('circle', { r: 3, fill: SPANISH_SUIT_INK[suit], opacity: 0.65 }),
    );
  const id = safeId('carta-espanola', suit, String(rank));
  return {
    id,
    kind: 'carta-espanola',
    width: WIDTH,
    height: HEIGHT,
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    markup: svgRoot({ id, width: WIDTH, height: HEIGHT, viewBox: `0 0 ${WIDTH} ${HEIGHT}`, title, body }),
  };
}

export function generateSpanishDeck(): readonly SvgAsset[] {
  const assets: SvgAsset[] = [];
  for (const suit of SPANISH_SUITS) {
    for (const rank of SPANISH_RANKS) assets.push(buildSpanishCard(suit, rank));
  }
  return assets;
}
