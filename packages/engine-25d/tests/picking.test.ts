import { describe, expect, it } from 'vitest';
import { type FocusItem, firstFocus, nextFocus } from '../src/picking/navigation.js';
import { boundingRect, pickTopmost, pointInRotatedRect, pointInsideBounds } from '../src/picking/picking.js';

describe('picking táctil y navegación D-pad', () => {
  it('acepta puntos dentro de un rectángulo rotado', () => {
    const card = { id: 'c1', x: 0, y: 0, width: 100, height: 40, rotationDeg: 90 };
    expect(pointInRotatedRect(0, 0, card)).toBe(true);
    expect(pointInRotatedRect(0, 49, card)).toBe(true);
    expect(pointInRotatedRect(0, 51, card)).toBe(false);
    expect(pointInRotatedRect(51, 0, card)).toBe(false);
    const bounds = boundingRect(card);
    expect(bounds.width).toBeCloseTo(40);
    expect(bounds.height).toBeCloseTo(100);
    expect(pointInsideBounds(0, 49, bounds)).toBe(true);
  });

  it('elige la entidad más alta y luego el orden de apilado', () => {
    const targets = [
      { id: 'mesa', x: 0, y: 0, width: 100, height: 100, elevation: 0, order: 1 },
      { id: 'carta', x: 0, y: 0, width: 50, height: 50, elevation: 12, order: 0 },
      { id: 'ficha', x: 0, y: 0, width: 50, height: 50, elevation: 0, order: 5 },
    ];
    expect(pickTopmost(0, 0, targets)).toBe('carta');
    expect(pickTopmost(0, 40, targets)).toBe('mesa');
    expect(pickTopmost(500, 500, targets)).toBeNull();
  });

  it('navega por cono en una rejilla y hace wrap', () => {
    const items: FocusItem[] = [
      { id: 'a', x: 0, y: 0, width: 40, height: 40 },
      { id: 'b', x: 100, y: 0, width: 40, height: 40 },
      { id: 'c', x: 0, y: 100, width: 40, height: 40 },
      { id: 'd', x: 100, y: 100, width: 40, height: 40 },
    ];
    expect(firstFocus(items)).toBe('a');
    expect(nextFocus('a', items, 'right')).toBe('b');
    expect(nextFocus('a', items, 'down')).toBe('c');
    expect(nextFocus('b', items, 'down')).toBe('d');
    expect(nextFocus('d', items, 'right')).toBeNull();
    expect(nextFocus('d', items, 'right', { wrap: true })).toBe('b');
    expect(nextFocus(null, items, 'up')).toBe('a');
    expect(nextFocus('a', [], 'up')).toBeNull();
  });
});
