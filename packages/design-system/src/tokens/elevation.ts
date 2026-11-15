import { withAlpha } from './color-convert.js';
import type { ThemeMode } from './color-types.js';

export const ELEVATION_LEVELS = [0, 1, 2, 3, 4, 5] as const;
export type ElevationLevel = (typeof ELEVATION_LEVELS)[number];

export interface ElevationToken {
  readonly level: ElevationLevel;
  readonly boxShadow: string;
  readonly translateY: number;
  readonly scale: number;
  readonly bevel: number;
  readonly borderAlpha: number;
}

/** Cámara y profundidad compartidas por las capas 2.5D. */
export interface Table25D {
  readonly perspective: number;
  readonly tiltX: number;
  readonly tiltY: number;
  readonly layerGap: number;
  readonly parallax: number;
  readonly lift: number;
  readonly floorShadow: string;
}

function shadowLayers(level: ElevationLevel, mode: ThemeMode): string {
  const dark = mode === 'dark';
  const alpha = (base: number): number => (dark ? Math.min(0.85, base * 1.35) : base);
  const layers: Readonly<Record<ElevationLevel, readonly (readonly [number, number, number, number])[]>> = {
    0: [],
    1: [[0, 1, 2, 0.18], [0, 1, 3, 0.1]],
    2: [[0, 2, 6, 0.16], [0, 1, 2, 0.1]],
    3: [[0, 5, 12, 0.18], [0, 2, 4, 0.1]],
    4: [[0, 9, 20, 0.2], [0, 3, 7, 0.12]],
    5: [[0, 14, 30, 0.24], [0, 5, 12, 0.14]],
  };
  return layers[level]
    .map(([x, y, blur, baseAlpha]) => `${x}px ${y}px ${blur}px ${withAlpha('#000000', alpha(baseAlpha))}`)
    .join(', ');
}

export function createElevations(mode: ThemeMode): Readonly<Record<ElevationLevel, ElevationToken>> {
  const depth: Readonly<Record<ElevationLevel, readonly [number, number, number]>> = {
    0: [0, 1, 0],
    1: [1, 1, 0.5],
    2: [2, 1.005, 1],
    3: [4, 1.01, 1.5],
    4: [7, 1.02, 2],
    5: [10, 1.03, 2.5],
  };
  const entries = ELEVATION_LEVELS.map((level) => {
    const [translateY, scale, bevel] = depth[level];
    return [
      level,
      {
        level,
        boxShadow: level === 0 ? 'none' : shadowLayers(level, mode),
        translateY,
        scale,
        bevel,
        borderAlpha: mode === 'dark' ? 0.16 : 0.08,
      },
    ] as const;
  });
  return Object.fromEntries(entries) as unknown as Readonly<Record<ElevationLevel, ElevationToken>>;
}

export const TABLE_25D: Table25D = {
  perspective: 1200,
  tiltX: 12,
  tiltY: 0,
  layerGap: 6,
  parallax: 0.04,
  lift: 1.06,
  floorShadow: `0 18px 40px ${withAlpha('#000000', 0.32)}`,
};

export function elevationCssVariables(
  elevations: Readonly<Record<ElevationLevel, ElevationToken>>,
): Record<string, string> {
  const variables: Record<string, string> = {
    '--mv-25d-perspective': `${TABLE_25D.perspective}px`,
    '--mv-25d-tilt-x': `${TABLE_25D.tiltX}deg`,
    '--mv-25d-layer-gap': `${TABLE_25D.layerGap}px`,
    '--mv-25d-parallax': String(TABLE_25D.parallax),
    '--mv-25d-floor-shadow': TABLE_25D.floorShadow,
  };
  for (const level of ELEVATION_LEVELS) {
    const token = elevations[level];
    variables[`--md-sys-elevation-level${level}`] = token.boxShadow;
    variables[`--mv-elevation-level${level}-lift`] = `${token.translateY}px`;
    variables[`--mv-elevation-level${level}-scale`] = String(token.scale);
    variables[`--mv-elevation-level${level}-bevel`] = `${token.bevel}px`;
  }
  return variables;
}
