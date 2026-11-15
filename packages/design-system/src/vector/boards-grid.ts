import { buildBoardAsset } from './board-utils.js';
import { el, svgText } from './svg.js';
import type { SvgAsset } from './types.js';

const FILES = 'abcdefgh';

function bevel(x: number, y: number, size: number, fill: string, light: string, dark: string, radius = 0): string {
  return (
    el('rect', { x, y: y + size * 0.04, width: size, height: size, rx: radius, fill: dark, opacity: 0.35 }) +
    el('rect', { x, y, width: size, height: size, rx: radius, fill }) +
    el('path', { d: `M${x + radius} ${y} H${x + size - radius}`, stroke: light, 'stroke-width': 2, opacity: 0.55 }) +
    el('path', { d: `M${x} ${y + radius} V${y + size - radius}`, stroke: light, 'stroke-width': 2, opacity: 0.4 }) +
    el('path', { d: `M${x + radius} ${y + size} H${x + size - radius}`, stroke: dark, 'stroke-width': 2, opacity: 0.4 })
  );
}

export function generateChessBoard(): SvgAsset {
  const size = 900;
  const frame = 58;
  const cell = (size - frame * 2) / 8;
  let body =
    el('rect', { width: size, height: size, rx: 26, fill: '#2a170b' }) +
    el('rect', { x: 12, y: 12, width: size - 24, height: size - 24, rx: 20, fill: '#6b3f22' }) +
    el('rect', { x: 12, y: 12, width: size - 24, height: size - 24, rx: 20, fill: 'none', stroke: '#e9c06a', 'stroke-width': 3, opacity: 0.75 }) +
    el('rect', { x: frame - 8, y: frame - 8, width: size - (frame - 8) * 2, height: size - (frame - 8) * 2, rx: 8, fill: '#24160c' });
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const x = frame + column * cell;
      const y = frame + row * cell;
      const light = (row + column) % 2 === 0;
      body += bevel(x, y, cell, light ? '#f4dfb6' : '#8a5a34', light ? '#fff6de' : '#b9804e', light ? '#d3ad74' : '#5a3418');
    }
  }
  for (let index = 0; index < 8; index += 1) {
    body += svgText(FILES[index] ?? '', {
      x: frame + index * cell + cell / 2, y: size - 20, 'font-size': 18, 'font-weight': 700,
      'text-anchor': 'middle', 'font-family': 'Georgia, serif', fill: '#f2dba9',
    });
    body += svgText(String(8 - index), {
      x: 30, y: frame + index * cell + cell / 2 + 6, 'font-size': 18, 'font-weight': 700,
      'text-anchor': 'middle', 'font-family': 'Georgia, serif', fill: '#f2dba9',
    });
  }
  return buildBoardAsset('tablero-ajedrez', 'Tablero de ajedrez 8x8', size, size, body);
}

export function generateCheckersBoard(): SvgAsset {
  const size = 860;
  const frame = 60;
  const cell = (size - frame * 2) / 8;
  let body =
    el('rect', { width: size, height: size, rx: 24, fill: '#102027' }) +
    el('rect', { x: 12, y: 12, width: size - 24, height: size - 24, rx: 20, fill: '#263238' }) +
    el('rect', { x: 12, y: 12, width: size - 24, height: size - 24, rx: 20, fill: 'none', stroke: '#80cbc4', 'stroke-width': 2, opacity: 0.5 });
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const x = frame + column * cell;
      const y = frame + row * cell;
      const light = (row + column) % 2 === 0;
      body += bevel(x, y, cell, light ? '#eceff1' : '#546e7a', light ? '#ffffff' : '#78909c', light ? '#b0bec5' : '#37474f');
    }
  }
  return buildBoardAsset('tablero-damas', 'Tablero de damas 8x8', size, size, body);
}

export function generateGoBoard(): SvgAsset {
  const size = 900;
  const margin = 66;
  const spacing = (size - margin * 2) / 18;
  let body =
    el('rect', { width: size, height: size, rx: 20, fill: '#4e342e' }) +
    el('rect', { x: 18, y: 18, width: size - 36, height: size - 36, rx: 14, fill: '#e8c88a' }) +
    el('rect', { x: 18, y: 18, width: size - 36, height: size - 36, rx: 14, fill: 'none', stroke: '#8d6e63', 'stroke-width': 5 });
  for (let index = 0; index < 19; index += 1) {
    const position = margin + index * spacing;
    body += el('line', { x1: margin, y1: position, x2: size - margin, y2: position, stroke: '#4e342e', 'stroke-width': 2 });
    body += el('line', { x1: position, y1: margin, x2: position, y2: size - margin, stroke: '#4e342e', 'stroke-width': 2 });
  }
  for (const x of [3, 9, 15]) {
    for (const y of [3, 9, 15]) {
      body += el('circle', { cx: margin + x * spacing, cy: margin + y * spacing, r: 6, fill: '#3e2723' });
    }
  }
  return buildBoardAsset('tablero-go', 'Tablero de Go 19x19', size, size, body);
}

