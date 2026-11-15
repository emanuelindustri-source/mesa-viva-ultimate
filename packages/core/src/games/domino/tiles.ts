import type { DominoTile } from './types.js';

/** Ficha doble-seis: 28 fichas únicas con a <= b. */
export function createDominoSet(maxPip = 6): DominoTile[] {
  const tiles: DominoTile[] = [];
  for (let a = 0; a <= maxPip; a += 1) {
    for (let b = a; b <= maxPip; b += 1) {
      tiles.push({ id: `${a}-${b}`, a, b });
    }
  }
  return tiles;
}

export function tilePips(tile: DominoTile): number {
  return tile.a + tile.b;
}

export function canPlayOn(tile: DominoTile, end: number | null): boolean {
  if (end === null) return true;
  return tile.a === end || tile.b === end;
}

export function isDouble(tile: DominoTile): boolean {
  return tile.a === tile.b;
}

/** Devuelve el extremo expuesto al colocar la ficha en el lado indicado. */
export function exposedEnd(tile: DominoTile, end: number): number {
  return tile.a === end ? tile.b : tile.a;
}

export function handPips(tiles: readonly DominoTile[]): number {
  return tiles.reduce((total, tile) => total + tilePips(tile), 0);
}
