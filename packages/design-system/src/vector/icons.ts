import { el, safeId, svgRoot, svgText } from './svg.js';
import type { SvgAsset } from './types.js';

export const ADAPTIVE_ICON_NAMES = ['mesa-viva', 'caida', 'domino', 'blackjack', 'colores'] as const;
export type AdaptiveIconName = (typeof ADAPTIVE_ICON_NAMES)[number];
export type AdaptiveIconLayer = 'background' | 'foreground' | 'monochrome';

const COLORS: Readonly<Record<AdaptiveIconName, string>> = {
  'mesa-viva': '#00695c',
  caida: '#b71c1c',
  domino: '#3e2723',
  blackjack: '#1a237e',
  colores: '#f57c00',
};

function shapesFor(name: AdaptiveIconName, ink: string): string {
  if (name === 'mesa-viva') {
    return (
      el('rect', { x: 30, y: 26, width: 30, height: 52, rx: 6, fill: ink, transform: 'rotate(-18 45 52)' }) +
      el('rect', { x: 43, y: 20, width: 30, height: 56, rx: 6, fill: '#ffffff', stroke: ink, 'stroke-width': 2 }) +
      el('circle', { cx: 58, cy: 46, r: 7, fill: ink })
    );
  }
  if (name === 'caida') {
    return (
      el('rect', { x: 32, y: 30, width: 44, height: 50, rx: 5, fill: '#ffffff', stroke: ink, 'stroke-width': 3 }) +
      el('path', { d: 'M38 64 L54 44 L70 64 Z', fill: ink }) +
      el('circle', { cx: 54, cy: 44, r: 5, fill: '#ffd54f' })
    );
  }
  if (name === 'domino') {
    return (
      el('rect', { x: 34, y: 24, width: 40, height: 60, rx: 7, fill: '#ffffff', stroke: ink, 'stroke-width': 3 }) +
      el('line', { x1: 36, y1: 54, x2: 72, y2: 54, stroke: ink, 'stroke-width': 3 }) +
      el('circle', { cx: 46, cy: 39, r: 4, fill: ink }) +
      el('circle', { cx: 62, cy: 39, r: 4, fill: ink }) +
      el('circle', { cx: 54, cy: 68, r: 4, fill: ink })
    );
  }
  if (name === 'blackjack') {
    return (
      el('path', { d: 'M54 26 C47 40 38 46 38 56 C38 64 44 68 49 66 C51 65 52 67 51 72 H57 C56 67 57 65 59 66 C64 68 70 64 70 56 C70 46 61 40 54 26 Z', fill: ink }) +
      svgText('21', { x: 54, y: 88, 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', 'font-family': 'Verdana, sans-serif', fill: ink })
    );
  }
  return (
    el('circle', { cx: 44, cy: 44, r: 16, fill: '#ffd54f' }) +
    el('circle', { cx: 64, cy: 44, r: 16, fill: '#43a047', opacity: 0.9 }) +
    el('circle', { cx: 44, cy: 64, r: 16, fill: '#e53935', opacity: 0.9 }) +
    el('circle', { cx: 64, cy: 64, r: 16, fill: '#1e88e5', opacity: 0.9 })
  );
}

function layerBody(name: AdaptiveIconName, layer: AdaptiveIconLayer): string {
  if (layer === 'background') {
    return (
      el('rect', { x: 0, y: 0, width: 108, height: 108, fill: COLORS[name] }) +
      el('circle', { cx: 54, cy: 54, r: 46, fill: '#ffffff', opacity: 0.08 }) +
      el('circle', { cx: 18, cy: 18, r: 26, fill: '#ffffff', opacity: 0.06 })
    );
  }
  if (layer === 'foreground') return shapesFor(name, COLORS[name]);
  return shapesFor(name, '#ffffff');
}

export function buildAdaptiveIcon(name: AdaptiveIconName, layer: AdaptiveIconLayer): SvgAsset {
  const id = safeId('icono-adaptativo', name, layer);
  const body = layerBody(name, layer);
  return {
    id,
    kind: 'icono-adaptativo',
    width: 108,
    height: 108,
    viewBox: '0 0 108 108',
    markup: svgRoot({ id, width: 108, height: 108, viewBox: '0 0 108 108', title: `Icono adaptativo ${name} ${layer}`, body }),
  };
}

export function generateAdaptiveIcons(): readonly SvgAsset[] {
  const assets: SvgAsset[] = [];
  for (const name of ADAPTIVE_ICON_NAMES) {
    for (const layer of ['background', 'foreground', 'monochrome'] as const) {
      assets.push(buildAdaptiveIcon(name, layer));
    }
  }
  return assets;
}
