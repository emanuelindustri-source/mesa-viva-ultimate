import { el, safeId, svgRoot, svgText } from './svg.js';
import type { SvgAsset } from './types.js';

const WIDTH = 300;
const HEIGHT = 420;
export const COLOR_CARD_COLORS = ['rojo', 'azul', 'verde', 'amarillo'] as const;
export const COLOR_CARD_SYMBOLS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'salta', 'reversa', 'roba2'] as const;
const COLORS: Readonly<Record<(typeof COLOR_CARD_COLORS)[number], string>> = {
  rojo: '#e53935',
  azul: '#1e88e5',
  verde: '#43a047',
  amarillo: '#fdd835',
};

function centerSymbol(symbol: string, color: string): string {
  if (symbol === 'salta') {
    return (
      el('circle', { cx: 150, cy: 210, r: 62, fill: 'none', stroke: color, 'stroke-width': 16 }) +
      el('path', { d: 'M104 164 L196 256', stroke: color, 'stroke-width': 18, 'stroke-linecap': 'round' })
    );
  }
  if (symbol === 'reversa') {
    return (
      el('path', { d: 'M96 250 L96 190 Q96 150 136 150 L196 150', fill: 'none', stroke: color, 'stroke-width': 16, 'stroke-linecap': 'round' }) +
      el('path', { d: 'M204 250 L204 190 Q204 150 164 150 L104 150', fill: 'none', stroke: color, 'stroke-width': 16, 'stroke-linecap': 'round', opacity: 0.55 }) +
      el('path', { d: 'M194 132 L218 150 L194 168 Z', fill: color })
    );
  }
  if (symbol === 'roba2' || symbol === 'roba4') {
    return svgText(symbol === 'roba2' ? '+2' : '+4', {
      x: 150, y: 248, 'font-size': 104, 'font-weight': 800, 'text-anchor': 'middle',
      'font-family': 'Verdana, sans-serif', fill: color,
    });
  }
  return svgText(symbol, {
    x: 150, y: 252, 'font-size': symbol.length > 1 ? 110 : 150, 'font-weight': 800,
    'text-anchor': 'middle', 'font-family': 'Verdana, sans-serif', fill: color,
  });
}

function cornerMark(label: string, color: string): string {
  return (
    svgText(label, {
      x: 30, y: 46, 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle',
      'font-family': 'Verdana, sans-serif', fill: color,
    }) +
    el('circle', { cx: 30, cy: 68, r: 12, fill: color, opacity: 0.85 })
  );
}

export function buildColorCard(
  color: (typeof COLOR_CARD_COLORS)[number],
  symbol: (typeof COLOR_CARD_SYMBOLS)[number],
): SvgAsset {
  const paint = COLORS[color];
  const body =
    el('rect', { x: 0, y: 0, width: WIDTH, height: HEIGHT, rx: 24, fill: paint }) +
    el('rect', { x: 14, y: 14, width: WIDTH - 28, height: HEIGHT - 28, rx: 18, fill: 'none', stroke: '#ffffff', 'stroke-width': 5, opacity: 0.9 }) +
    el('ellipse', { cx: 150, cy: 210, rx: 118, ry: 150, fill: '#ffffff' }) +
    centerSymbol(symbol, paint) +
    cornerMark(symbol === 'salta' ? 'S' : symbol === 'reversa' ? 'R' : symbol.toUpperCase(), '#ffffff');
  const id = safeId('carta-color', color, symbol);
  return {
    id,
    kind: 'carta-color',
    width: WIDTH,
    height: HEIGHT,
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    markup: svgRoot({ id, width: WIDTH, height: HEIGHT, viewBox: `0 0 ${WIDTH} ${HEIGHT}`, title: `Carta de color ${color} ${symbol}`, body }),
  };
}

export function buildWildCard(kind: 'comodin' | 'roba4'): SvgAsset {
  const clipId = safeId('mv-wild-clip', kind);
  const quadrants = ['#e53935', '#1e88e5', '#43a047', '#fdd835']
    .map((fill, index) => {
      const x = index % 2 === 0 ? 0 : 150;
      const y = index < 2 ? 0 : 210;
      return el('rect', { x, y, width: 150, height: 210, fill });
    })
    .join('');
  const body =
    el('rect', { x: 0, y: 0, width: WIDTH, height: HEIGHT, rx: 24, fill: '#212121' }) +
    el('clipPath', { id: clipId }, el('rect', { width: WIDTH, height: HEIGHT, rx: 24 })) +
    el('g', { 'clip-path': `url(#${clipId})` }, quadrants) +
    el('ellipse', { cx: 150, cy: 210, rx: 112, ry: 138, fill: '#212121', stroke: '#ffffff', 'stroke-width': 6 }) +
    svgText(kind === 'comodin' ? '★' : '+4', {
      x: 150, y: 252, 'font-size': 120, 'font-weight': 800, 'text-anchor': 'middle',
      'font-family': 'Verdana, sans-serif', fill: '#ffffff',
    });
  const id = safeId('carta-color', 'negro', kind);
  return {
    id,
    kind: 'carta-color',
    width: WIDTH,
    height: HEIGHT,
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    markup: svgRoot({ id, width: WIDTH, height: HEIGHT, viewBox: `0 0 ${WIDTH} ${HEIGHT}`, title: `Carta comodín ${kind}`, body }),
  };
}

export function generateColorCards(): readonly SvgAsset[] {
  const assets: SvgAsset[] = [];
  for (const color of COLOR_CARD_COLORS) {
    for (const symbol of COLOR_CARD_SYMBOLS) assets.push(buildColorCard(color, symbol));
  }
  assets.push(buildWildCard('comodin'), buildWildCard('roba4'));
  return assets;
}
