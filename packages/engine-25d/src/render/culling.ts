export interface ViewportSize {
  readonly width: number;
  readonly height: number;
}

/** Culling barato para entidades fuera de cámara; evita draw calls invisibles. */
export function isOnScreen(
  x: number,
  y: number,
  width: number,
  height: number,
  viewport: ViewportSize,
  padding = 48,
): boolean {
  const halfWidth = Math.max(1, width) / 2;
  const halfHeight = Math.max(1, height) / 2;
  const margin = Math.max(0, padding);
  return (
    x + halfWidth >= -margin &&
    x - halfWidth <= viewport.width + margin &&
    y + halfHeight >= -margin &&
    y - halfHeight <= viewport.height + margin
  );
}

export function countVisible(
  items: readonly { readonly x: number; readonly y: number; readonly width: number; readonly height: number }[],
  viewport: ViewportSize,
  padding = 48,
): number {
  let visible = 0;
  for (const item of items) {
    if (isOnScreen(item.x, item.y, item.width, item.height, viewport, padding)) visible += 1;
  }
  return visible;
}
