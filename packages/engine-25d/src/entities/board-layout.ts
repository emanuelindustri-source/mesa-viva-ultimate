import { clamp } from '../math/vec3.js';

export interface GridSpec {
  readonly rows: number;
  readonly columns: number;
  readonly cellSize: number;
  readonly gap?: number;
  readonly originX?: number;
  readonly originY?: number;
  readonly padding?: number;
}

export interface GridLayout {
  readonly rows: number;
  readonly columns: number;
  readonly cellSize: number;
  readonly gap: number;
  readonly originX: number;
  readonly originY: number;
  readonly width: number;
  readonly height: number;
}

export interface CellCenter {
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

export interface CellHit {
  readonly row: number;
  readonly column: number;
}

export function createGridLayout(spec: GridSpec): GridLayout {
  const rows = Math.max(1, Math.floor(spec.rows));
  const columns = Math.max(1, Math.floor(spec.columns));
  const cellSize = Math.max(4, spec.cellSize);
  const gap = Math.max(0, spec.gap ?? 0);
  const padding = Math.max(0, spec.padding ?? 0);
  const width = columns * cellSize + (columns - 1) * gap + padding * 2;
  const height = rows * cellSize + (rows - 1) * gap + padding * 2;
  return {
    rows,
    columns,
    cellSize,
    gap,
    originX: (spec.originX ?? 0) - width / 2,
    originY: (spec.originY ?? 0) - height / 2,
    width,
    height,
  };
}

export function cellCenter(layout: GridLayout, row: number, column: number): CellCenter {
  const safeRow = clamp(Math.floor(row), 0, layout.rows - 1);
  const safeColumn = clamp(Math.floor(column), 0, layout.columns - 1);
  return {
    x: layout.originX + safeColumn * (layout.cellSize + layout.gap) + layout.cellSize / 2,
    y: layout.originY + safeRow * (layout.cellSize + layout.gap) + layout.cellSize / 2,
    size: layout.cellSize,
  };
}

/** Convierte un punto de mesa en la casilla más cercana (picking y D-pad). */
export function nearestCell(layout: GridLayout, x: number, y: number): CellHit {
  const localX = x - layout.originX;
  const localY = y - layout.originY;
  const stride = layout.cellSize + layout.gap;
  const column = clamp(Math.floor(localX / stride), 0, layout.columns - 1);
  const row = clamp(Math.floor(localY / stride), 0, layout.rows - 1);
  return { row, column };
}

export function snapToCell(layout: GridLayout, x: number, y: number): CellCenter & CellHit {
  const hit = nearestCell(layout, x, y);
  return { ...cellCenter(layout, hit.row, hit.column), ...hit };
}

/** Coordenadas normalizadas de un tablero de Go/ajedrez/damas. */
export const BOARD_PRESETS = {
  ajedrez: { rows: 8, columns: 8, cellSize: 64 },
  damas: { rows: 8, columns: 8, cellSize: 64 },
  go: { rows: 19, columns: 19, cellSize: 28 },
  ludo: { rows: 15, columns: 15, cellSize: 36 },
} as const;
