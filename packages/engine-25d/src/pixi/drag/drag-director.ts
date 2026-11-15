import { gsap } from 'gsap';
import type { Container, FederatedPointerEvent } from 'pixi.js';
import type { Projector } from '../../camera/projector.js';
import { CardDropSession, type DropPoint, type DropResult, type DropZone } from '../../drag/drop-session.js';
import { DragGesture } from '../../drag/gesture.js';
import { computeDragFrameInto } from '../../drag/physics.js';
import type { TableEntity } from '../entities/table-entity.js';

export interface DragDirectorOptions {
  readonly stage: Container;
  readonly projector: () => Projector;
  readonly reducedMotion: boolean;
  readonly zones: () => readonly DropZone[];
  readonly hoverZone: (zone: DropZone | null) => void;
  readonly onPlay: (result: DropResult) => void;
  readonly onDragEnd?: () => void;
}

const nowMs = (): number => (typeof performance === 'undefined' ? Date.now() : performance.now());

/**
 * Un único controlador para toda la mesa: pointerup, pointerupoutside y
 * pointercancel viven en el escenario global, así ninguna carta queda trabada.
 */
export class DragDirector {
  private readonly options: DragDirectorOptions;
  private readonly session: CardDropSession;
  private readonly gesture = new DragGesture({ thresholdPx: 7 });
  private entity: TableEntity | null = null;
  private cardId: string | null = null;
  private homeX = 0;
  private homeY = 0;
  private tween: gsap.core.Tween | null = null;
  private readonly onWindowCancel = (): void => this.cancel();

  constructor(options: DragDirectorOptions) {
    this.options = options;
    options.stage.eventMode = 'static';
    options.stage.on('globalpointermove', this.onPointerMove);
    options.stage.on('globalpointerup', this.onPointerUp);
    options.stage.on('globalpointerupoutside', this.onPointerUp);
    options.stage.on('pointercancel', this.onPointerCancel);
    if (typeof window !== 'undefined') {
      window.addEventListener('pointerup', this.onWindowUp, true);
      window.addEventListener('pointercancel', this.onWindowCancel, true);
      window.addEventListener('blur', this.onWindowCancel);
    }
    this.session = new CardDropSession({
      onHover: (zone) => options.hoverZone(zone),
      onPlay: (result) => options.onPlay(result),
      onReturn: (id) => this.returnCard(id),
      onCancel: () => this.returnCard(this.cardId),
    });
  }

  get active(): boolean {
    return this.entity !== null;
  }

  begin(cardId: string, entity: TableEntity, point: DropPoint): void {
    this.tween?.kill();
    this.entity = entity;
    this.cardId = cardId;
    this.homeX = entity.tableX;
    this.homeY = entity.tableY;
    entity.zIndex = 9999;
    entity.cursor = 'grabbing';
    entity.dragScale = 1.15;
    entity.setElevation(24);
    this.gesture.begin({ x: point.x, y: point.y, timeMs: nowMs() });
    this.session.begin(cardId, point);
  }

  private readonly onPointerMove = (event: FederatedPointerEvent): void => {
    if (this.entity === null) return;
    const point = { x: event.global.x, y: event.global.y };
    const moved = this.gesture.move({ ...point, timeMs: nowMs() });
    if (!moved) return;
    const plane = this.options.projector().screenToPlane(point.x, point.y);
    this.entity.setTablePosition(plane.x, plane.y);
    const frame = computeDragFrameInto(this.gesture.velocity(), this.entity.dragState);
    this.entity.applyDragFrame(frame);
    this.entity.dragScale = Math.max(frame.scale, 1.15);
    this.session.move(point, this.options.zones());
  };

  private readonly onPointerUp = (event: FederatedPointerEvent): void => {
    if (this.entity === null) return;
    this.release({ x: event.global.x, y: event.global.y }, 'pointerup');
  };

  private readonly onWindowUp = (event: PointerEvent): void => {
    if (this.entity === null) return;
    this.release({ x: event.clientX, y: event.clientY }, 'pointerupoutside');
  };

  private readonly onPointerCancel = (): void => this.cancel();

  private release(point: DropPoint, reason: 'pointerup' | 'pointerupoutside'): void {
    const entity = this.entity;
    if (entity === null) return;
    this.gesture.end({ ...point, timeMs: nowMs() });
    entity.cursor = 'grab';
    entity.alpha = 1;
    this.session.release(point, this.options.zones(), reason);
    this.entity = null;
    this.cardId = null;
    this.resetVisual(entity);
    this.options.onDragEnd?.();
  }

  cancel(): void {
    if (this.entity === null) return;
    const entity = this.entity;
    this.session.cancel();
    this.entity = null;
    this.cardId = null;
    this.resetVisual(entity);
    this.options.onDragEnd?.();
  }

  private returnCard(_cardId: string | null): void {
    const entity = this.entity;
    if (entity === null) return;
    const startX = entity.tableX;
    const startY = entity.tableY;
    if (this.options.reducedMotion) {
      entity.setTablePosition(this.homeX, this.homeY);
      return;
    }
    const progress = { t: 0 };
    gsap.killTweensOf(entity);
    this.tween = gsap.to(progress, {
      t: 1,
      duration: 0.28,
      ease: 'back.out(1.4)',
      onUpdate: () => {
        entity.setTablePosition(startX + (this.homeX - startX) * progress.t, startY + (this.homeY - startY) * progress.t);
      },
    });
  }

  private resetVisual(entity: TableEntity): void {
    entity.clearDragFrame();
    entity.dragScale = 1;
    entity.setElevation(0);
    entity.zIndex = 0;
    this.options.hoverZone(null);
  }

  dispose(): void {
    this.tween?.kill();
    this.options.stage.off('globalpointermove', this.onPointerMove);
    this.options.stage.off('globalpointerup', this.onPointerUp);
    this.options.stage.off('globalpointerupoutside', this.onPointerUp);
    this.options.stage.off('pointercancel', this.onPointerCancel);
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointerup', this.onWindowUp, true);
      window.removeEventListener('pointercancel', this.onWindowCancel, true);
      window.removeEventListener('blur', this.onWindowCancel);
    }
    this.entity = null;
    this.cardId = null;
  }
}
