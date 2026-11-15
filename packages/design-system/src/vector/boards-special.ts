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
    const color = LUDO_COLORS[corner] ?? '#ffffff';
    return el('rect', { x, y, width: cell, height: cell, fill: color }) +
      el('rect', { x: x + 3, y: y + 3, width: cell - 6, height: cell - 6, rx: 6, fill: color, stroke: '#ffffff', 'stroke-width': 1.2, opacity: 0.24 });
  }
  const inCross = (row >= 6 && row <= 8) || (column >= 6 && column <= 8);
  if (!inCross) return el('rect', { x, y, width: cell, height: cell, fill: '#eceff1' });
  const center = row >= 6 && row <= 8 && column >= 6 && column <= 8;
  const path = (row + column) % 2 === 0 ? '#ffffff' : '#f3f4f4';
  return el('rect', { x: x + 1, y: y + 1, width: cell - 2, height: cell - 2, rx: 3, fill: center ? '#ffffff' : path, stroke: '#90a4ae', 'stroke-width': 1.4 }) +
    el('path', { d: `M${x + 3} ${y + 4} H${x + cell - 4}`, stroke: '#ffffff', 'stroke-width': 2, opacity: 0.8 }) +
    el('path', { d: `M${x + 3} ${y + cell - 4} H${x + cell - 4}`, stroke: '#607d8b', 'stroke-width': 1, opacity: 0.35 });
}

export function generateLudoBoard(): SvgAsset {
  const size = 860;
  const frame = 22;
  const cell = (size - frame * 2) / 15;
  let body =
    el('rect', { width: size, height: size, rx: 28, fill: '#24160c' }) +
    el('rect', { x: 8, y: 8, width: size - 16, height: size - 16, rx: 24, fill: '#6b3f22' }) +
    el('rect', { x: 8, y: 8, width: size - 16, height: size - 16, rx: 24, fill: 'none', stroke: '#e9c06a', 'stroke-width': 3, opacity: 0.8 }) +
    el('rect', { x: frame, y: frame, width: size - frame * 2, height: size - frame * 2, rx: 10, fill: '#ffffff' });
  for (let row = 0; row < 15; row += 1) {
    for (let column = 0; column < 15; column += 1) body += ludoCell(row, column, cell);
  }
  const origin = frame;
  for (const [index, name] of LUDO_NAMES.entries()) {
    const column = index % 2 === 0 ? 1 : 10;
    const row = index < 2 ? 1 : 10;
    const color = LUDO_COLORS[index] ?? '#ffffff';
    body += el('rect', { x: origin + column * cell, y: origin + row * cell, width: 4 * cell, height: 4 * cell, rx: 12, fill: '#ffffff', stroke: '#263238', 'stroke-width': 3 });
    body += el('rect', { x: origin + column * cell + 6, y: origin + row * cell + 6, width: 4 * cell - 12, height: 4 * cell - 12, rx: 9, fill: color, opacity: 0.18 });
    for (const [dx, dy] of [[0.9, 0.9], [2.9, 0.9], [0.9, 2.9], [2.9, 2.9]] as const) {
      body += el('circle', { cx: origin + (column + dx) * cell, cy: origin + (row + dy) * cell, r: cell * 0.28, fill: color, stroke: '#ffffff', 'stroke-width': 2 });
    }
    body += svgText(name.slice(0, 1).toUpperCase(), {
      x: origin + (column + 2) * cell, y: origin + (row + 2.25) * cell, 'font-size': 22, 'font-weight': 900,
      'text-anchor': 'middle', 'font-family': 'Verdana, sans-serif', fill: '#263238', opacity: 0.55,
    });
  }
  const centerX = origin + 7.5 * cell;
  const centerY = origin + 7.5 * cell;
  const radius = cell * 1.5;
  body += el('path', { d: `M${centerX} ${centerY - radius} L${centerX + radius} ${centerY} L${centerX} ${centerY + radius} L${centerX - radius} ${centerY} Z`, fill: '#ffffff', stroke: '#263238', 'stroke-width': 3 });
  for (let index = 0; index < 4; index += 1) {
    const angle = (index * Math.PI) / 2;
    const x1 = centerX + Math.cos(angle) * radius * 0.9;
    const y1 = centerY + Math.sin(angle) * radius * 0.9;
    const x2 = centerX + Math.cos(angle + Math.PI / 2) * radius * 0.9;
    const y2 = centerY + Math.sin(angle + Math.PI / 2) * radius * 0.9;
    body += el('path', { d: `M${centerX} ${centerY} L${x1} ${y1} L${x2} ${y2} Z`, fill: LUDO_COLORS[index] ?? '#ffffff', opacity: 0.85 });
  }
  body += el('circle', { cx: centerX, cy: centerY, r: radius * 0.22, fill: '#ffd54f', stroke: '#e65100', 'stroke-width': 2 });
  return buildBoardAsset('tablero-ludo', 'Tablero de ludo', size, size, body);
}
