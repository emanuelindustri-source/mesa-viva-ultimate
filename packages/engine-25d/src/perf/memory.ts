import type { AtlasPlan } from '../atlas/plan.js';

export interface TextureMemoryEstimate {
  readonly pixels: number;
  readonly megabytes: number;
  readonly sheets: number;
}

/** Memoria GPU aproximada del atlas (RGBA de 4 bytes por píxel). */
export function estimateAtlasMemory(plan: AtlasPlan, bytesPerPixel = 4): TextureMemoryEstimate {
  const pixels = Math.max(0, plan.totalPixels);
  const bytes = pixels * Math.max(1, bytesPerPixel);
  return {
    pixels,
    megabytes: Number((bytes / (1024 * 1024)).toFixed(2)),
    sheets: plan.sheets.length,
  };
}

export interface DrawCallEstimate {
  readonly cards: number;
  readonly tiles: number;
  readonly chips: number;
  readonly seats: number;
  readonly staticLayers: number;
  readonly estimated: number;
}

/** Estimación conservadora: cada atlas agrupa por tipo de entidad. */
export function estimateDrawCalls(input: {
  readonly cards: number;
  readonly tiles: number;
  readonly chips: number;
  readonly seats: number;
  readonly staticLayers?: number;
}): DrawCallEstimate {
  const staticLayers = Math.max(1, input.staticLayers ?? 6);
  const estimated =
    staticLayers +
    Math.ceil(Math.max(0, input.cards) / 48) +
    Math.ceil(Math.max(0, input.tiles) / 40) +
    Math.ceil(Math.max(0, input.chips) / 24) +
    Math.ceil(Math.max(0, input.seats) / 16);
  return {
    cards: input.cards,
    tiles: input.tiles,
    chips: input.chips,
    seats: input.seats,
    staticLayers,
    estimated,
  };
}
