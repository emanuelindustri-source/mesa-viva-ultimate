import { el, safeId, svgRoot, svgText } from './svg.js';
import type { SvgAsset } from './types.js';

export const RANK_MEDALS = ['novato', 'jugador-de-club', 'maestro-de-mesa', 'leyenda'] as const;
export type RankMedal = (typeof RANK_MEDALS)[number];

interface MedalStyle {
  readonly metal: string;
  readonly edge: string;
  readonly ribbon: string;
  readonly label: string;
}

const STYLES: Readonly<Record<RankMedal, MedalStyle>> = {
  novato: { metal: '#a1887f', edge: '#5d4037', ribbon: '#795548', label: 'NOVATO' },
  'jugador-de-club': { metal: '#b0bec5', edge: '#546e7a', ribbon: '#455a64', label: 'CLUB' },
  'maestro-de-mesa': { metal: '#ffd54f', edge: '#ff8f00', ribbon: '#bf360c', label: 'MAESTRO' },
  leyenda: { metal: '#9575cd', edge: '#311b92', ribbon: '#1a237e', label: 'LEYENDA' },
};

function star(cx: number, cy: number, outer: number, inner: number): string {
  const points: string[] = [];
  for (let index = 0; index < 10; index += 1) {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    points.push(`${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`);
  }
  return points.join(' ');
}

export function buildMedal(rank: RankMedal): SvgAsset {
  const style = STYLES[rank];
  const id = safeId('medalla', rank);
  const body =
    el('path', { d: 'M196 40 L256 190 L316 40 L360 70 L280 230 L232 230 L152 70 Z', fill: style.ribbon, opacity: 0.95 }) +
    el('circle', { cx: 256, cy: 300, r: 168, fill: style.edge }) +
    el('circle', { cx: 256, cy: 300, r: 148, fill: style.metal }) +
    el('circle', { cx: 256, cy: 300, r: 120, fill: 'none', stroke: style.edge, 'stroke-width': 5, opacity: 0.65 }) +
    el('polygon', { points: star(256, 285, 92, 38), fill: style.edge, opacity: 0.85 }) +
    el('polygon', { points: star(256, 285, 76, 31), fill: '#ffffff', opacity: 0.55 }) +
    svgText(style.label, {
      x: 256, y: 430, 'font-size': 34, 'font-weight': 800, 'text-anchor': 'middle',
      'font-family': 'Verdana, sans-serif', fill: style.edge, 'letter-spacing': 3,
    });
  return {
    id,
    kind: 'medalla',
    width: 512,
    height: 512,
    viewBox: '0 0 512 512',
    markup: svgRoot({ id, width: 512, height: 512, viewBox: '0 0 512 512', title: `Medalla de rango ${rank}`, body }),
  };
}

export function generateMedals(): readonly SvgAsset[] {
  return RANK_MEDALS.map((rank) => buildMedal(rank));
}
