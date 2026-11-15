import type { SvgAsset } from './types.js';

export type SvgAttributeValue = string | number | undefined;
export type SvgAttributes = Readonly<Record<string, SvgAttributeValue>>;

export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function attrs(attributes: SvgAttributes): string {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => `${name}="${escapeXml(String(value))}"`)
    .join(' ');
}

export function el(tag: string, attributes: SvgAttributes, children = ''): string {
  const open = `<${tag} ${attrs(attributes)}`;
  return children.length === 0 ? `${open}/>` : `${open}>${children}</${tag}>`;
}

export function safeId(...parts: readonly string[]): string {
  return parts
    .join('-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface SvgRootOptions {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly viewBox: string;
  readonly title: string;
  readonly body: string;
}

/** Envoltorio determinista; sin ids internos para poder combinar en sprites. */
export function svgRoot(options: SvgRootOptions): string {
  const title = `<title>${escapeXml(options.title)}</title>`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" id="${escapeXml(safeId(options.id))}"`,
    ` width="${options.width}" height="${options.height}" viewBox="${options.viewBox}"`,
    ' role="img" shape-rendering="geometricPrecision">',
    title,
    options.body,
    '</svg>',
  ].join('');
}

export function svgText(content: string, attributes: SvgAttributes): string {
  return el('text', attributes, escapeXml(content));
}

export function fnv1a(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

interface SvgParts {
  readonly viewBox: string;
  readonly body: string;
}

export function splitSvg(markup: string): SvgParts | null {
  const viewBox = /viewBox="([^"]+)"/.exec(markup);
  const open = markup.indexOf('>');
  const close = markup.lastIndexOf('</svg>');
  if (viewBox === null || open === -1 || close <= open) return null;
  return { viewBox: viewBox[1] ?? '0 0 100 100', body: markup.slice(open + 1, close) };
}

/** Convierte los assets en un sprite con `<symbol>` y `<use>` estables para GPU. */
export function svgSprite(assets: readonly SvgAsset[]): string {
  const symbols = assets
    .map((asset) => {
      const parts = splitSvg(asset.markup);
      if (parts === null) return '';
      return el('symbol', { id: asset.id, viewBox: parts.viewBox }, parts.body);
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols}</svg>`;
}
