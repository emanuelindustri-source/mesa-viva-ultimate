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

function halfPips(value: number, offsetX: number): string {
  const positions = PIPS[value] ?? [];
  const radius = value > 9 ? 7.4 : value > 6 ? 8.4 : 9.6;
  return positions.map(([x, y]) => {
    const cx = offsetX + x * HALF;
    const cy = y * HEIGHT;
    return (
      el('circle', { cx: cx + 1, cy: cy + 2, r: radius, fill: '#c9b691', opacity: 0.55 }) +
      el('circle', { cx, cy, r: radius, fill: '#3a2b1a' }) +
      el('circle', { cx: cx - radius * 0.28, cy: cy - radius * 0.3, r: radius * 0.3, fill: '#fffdf5', opacity: 0.5 })
    );
  }).join('');
}

export function buildDominoTile(a: number, b: number): SvgAsset {
  const id = safeId('ficha-domino', String(a), String(b));
  const body =
    el('rect', { x: 4, y: 7, width: WIDTH - 8, height: HEIGHT - 8, rx: 20, fill: '#8d7350', opacity: 0.55 }) +
    el('rect', { width: WIDTH, height: HEIGHT, rx: 20, fill: '#e2d3b0' }) +
    el('rect', { x: 3, y: 3, width: WIDTH - 6, height: HEIGHT - 6, rx: 17, fill: '#fffdf3' }) +
    el('path', { d: 'M8 12 H292 V26 H8 Z', fill: '#ffffff', opacity: 0.8 }) +
    el('rect', { x: 10, y: 10, width: WIDTH - 20, height: HEIGHT - 20, rx: 13, fill: 'none', stroke: '#d9c9a4', 'stroke-width': 2 }) +
    el('rect', { x: 14, y: 14, width: WIDTH - 28, height: HEIGHT - 28, rx: 10, fill: 'none', stroke: '#a89066', 'stroke-width': 1, opacity: 0.7 }) +
    halfPips(a, 0) +
    halfPips(b, HALF) +
    el('rect', { x: HALF - 2, y: 16, width: 4, height: HEIGHT - 32, rx: 2, fill: '#8d7350' }) +
    el('circle', { cx: HALF, cy: 16, r: 3.4, fill: '#b99a66' }) +
    el('circle', { cx: HALF, cy: HEIGHT - 16, r: 3.4, fill: '#b99a66' });
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
