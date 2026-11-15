import { buildBoardAsset } from './board-utils.js';
import { el, svgText } from './svg.js';
import type { SvgAsset } from './types.js';

const LIGHT = '#f0d9b5';
const DARK = '#b58863';
const FRAME = '#4e342e';

function checkerGrid(size: number, cell: number, light: string, dark: string): string {
  let body = el('rect', { x: 0, y: 0, width: size, height: size, fill: light });
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      if ((row + column) % 2 === 1) {
        body += el('rect', { x: column * cell, y: row * cell, width: cell, height: cell, fill: dark });
      }
    }
  }
  return body;
}

export function generateChessBoard(): SvgAsset {
  const size = 800;
  const cell = (size - 80) / 8;
  const body =
    el('rect', { x: 0, y: 0, width: size, height: size, fill: FRAME }) +
    el('g', { transform: 'translate(40 40)' }, checkerGrid(size - 80, cell, LIGHT, DARK)) +
    el('rect', { x: 40, y: 40, width: size - 80, height: size - 80, fill: 'none', stroke: '#2b1d17', 'stroke-width': 4 });
  return buildBoardAsset('tablero-ajedrez', 'Tablero de ajedrez 8x8', size, size, body);
}

export function generateCheckersBoard(): SvgAsset {
  const size = 800;
  const cell = (size - 80) / 8;
  const body =
    el('rect', { x: 0, y: 0, width: size, height: size, fill: '#263238' }) +
    el('g', { transform: 'translate(40 40)' }, checkerGrid(size - 80, cell, '#eceff1', '#546e7a')) +
    el('rect', { x: 40, y: 40, width: size - 80, height: size - 80, fill: 'none', stroke: '#102027', 'stroke-width': 6 });
  return buildBoardAsset('tablero-damas', 'Tablero de damas 8x8', size, size, body);
}

export function generateGoBoard(): SvgAsset {
  const size = 900;
  const margin = 60;
  const spacing = (size - margin * 2) / 18;
  let body = el('rect', { x: 0, y: 0, width: size, height: size, fill: '#e8c88a', stroke: '#8d6e63', 'stroke-width': 8 });
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

export function generateSnakesBoard(): SvgAsset {
  const size = 800;
  const cell = size / 10;
  const palette = ['#e3f2fd', '#bbdefb'];
  let body = el('rect', { x: 0, y: 0, width: size, height: size, fill: '#ffffff' });
  for (let row = 0; row < 10; row += 1) {
    const ascending = row % 2 === 0;
    for (let column = 0; column < 10; column += 1) {
      const boardColumn = ascending ? column : 9 - column;
      const number = row * 10 + boardColumn + 1;
      const fill = palette[(row + column) % 2] ?? palette[0];
      const x = column * cell;
      const y = (9 - row) * cell;
      body += el('rect', { x, y, width: cell, height: cell, fill, stroke: '#90caf9', 'stroke-width': 2 });
      body += svgText(String(number), {
        x: x + 8, y: y + 24, 'font-size': 18, 'font-weight': 700,
        'font-family': 'Verdana, sans-serif', fill: '#1565c0',
      });
    }
  }
  return buildBoardAsset('tablero-serpientes-escaleras', 'Tablero de serpientes y escaleras 10x10', size, size, body);
}