const SNAKES = [[97, 78], [89, 55], [74, 38], [54, 31], [42, 20], [28, 9]] as const;
const LADDERS = [[4, 25], [13, 46], [21, 42], [33, 58], [50, 69], [62, 81], [73, 92]] as const;

function cellCenter(value: number, cell: number): { x: number; y: number } {
  const index = value - 1;
  const row = 9 - Math.floor(index / 10);
  const column = Math.floor(index / 10) % 2 === 0 ? index % 10 : 9 - (index % 10);
  return { x: column * cell + cell / 2, y: row * cell + cell / 2 };
}

export function generateSnakesBoard(): SvgAsset {
  const size = 900;
  const cell = size / 10;
  let body = el('rect', { width: size, height: size, rx: 20, fill: '#0b2f24' });
  for (let row = 0; row < 10; row += 1) {
    for (let column = 0; column < 10; column += 1) {
      const ascending = row % 2 === 0;
      const boardColumn = ascending ? column : 9 - column;
      const number = row * 10 + boardColumn + 1;
      const light = (row + column) % 2 === 0;
      const x = column * cell;
      const y = (9 - row) * cell;
      body += bevel(x + 3, y + 3, cell - 6, light ? '#43a047' : '#2e7d32', '#8ee06a', '#1b5e20', 10);
      body += svgText(String(number), {
        x: x + 16, y: y + 32, 'font-size': 22, 'font-weight': 800,
        'font-family': 'Verdana, sans-serif', fill: '#f2ffe9', opacity: 0.92,
      });
    }
  }
  for (const [from, to] of LADDERS) {
    const a = cellCenter(from, cell);
    const b = cellCenter(to, cell);
    const offset = cell * 0.18;
    body += el('line', { x1: a.x - offset, y1: a.y, x2: b.x - offset, y2: b.y, stroke: '#ffb74d', 'stroke-width': 8, 'stroke-linecap': 'round' });
    body += el('line', { x1: a.x + offset, y1: a.y, x2: b.x + offset, y2: b.y, stroke: '#ff8f00', 'stroke-width': 8, 'stroke-linecap': 'round' });
    const rungs = 8;
    for (let index = 1; index < rungs; index += 1) {
      const t = index / rungs;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      body += el('line', { x1: x - offset, y1: y, x2: x + offset, y2: y, stroke: '#ffe0a3', 'stroke-width': 5, 'stroke-linecap': 'round' });
    }
  }
  for (const [head, tail] of SNAKES) {
    const a = cellCenter(head, cell);
    const b = cellCenter(tail, cell);
    const mx = (a.x + b.x) / 2 + cell * 1.2;
    const my = (a.y + b.y) / 2;
    body += el('path', {
      d: `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`,
      fill: 'none', stroke: '#a5d6a7', 'stroke-width': 16, 'stroke-linecap': 'round', opacity: 0.9,
    });
    body += el('path', {
      d: `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`,
      fill: 'none', stroke: '#2e7d32', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-dasharray': '10 14',
    });
    body += el('circle', { cx: a.x, cy: a.y, r: 14, fill: '#66bb6a', stroke: '#1b5e20', 'stroke-width': 3 });
    body += el('circle', { cx: a.x - 4, cy: a.y - 4, r: 3, fill: '#fffde7' });
    body += el('circle', { cx: a.x + 4, cy: a.y - 4, r: 3, fill: '#fffde7' });
  }
  body += el('path', { d: 'M0 0 Q120 40 40 140 Q0 180 0 0 Z', fill: '#1b5e20', opacity: 0.5 });
  body += el('path', { d: `M${size} ${size} Q${size - 140} ${size - 30} ${size - 30} ${size - 150} Q${size} ${size - 70} ${size} ${size} Z`, fill: '#1b5e20', opacity: 0.5 });
  return buildBoardAsset('tablero-serpientes-escaleras', 'Tablero de serpientes y escaleras 10x10', size, size, body);
}
