import { generateCheckersBoard, generateChessBoard, generateGoBoard, generateSnakesBoard } from './boards-grid.js';
import { generateBackgammonBoard, generateLudoBoard, generateMancalaBoard } from './boards-special.js';
import type { SvgAsset } from './types.js';

/** Siete tableros base sin imágenes externas. */
export function generateBoards(): readonly SvgAsset[] {
  return [
    generateChessBoard(),
    generateCheckersBoard(),
    generateGoBoard(),
    generateSnakesBoard(),
    generateBackgammonBoard(),
    generateMancalaBoard(),
    generateLudoBoard(),
  ];
}
