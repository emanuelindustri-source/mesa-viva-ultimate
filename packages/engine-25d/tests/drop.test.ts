import { describe, expect, it, vi } from 'vitest';
import { CardDropSession, type DropZone, zoneAt } from '../src/drag/drop-session.js';

const center: DropZone = { id: 'mesa', kind: 'table', x: 100, y: 100, width: 400, height: 260 };
const card: DropZone = { id: 'carta-3', kind: 'capture', x: 320, y: 160, width: 80, height: 110 };

describe('soltar cartas sin bloqueos', () => {
  it('elige la zona más pequeña que contiene el puntero', () => {
    expect(zoneAt([center, card], { x: 350, y: 200 })?.id).toBe('carta-3');
    expect(zoneAt([center, card], { x: 120, y: 120 })?.id).toBe('mesa');
    expect(zoneAt([center, card], { x: 10, y: 10 })).toBeNull();
  });

  it('pointerup sobre una carta capturable ejecuta la jugada', () => {
    const onPlay = vi.fn();
    const onReturn = vi.fn();
    const session = new CardDropSession({ onPlay, onReturn });
    session.begin('c-1', { x: 350, y: 200 });
    session.move({ x: 355, y: 205 }, [center, card]);
    const result = session.release({ x: 360, y: 210 }, [center, card], 'pointerup');
    expect(result?.zone?.id).toBe('carta-3');
    expect(onPlay).toHaveBeenCalledOnce();
    expect(onReturn).not.toHaveBeenCalled();
    expect(session.active).toBe(false);
  });

  it('pointerupoutside también ejecuta la jugada y limpia el estado', () => {
    const onPlay = vi.fn();
    const session = new CardDropSession({ onPlay });
    session.begin('c-2', { x: 120, y: 120 });
    session.move({ x: 360, y: 210 }, [center, card]);
    const result = session.release({ x: 360, y: 210 }, [center, card], 'pointerupoutside');
    expect(result?.zone?.kind).toBe('capture');
    expect(onPlay).toHaveBeenCalledOnce();
    expect(session.active).toBe(false);
  });

  it('pointercancel devuelve la carta y nunca deja el gesto vivo', () => {
    const onPlay = vi.fn();
    const onCancel = vi.fn();
    const session = new CardDropSession({ onPlay, onCancel });
    session.begin('c-3', { x: 120, y: 120 });
    session.move({ x: 300, y: 200 }, [center, card]);
    session.cancel();
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onPlay).not.toHaveBeenCalled();
    expect(session.active).toBe(false);
    expect(session.release({ x: 300, y: 200 }, [center], 'pointerup')).toBeNull();
  });

  it('soltar fuera del objetivo devuelve la carta al abanico', () => {
    const onReturn = vi.fn();
    const onPlay = vi.fn();
    const session = new CardDropSession({ onPlay, onReturn });
    session.begin('c-4', { x: 120, y: 120 });
    session.move({ x: 20, y: 20 }, [center, card]);
    const result = session.release({ x: 20, y: 20 }, [center, card], 'pointerup');
    expect(result?.zone).toBeNull();
    expect(onPlay).not.toHaveBeenCalled();
    expect(onReturn).toHaveBeenCalledWith('c-4');
    expect(session.active).toBe(false);
  });

  it('el toque rápido juega sin arrastrar', () => {
    const onPlay = vi.fn();
    const session = new CardDropSession({ onPlay });
    session.begin('c-5', { x: 150, y: 300 });
    session.release({ x: 151, y: 302 }, [center], 'pointerup');
    expect(onPlay).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'c-5', tap: true }));
    expect(session.active).toBe(false);
  });
});
