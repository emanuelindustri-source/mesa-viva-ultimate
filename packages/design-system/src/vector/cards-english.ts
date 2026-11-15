import {
  ENGLISH_RANKS,
  ENGLISH_SUITS,
  type EnglishRank,
  type EnglishSuit,
  englishSuitGlyph,
  pipPositions,
} from './glyphs.js';
import { el, safeId, svgRoot, svgText } from './svg.js';
import type { CardPalette, SvgAsset } from './types.js';

const WIDTH = 300;
const HEIGHT = 420;
const RED_SUITS = new Set<EnglishSuit>(['hearts', 'diamonds']);
const COURT = new Set<EnglishRank>(['J', 'Q', 'K']);

export const ENGLISH_CARD_PALETTE: CardPalette = {
  paper: '#ffffff',
  ink: '#212121',
  border: '#37474f',
  accent: '#b0bec5',
};

function colorFor(suit: EnglishSuit): string {
  return RED_SUITS.has(suit) ? '#c62828' : '#212121';
}

function corner(rank: EnglishRank, glyph: string, color: string): string {
  return (
    svgText(rank, {
      x: 28, y: 48, 'font-size': 30, 'font-weight': 700, 'text-anchor': 'middle',
      'font-family': 'Georgia, serif', fill: color,
    }) +
    el('g', { transform: 'translate(28 82) scale(0.5)' }, glyph)
  );
}

function face(rank: EnglishRank, glyph: string, color: string): string {
  if (rank === 'A') return el('g', { transform: 'translate(150 215) scale(2.4)' }, glyph);
  if (COURT.has(rank)) {
    return (
      el('g', { transform: 'translate(150 195) scale(2.1)' }, glyph) +
      svgText(rank, {
        x: 150, y: 335, 'font-size': 66, 'font-weight': 700, 'text-anchor': 'middle',
        'font-family': 'Georgia, serif', fill: color, opacity: 0.9,
      })
    );
  }
  const count = Number.parseInt(rank, 10);
  return pipPositions(count)
    .map(([x, y]) => el('g', { transform: `translate(${x * WIDTH} ${y * HEIGHT}) scale(0.85)` }, glyph))
    .join('');
}

export function buildEnglishCard(suit: EnglishSuit, rank: EnglishRank): SvgAsset {
  const color = colorFor(suit);
  const glyph = englishSuitGlyph(suit, color);
  const body =
    el('rect', { x: 0, y: 0, width: WIDTH, height: HEIGHT, rx: 20, fill: ENGLISH_CARD_PALETTE.paper, stroke: ENGLISH_CARD_PALETTE.border, 'stroke-width': 6 }) +
    el('rect', { x: 12, y: 12, width: WIDTH - 24, height: HEIGHT - 24, rx: 14, fill: 'none', stroke: ENGLISH_CARD_PALETTE.accent, 'stroke-width': 1.5 }) +
    corner(rank, glyph, color) +
    face(rank, glyph, color) +
    el('g', { transform: 'translate(272 372) rotate(180)' }, corner(rank, glyph, color));
  const id = safeId('carta-inglesa', suit, rank);
  return {
    id,
    kind: 'carta-inglesa',
    width: WIDTH,
    height: HEIGHT,
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    markup: svgRoot({ id, width: WIDTH, height: HEIGHT, viewBox: `0 0 ${WIDTH} ${HEIGHT}`, title: `Carta inglesa ${rank} de ${suit}`, body }),
  };
}

export function generateEnglishDeck(): readonly SvgAsset[] {
  const assets: SvgAsset[] = [];
  for (const suit of ENGLISH_SUITS) {
    for (const rank of ENGLISH_RANKS) assets.push(buildEnglishCard(suit, rank));
  }
  return assets;
}
