import { describe, expect, it } from 'vitest';
import { cycleFocus, type FocusNode, firstFocusable, moveFocus } from '../src/index.js';

const NODES: readonly FocusNode[] = [
  { id: 'a', x: 0, y: 0, width: 100, height: 100 },
  { id: 'b', x: 200, y: 0, width: 100, height: 100 },
  { id: 'c', x: 0, y: 200, width: 100, height: 100 },
  { id: 'd', x: 200, y: 200, width: 100, height: 100 },
];

describe('navegación espacial con D-pad', () => {
  it('elige el primer elemento al entrar', () => {
    expect(firstFocusable(NODES)).toBe('a');
    expect(moveFocus(NODES, null, 'down')).toBe('a');
  });

  it('se mueve por la cuadrícula en las cuatro direcciones', () => {
    expect(moveFocus(NODES, 'a', 'right')).toBe('b');
    expect(moveFocus(NODES, 'a', 'down')).toBe('c');
    expect(moveFocus(NODES, 'b', 'left')).toBe('a');
    expect(moveFocus(NODES, 'b', 'down')).toBe('d');
    expect(moveFocus(NODES, 'c', 'up')).toBe('a');
    expect(moveFocus(NODES, 'd', 'right')).toBeNull();
    expect(moveFocus(NODES, 'd', 'down')).toBeNull();
  });

  it('omite nodos deshabilitados', () => {
    const nodes: readonly FocusNode[] = [
      { id: 'a', x: 0, y: 0, width: 100, height: 100 },
      { id: 'b', x: 100, y: 0, width: 100, height: 100, disabled: true },
      { id: 'c', x: 300, y: 0, width: 100, height: 100 },
    ];
    expect(moveFocus(nodes, 'a', 'right')).toBe('c');
    expect(firstFocusable(nodes)).toBe('a');
    const withoutA = nodes.map((node) => ({ ...node, disabled: node.id === 'a' }));
    expect(firstFocusable(withoutA)).toBe('b');
    expect(moveFocus(withoutA, null, 'right')).toBe('b');
  });

  it('ignora nodos sin área y listas vacías', () => {
    const empty: readonly FocusNode[] = [{ id: 'x', x: 0, y: 0, width: 0, height: 0 }];
    expect(firstFocusable(empty)).toBeNull();
    expect(moveFocus([], null, 'up')).toBeNull();
  });

  it('prioriza el eje de movimiento sobre la diagonal', () => {
    const nodes: readonly FocusNode[] = [
      { id: 'centro', x: 0, y: 0, width: 100, height: 100 },
      { id: 'diagonal', x: 110, y: 110, width: 100, height: 100 },
      { id: 'alineado', x: 110, y: 10, width: 100, height: 100 },
    ];
    expect(moveFocus(nodes, 'centro', 'right')).toBe('alineado');
    expect(moveFocus(nodes, 'centro', 'down')).toBe('diagonal');
  });

  it('cicla el orden de tabulación', () => {
    expect(cycleFocus(NODES, 'a')).toBe('b');
    expect(cycleFocus(NODES, 'd')).toBe('a');
    expect(cycleFocus(NODES, 'a', -1)).toBe('d');
    expect(cycleFocus(NODES, 'inexistente')).toBe('a');
  });
});
