import type { SvgAsset } from '@mesa-viva/design-system';

/** SVG mínimo autocontenido, sin red ni archivos externos. */
export function svgToDataUri(markup: string): string {
  const encoded = encodeURIComponent(markup).replace(/'/g, '%27').replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export interface SvgDimensions {
  readonly width: number;
  readonly height: number;
}

/** Conserva la proporción del asset dentro de una caja de atlas. */
export function fitInside(source: SvgDimensions, box: SvgDimensions): SvgDimensions {
  const width = Math.max(1, source.width);
  const height = Math.max(1, source.height);
  const scale = Math.min(box.width / width, box.height / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export interface SvgCellRequest {
  readonly asset: SvgAsset;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Documento de celda con el SVG original escalado a su hueco del atlas. */
export function svgCellDocument(request: SvgCellRequest): string {
  const { asset, width, height } = request;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"`,
    ` viewBox="${asset.viewBox}" preserveAspectRatio="xMidYMid meet">`,
    asset.markup,
    '</svg>',
  ].join('');
}

export function svgCellDataUri(request: SvgCellRequest): string {
  return svgToDataUri(svgCellDocument(request));
}
