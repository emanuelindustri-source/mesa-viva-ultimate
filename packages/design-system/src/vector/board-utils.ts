import { svgRoot } from './svg.js';
import type { SvgAsset } from './types.js';

export function buildBoardAsset(
  id: string,
  title: string,
  width: number,
  height: number,
  body: string,
): SvgAsset {
  return {
    id,
    kind: 'tablero',
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    markup: svgRoot({ id, width, height, viewBox: `0 0 ${width} ${height}`, title, body }),
  };
}
