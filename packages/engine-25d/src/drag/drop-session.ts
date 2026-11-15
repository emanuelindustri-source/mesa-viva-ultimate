export type DropKind = 'capture' | 'discard' | 'table';

export interface DropZone {
  readonly id: string;
  readonly kind: DropKind;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface DropPoint {
  readonly x: number;
  readonly y: number;
}

export type DropReason = 'pointerup' | 'pointerupoutside' | 'pointercancel';

export interface DropResult {
  readonly cardId: string;
  readonly zone: DropZone | null;
  readonly tap: boolean;
  readonly at: DropPoint;
}

export interface CardDropHooks {
  readonly onLift?: (cardId: string) => void;
  readonly onHover?: (zone: DropZone | null) => void;
  readonly onPlay?: (result: DropResult) => void;
  readonly onReturn?: (cardId: string) => void;
  readonly onCancel?: (cardId: string) => void;
}

export function zoneAt(zones: readonly DropZone[], point: DropPoint): DropZone | null {
  let best: DropZone | null = null;
  let bestArea = Number.POSITIVE_INFINITY;
  for (const zone of zones) {
    if (point.x < zone.x || point.y < zone.y) continue;
    if (point.x > zone.x + zone.width || point.y > zone.y + zone.height) continue;
    const area = zone.width * zone.height;
    if (area < bestArea) {
      best = zone;
      bestArea = area;
    }
  }
  return best;
}

/**
 * Máquina pura de "agarrar y soltar". pointerup y pointerupoutside ejecutan
 * la jugada; pointercancel siempre devuelve la carta sin dejarla trabada.
 */
export class CardDropSession {
  private cardId: string | null = null;
  private start: DropPoint | null = null;
  private moved = false;
  private hovered: DropZone | null = null;
  private readonly hooks: CardDropHooks;
  private readonly thresholdPx: number;

  constructor(hooks: CardDropHooks = {}, thresholdPx = 7) {
    this.hooks = hooks;
    this.thresholdPx = thresholdPx;
  }

  get active(): boolean {
    return this.cardId !== null;
  }

  get activeCardId(): string | null {
    return this.cardId;
  }

  get isDragged(): boolean {
    return this.moved;
  }

  begin(cardId: string, point: DropPoint): void {
    if (this.cardId !== null) this.reset(false);
    this.cardId = cardId;
    this.start = { x: point.x, y: point.y };
    this.moved = false;
    this.hovered = null;
    this.hooks.onLift?.(cardId);
  }

  /** Devuelve la zona bajo el puntero, o null. No ejecuta la jugada. */
  move(point: DropPoint, zones: readonly DropZone[]): DropZone | null {
    if (this.cardId === null || this.start === null) return null;
    if (Math.hypot(point.x - this.start.x, point.y - this.start.y) > this.thresholdPx) this.moved = true;
    const zone = zoneAt(zones, point);
    if (zone?.id !== this.hovered?.id) {
      this.hovered = zone;
      this.hooks.onHover?.(zone);
    }
    return zone;
  }

  /**
   * Suelta la carta. Si no hubo arrastre se trata como toque rápido:
   * la zona se calcula en el punto del toque (normalmente la mano).
   */
  release(point: DropPoint, zones: readonly DropZone[], reason: DropReason = 'pointerup'): DropResult | null {
    if (this.cardId === null) return null;
    const cardId = this.cardId;
    if (reason === 'pointercancel') {
      this.reset(true);
      return null;
    }
    const zone = this.moved ? zoneAt(zones, point) : null;
    const tap = !this.moved;
    const played = tap || zone !== null;
    this.reset(false, played);
    const result: DropResult = { cardId, zone, tap, at: { x: point.x, y: point.y } };
    if (played) this.hooks.onPlay?.(result);
    return result;
  }

  cancel(): void {
    if (this.cardId === null) return;
    this.reset(true);
  }

  private reset(cancelled: boolean, silent = false): void {
    const cardId = this.cardId;
    this.cardId = null;
    this.start = null;
    this.moved = false;
    if (this.hovered !== null) this.hooks.onHover?.(null);
    this.hovered = null;
    if (cardId === null) return;
    if (cancelled) this.hooks.onCancel?.(cardId);
    else if (!silent) this.hooks.onReturn?.(cardId);
  }
}
