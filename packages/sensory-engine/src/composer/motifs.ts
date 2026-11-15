import { mulberry32, seedFromText } from '../audio/random.js';
import { clamp } from '../types.js';
import type { Motif, MotifCell, PerformanceState } from './types.js';

export type MotifTransform = 'original' | 'invert' | 'retrograde' | 'sequence' | 'augment' | 'diminish';

const TRANSFORMS: readonly MotifTransform[] = ['original', 'invert', 'retrograde', 'sequence', 'augment', 'diminish'];

function contourOf(cells: readonly MotifCell[]): Motif['contour'] {
  const first = cells[0]?.degree ?? 0;
  const last = cells[cells.length - 1]?.degree ?? 0;
  if (last > first) return 'asc';
  if (last < first) return 'desc';
  return 'wave';
}

export function buildMotifs(seed: number, scaleLength: number, state: PerformanceState): readonly Motif[] {
  const random = mulberry32((seed ^ seedFromText('motifs') ^ seedFromText(state)) >>> 0);
  const size = Math.max(5, scaleLength);
  return Array.from({ length: 3 }, (_, index) => {
    const count = 3 + Math.floor(random() * 3);
    const cells: MotifCell[] = Array.from({ length: count }, () => ({
      degree: Math.floor(random() * size),
      durationBeats: [0.5, 1, 1.5, 2][Math.floor(random() * 4)] ?? 1,
      velocity: 0.5 + random() * 0.32,
    }));
    return { id: `motivo-${index + 1}`, cells, contour: contourOf(cells) };
  });
}

export function transformMotif(
  motif: Motif,
  transform: MotifTransform,
  scaleLength: number,
  random: () => number,
): Motif {
  const size = Math.max(2, scaleLength);
  const wrap = (degree: number): number => ((degree % size) + size) % size;
  let cells: MotifCell[] = motif.cells.map((cell) => ({ ...cell }));
  if (transform === 'invert') cells = cells.map((cell) => ({ ...cell, degree: wrap(size - 1 - cell.degree) }));
  if (transform === 'retrograde') cells = [...cells].reverse();
  if (transform === 'sequence') cells = cells.map((cell) => ({ ...cell, degree: wrap(cell.degree + 1) }));
  if (transform === 'augment') cells = cells.map((cell) => ({ ...cell, durationBeats: cell.durationBeats * 1.5 }));
  if (transform === 'diminish') cells = cells.map((cell) => ({ ...cell, durationBeats: Math.max(0.25, cell.durationBeats * 0.5) }));
  cells = cells.map((cell) => (random() < 0.24
    ? { ...cell, degree: wrap(cell.degree + (random() < 0.5 ? 1 : -1)), velocity: clamp(cell.velocity + 0.04, 0.2, 1) }
    : cell));
  return { id: `${motif.id}-${transform}`, cells, contour: contourOf(cells) };
}

export function motifTransformAt(index: number): MotifTransform {
  return TRANSFORMS[index % TRANSFORMS.length] ?? 'original';
}

export function motifDuration(motif: Motif): number {
  return motif.cells.reduce((sum, cell) => sum + cell.durationBeats, 0);
}
