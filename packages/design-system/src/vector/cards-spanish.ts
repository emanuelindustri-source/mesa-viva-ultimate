import {
  pipPositions,
  SPANISH_RANKS,
  SPANISH_SUITS,
  type SpanishSuit,
  spanishSuitGlyph,
} from './glyphs.js';
import { el, safeId, svgRoot, svgText } from './svg.js';
import type { CardPalette, SvgAsset } from './types.js';

const WIDTH = 300;
const HEIGHT = 480;
const SUIT_COLORS: Readonly<Record<SpanishSuit, string>> = {
  oros: '#b8860b',
  copas: '#b71c1c',
  espadas: '#1a237e',
  bastos: '#2e7d32',
};
const COURT_LABELS: Readonly<Record<10 | 11 | 12, string>> = { 10: 'S', 11: 'C', 12: 'R' };

export const SPANISH_CARD_PALETTE: CardPalette = {
  paper: '#fffdf5',
  ink: '#1b1b1b',
  border: '#6d4c41',
  accent: '#b8860b',
};

function corner(rank: number, glyph: string, color: string): string {
  return (
    svgText(String(rank), {
      x: 28, y: 48, 'font-size': 30, 'font-weight': 700, 'text-anchor': 'middle',
      'font-family': 'Georgia, serif', fill: color,
    }) +
    el('g', { transform: 'translate(28 82) scale(0.5)' }, glyph)
  );
}

function face(rank: number, color: string, glyph: string): string {
  if (rank <= 7) {
    return pipPositions(rank)
      .map(([x, y]) => el('g', { transform: `translate(${x * WIDTH} ${y * HEIGHT}) scale(0.9)` }, glyph))
      .join('');
  }
  const label = COURT_LABELS[rank as 10 | 11 | 12];
  return (
    el('g', { transform: 'translate(150 245) scale(2.5)' }, glyph) +
    svgText(label, {
      x: 150, y: 355, 'font-size': 34, 'font-weight': 700, 'text-anchor': 'middle',
      'font-family': 'Georgia, serif', fill: color, 'letter-spacing': 4,
    })
  );
}

export function buildSpanishCard(suit: SpanishSuit, rank: number): SvgAsset {
  const color = SUIT_COLORS[suit];
  const glyph = spanishSuitGlyph(suit, color);
  const body =
    el('rect', { x: 0, y: 0, width: WIDTH, height: HEIGHT, rx: 20, fill: SPANISH_CARD_PALETTE.paper, stroke: SPANISH_CARD_PALETTE.border, 'stroke-width': 6 }) +
    el('rect', { x: 12, y: 12, width: WIDTH - 24, height: HEIGHT - 24, rx: 14, fill: 'none', stroke: SPANISH_CARD_PALETTE.accent, 'stroke-width': 1.5, opacity: 0.45 }) +
    corner(rank, glyph, color) +
    face(rank, color, glyph) +
    el('g', { transform: `translate(272 432) rotate(180)` }, corner(rank, glyph, color));
  const id = safeId('carta-espanola', suit, String(rank));
  return {
    id,
    kind: 'carta-espanola',
    width: WIDTH,
    height: HEIGHT,
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    markup: svgRoot({ id, width: WIDTH, height: HEIGHT, viewBox: `0 0 ${WIDTH} ${HEIGHT}`, title: `Carta española ${rank} de ${suit}`, body }),
  };
}

export function generateSpanishDeck(): readonly SvgAsset[] {
  const assets: SvgAsset[] = [];
  for (const suit of SPANISH_SUITS) {
    for (const rank of SPANISH_RANKS) assets.push(buildSpanishCard(suit, rank));
  }
  return assets;
}
