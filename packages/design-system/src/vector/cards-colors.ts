import { el, safeId, svgRoot, svgText } from './svg.js';
import type { SvgAsset } from './types.js';

const WIDTH = 300;
const HEIGHT = 420;
export const COLOR_CARD_COLORS = ['rojo', 'azul', 'verde', 'amarillo'] as const;
export const COLOR_CARD_SYMBOLS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'salta', 'reversa', 'roba2'] as const;
const COLORS: Readonly<Record<(typeof COLOR_CARD_COLORS)[number], readonly [string, string]>> = {
  rojo: ['#e53935', '#9c1c1c'],
  azul: ['#1e88e5', '#0d4f96'],
  verde: ['#43a047', '#22662b'],
  amarillo: ['#fdd835', '#c49b06'],
};

function symbolMark(symbol: string, paint: string): string {
  if (symbol === 'salta') {
    return (
      el('circle', { cx: 150, cy: 210, r: 62, fill: 'none', stroke: paint, 'stroke-width': 17 }) +
      el('path', { d: 'M104 164 L196 256', stroke: paint, 'stroke-width': 19, 'stroke-linecap': 'round' }) +
      el('circle', { cx: 150, cy: 210, r: 30, fill: paint, opacity: 0.15 })
    );
  }
  if (symbol === 'reversa') {
    return (
      el('path', { d: 'M96 254 L96 192 Q96 150 138 150 L196 150', fill: 'none', stroke: paint, 'stroke-width': 17, 'stroke-linecap': 'round' }) +
      el('path', { d: 'M204 254 L204 192 Q204 150 162 150 L104 150', fill: 'none', stroke: paint, 'stroke-width': 17, 'stroke-linecap': 'round', opacity: 0.5 }) +
      el('path', { d: 'M194 130 L220 150 L194 170 Z', fill: paint }) +
      el('path', { d: 'M106 274 L80 254 L106 234 Z', fill: paint, opacity: 0.5 })
    );
  }
  if (symbol === 'roba2' || symbol === 'roba4') {
    return (
      el('text', { x: 150, y: 252, 'font-size': 108, 'font-weight': 800, 'text-anchor': 'middle', 'font-family': 'Verdana, sans-serif', fill: '#000000', opacity: 0.18 }, symbol === 'roba2' ? '+2' : '+4') +
      svgText(symbol === 'roba2' ? '+2' : '+4', {
        x: 150, y: 248, 'font-size': 108, 'font-weight': 800, 'text-anchor': 'middle',
        'font-family': 'Verdana, sans-serif', fill: paint,
      })
    );
  }
  const isNumber = /^\d$/.test(symbol);
  return (
    el('text', { x: 152, y: 256, 'font-size': isNumber ? 152 : 108, 'font-weight': 800, 'text-anchor': 'middle', 'font-family': 'Verdana, sans-serif', fill: '#000000', opacity: 0.18 }, symbol) +
    svgText(symbol, {
      x: 150, y: 252, 'font-size': isNumber ? 152 : 108, 'font-weight': 800,
      'text-anchor': 'middle', 'font-family': 'Verdana, sans-serif', fill: paint,
    })
  );
}

function cornerMark(label: string, color: string): string {
  return (
    svgText(label, {
      x: 30, y: 46, 'font-size': 27, 'font-weight': 800, 'text-anchor': 'middle',
      'font-family': 'Verdana, sans-serif', fill: color,
    }) +
    el('ellipse', { cx: 30, cy: 70, rx: 13, ry: 8, fill: color, opacity: 0.9 }) +
    el('ellipse', { cx: 30, cy: 70, rx: 6, ry: 3.4, fill: '#ffffff', opacity: 0.85 })
  );
}

export function buildColorCard(
  color: (typeof COLOR_CARD_COLORS)[number],
  symbol: (typeof COLOR_CARD_SYMBOLS)[number],
): SvgAsset {
  const [paint, shade] = COLORS[color];
  const body =
    el('rect', { width: WIDTH, height: HEIGHT, rx: 26, fill: shade }) +
    el('rect', { x: 4, y: 4, width: WIDTH - 8, height: HEIGHT - 8, rx: 22, fill: paint }) +
    el('rect', { x: 13, y: 13, width: WIDTH - 26, height: HEIGHT - 26, rx: 18, fill: 'none', stroke: '#ffffff', 'stroke-width': 5, opacity: 0.92 }) +
    el('path', { d: 'M20 330 C60 400 240 406 284 320 L284 394 Q150 420 16 394 Z', fill: '#000000', opacity: 0.08 }) +
    el('ellipse', { cx: 150, cy: 212, rx: 120, ry: 152, fill: '#ffffff', stroke: '#000000', 'stroke-width': 3, opacity: 0.96 }) +
    el('ellipse', { cx: 150, cy: 212, rx: 106, ry: 138, fill: 'none', stroke: paint, 'stroke-width': 2, opacity: 0.18 }) +
    el('path', { d: 'M52 92 C92 48 208 48 248 92', fill: 'none', stroke: '#ffffff', 'stroke-width': 7, opacity: 0.28, 'stroke-linecap': 'round' }) +
    symbolMark(symbol, paint) +
    cornerMark(symbol === 'salta' ? 'S' : symbol === 'reversa' ? 'R' : symbol.toUpperCase(), '#ffffff') +
    el('g', { transform: 'translate(270 374) rotate(180)' }, cornerMark(symbol === 'salta' ? 'S' : symbol === 'reversa' ? 'R' : symbol.toUpperCase(), '#ffffff'));
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
    el('rect', { width: WIDTH, height: HEIGHT, rx: 26, fill: '#151515' }) +
    el('clipPath', { id: clipId }, el('rect', { x: 5, y: 5, width: WIDTH - 10, height: HEIGHT - 10, rx: 22 })) +
    el('g', { 'clip-path': `url(#${clipId})` }, quadrants) +
    el('rect', { x: 5, y: 5, width: WIDTH - 10, height: HEIGHT - 10, rx: 22, fill: 'none', stroke: '#ffffff', 'stroke-width': 5, opacity: 0.9 }) +
    el('ellipse', { cx: 150, cy: 210, rx: 112, ry: 138, fill: '#151515', stroke: '#ffffff', 'stroke-width': 6 }) +
    el('ellipse', { cx: 150, cy: 210, rx: 96, ry: 122, fill: 'none', stroke: '#ffffff', 'stroke-width': 2, opacity: 0.24 }) +
    svgText(kind === 'comodin' ? '★' : '+4', {
      x: 150, y: 258, 'font-size': 128, 'font-weight': 800, 'text-anchor': 'middle',
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
