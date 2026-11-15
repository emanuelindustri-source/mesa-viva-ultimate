import { buildBoardAsset } from './board-utils.js';
import { el, svgText } from './svg.js';
import type { SvgAsset } from './types.js';

export function generateBackgammonBoard(): SvgAsset {
  const width = 1000;
  const height = 600;
  const bar = 40;
  const innerLeft = 40;
  const innerRight = width - 40;
  const pointWidth = (innerRight - innerLeft - bar) / 12;
  let body =
    el('rect', { x: 0, y: 0, width, height, fill: '#4e342e' }) +
    el('rect', { x: 30, y: 30, width: width - 60, height: height - 60, rx: 18, fill: '#d7ccc8' }) +
    el('rect', { x: width / 2 - bar / 2, y: 30, width: bar, height: height - 60, fill: '#6d4c41' });
  for (let index = 0; index < 12; index += 1) {
    const x = innerLeft + index * pointWidth + (index >= 6 ? bar : 0);
    const color = index % 2 === 0 ? '#8d6e63' : '#efebe9';
    body += el('path', { d: `M${x} 40 L${x + pointWidth} 40 L${x + pointWidth / 2} 230 Z`, fill: color });
    body += el('path', { d: `M${x} 560 L${x + pointWidth} 560 L${x + pointWidth / 2} 370 Z`, fill: color });
  }
  return buildBoardAsset('tablero-backgammon', 'Tablero de backgammon', width, height, body);
}

export function generateMancalaBoard(): SvgAsset {
  const width = 1000;
  const height = 400;
  let body =
    el('rect', { x: 0, y: 0, width, height, rx: 36, fill: '#5d4037' }) +
    el('rect', { x: 30, y: 30, width: width - 60, height: height - 60, rx: 26, fill: '#d7ccc8' });
  body += el('ellipse', { cx: 120, cy: 200, rx: 62, ry: 120, fill: '#8d6e63', stroke: '#4e342e', 'stroke-width': 6 });
  body += el('ellipse', { cx: 880, cy: 200, rx: 62, ry: 120, fill: '#8d6e63', stroke: '#4e342e', 'stroke-width': 6 });
  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      const cx = 240 + column * 100;
      const cy = row === 0 ? 130 : 270;
      body += el('circle', { cx, cy, r: 38, fill: '#8d6e63', stroke: '#4e342e', 'stroke-width': 5 });
    }
  }
  return buildBoardAsset('tablero-mancala', 'Tablero de mancala', width, height, body);
}

const LUDO_COLORS = ['#e53935', '#43a047', '#fdd835', '#1e88e5'];
const LUDO_NAMES = ['rojo', 'verde', 'amarillo', 'azul'];

function ludoCell(row: number, column: number, cell: number): string {
  const x = column * cell;
  const y = row * cell;
  const corner = (row < 6 && column < 6 ? 0 : row < 6 && column > 8 ? 1 : row > 8 && column < 6 ? 2 : row > 8 && column > 8 ? 3 : -1);
  if (corner >= 0) {
    return el('rect', { x, y, width: cell, height: cell, fill: LUDO_COLORS[corner] ?? '#ffffff' });
  }
  const inCross = (row >= 6 && row <= 8) || (column >= 6 && column <= 8);
  if (!inCross) return el('rect', { x, y, width: cell, height: cell, fill: '#eceff1' });
  const center = row >= 6 && row <= 8 && column >= 6 && column <= 8;
  return el('rect', {
    x, y, width: cell, height: cell,
    fill: center ? '#ffffff' : (row + column) % 2 === 0 ? '#ffffff' : '#fafafa',
    stroke: '#37474f', 'stroke-width': 1.5,
  });
}

export function generateLudoBoard(): SvgAsset {
  const size = 800;
  const cell = size / 15;
  let body = el('rect', { x: 0, y: 0, width: size, height: size, fill: '#ffffff', stroke: '#263238', 'stroke-width': 8 });
  for (let row = 0; row < 15; row += 1) {
    for (let column = 0; column < 15; column += 1) body += ludoCell(row, column, cell);
  }
  for (const [index, name] of LUDO_NAMES.entries()) {
    const column = index % 2 === 0 ? 1 : 11;
    const row = index < 2 ? 1 : 11;
    body += el('rect', { x: column * cell, y: row * cell, width: 4 * cell, height: 4 * cell, fill: '#ffffff', stroke: '#263238', 'stroke-width': 3 });
    body += svgText(name.slice(0, 1).toUpperCase(), {
      x: (column + 2) * cell, y: (row + 2.4) * cell, 'font-size': 40, 'font-weight': 800,
      'text-anchor': 'middle', 'font-family': 'Verdana, sans-serif', fill: LUDO_COLORS[index] ?? '#000000',
    });
  }
  body += el('path', { d: 'M400 340 L460 400 L400 460 L340 400 Z', fill: '#ffb300', stroke: '#e65100', 'stroke-width': 3 });
  return buildBoardAsset('tablero-ludo', 'Tablero de ludo', size, size, body);
}
