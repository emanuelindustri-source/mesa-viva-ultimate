import { el, safeId, svgRoot } from './svg.js';
import type { SvgAsset } from './types.js';

const WIDTH = 300;
const HEIGHT = 150;
const HALF = 150;
const PIPS: Readonly<Record<number, readonly (readonly [number, number])[]>> = {
  0: [],
  1: [[0.5, 0.5]],
  2: [[0.5, 0.25], [0.5, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.28, 0.26], [0.72, 0.26], [0.28, 0.74], [0.72, 0.74]],
  5: [[0.28, 0.24], [0.72, 0.24], [0.5, 0.5], [0.28, 0.76], [0.72, 0.76]],
  6: [[0.3, 0.2], [0.7, 0.2], [0.3, 0.5], [0.7, 0.5], [0.3, 0.8], [0.7, 0.8]],
  7: [[0.3, 0.18], [0.7, 0.18], [0.3, 0.45], [0.7, 0.45], [0.5, 0.5], [0.3, 0.82], [0.7, 0.82]],
  8: [[0.3, 0.15], [0.7, 0.15], [0.3, 0.38], [0.7, 0.38], [0.3, 0.62], [0.7, 0.62], [0.3, 0.85], [0.7, 0.85]],
  9: [[0.25, 0.2], [0.5, 0.2], [0.75, 0.2], [0.25, 0.5], [0.5, 0.5], [0.75, 0.5], [0.25, 0.8], [0.5, 0.8], [0.75, 0.8]],
  10: [[0.3, 0.12], [0.7, 0.12], [0.3, 0.31], [0.7, 0.31], [0.3, 0.5], [0.7, 0.5], [0.3, 0.69], [0.7, 0.69], [0.3, 0.88], [0.7, 0.88]],
  11: [[0.25, 0.12], [0.5, 0.12], [0.75, 0.12], [0.25, 0.36], [0.5, 0.36], [0.75, 0.36], [0.25, 0.6], [0.5, 0.6], [0.75, 0.6], [0.25, 0.84], [0.75, 0.84]],
  12: [[0.25, 0.12], [0.5, 0.12], [0.75, 0.12], [0.25, 0.36], [0.5, 0.36], [0.75, 0.36], [0.25, 0.6], [0.5, 0.6], [0.75, 0.6], [0.25, 0.84], [0.5, 0.84], [0.75, 0.84]],
};

function halfPips(value: number, offsetX: number, color: string): string {
  const positions = PIPS[value] ?? [];
  return positions
    .map(([x, y]) => el('circle', { cx: offsetX + x * HALF, cy: y * HEIGHT, r: value > 9 ? 8 : 10, fill: color }))
    .join('');
}

export function buildDominoTile(a: number, b: number): SvgAsset {
  const id = safeId('ficha-domino', String(a), String(b));
  const body =
    el('rect', { x: 0, y: 0, width: WIDTH, height: HEIGHT, rx: 18, fill: '#fff8e7', stroke: '#3e2723', 'stroke-width': 6 }) +
    el('rect', { x: 8, y: 8, width: WIDTH - 16, height: HEIGHT - 16, rx: 12, fill: 'none', stroke: '#d7ccc8', 'stroke-width': 2 }) +
    halfPips(a, 0, '#3e2723') +
    halfPips(b, HALF, '#3e2723') +
    el('line', { x1: HALF, y1: 14, x2: HALF, y2: HEIGHT - 14, stroke: '#3e2723', 'stroke-width': 4, 'stroke-linecap': 'round' });
  return {
    id,
    kind: 'ficha-domino',
    width: WIDTH,
    height: HEIGHT,
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    markup: svgRoot({ id, width: WIDTH, height: HEIGHT, viewBox: `0 0 ${WIDTH} ${HEIGHT}`, title: `Ficha de dominó ${a}-${b}`, body }),
  };
}

export function generateDominoSet(maxPip = 6): readonly SvgAsset[] {
  if (!Number.isInteger(maxPip) || maxPip < 0 || maxPip > 12) {
    throw new Error('El dominó admite entre 0 y 12 puntos por lado');
  }
  const assets: SvgAsset[] = [];
  for (let a = 0; a <= maxPip; a += 1) {
    for (let b = a; b <= maxPip; b += 1) assets.push(buildDominoTile(a, b));
  }
  return assets;
}
