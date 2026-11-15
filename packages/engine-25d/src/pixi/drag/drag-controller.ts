import { gsap } from 'gsap';
import type { Container, FederatedPointerEvent } from 'pixi.js';
import type { Projector } from '../../camera/projector.js';
import { DragGesture } from '../../drag/gesture.js';
import { computeDragFrameInto, landingFor, sampleLanding } from '../../drag/physics.js';
import type { TableEntity } from '../entities/table-entity.js';

export interface DragControllerOptions {
  readonly stage: Container;
  readonly entity: TableEntity;
  readonly projector: () => Projector;
  readonly reducedMotion?: boolean;
  readonly onDragStart?: () => void;
  readonly onDrop?: () => void;
}

const nowMs = (): number => (typeof performance === 'undefined' ? Date.now() : performance.now());

/**
 * Arrastre táctil/ratón con elevación Z, sombra dinámica, inclinación y
 * aterrizaje con rebote. El movimiento final procede de una simulación fija.
 */
export class DragController {
  private readonly options: DragControllerOptions;
  private readonly gesture = new DragGesture({ thresholdPx: 5 });
  private active = false;
  private tween: gsap.core.Tween | null = null;

  constructor(options: DragControllerOptions) {
    this.options = options;
    options.stage.eventMode = 'static';
    options.entity.on('pointerdown', this.onPointerDown);
    options.stage.on('globalpointermove', this.onPointerMove);
    options.stage.on('globalpointerup', this.onPointerUp);
    options.stage.on('globalpointerupoutside', this.onPointerUp);
  }

  private readonly onPointerDown = (event: FederatedPointerEvent): void => {
    if (this.tween !== null) this.tween.kill();
    this.active = true;
    this.gesture.begin({ x: event.global.x, y: event.global.y, timeMs: nowMs() });
    this.options.entity.zIndex = 9999;
    this.options.entity.alpha = 0.96;
    this.options.entity.cursor = 'grabbing';
    this.options.onDragStart?.();
  };

  private readonly onPointerMove = (event: FederatedPointerEvent): void => {
    if (!this.active) return;
    const moved = this.gesture.move({ x: event.global.x, y: event.global.y, timeMs: nowMs() });
    if (!moved) return;
    const entity = this.options.entity;
    const plane = this.options.projector().screenToPlane(event.global.x, event.global.y);
    entity.setTablePosition(plane.x, plane.y);
    computeDragFrameInto(this.gesture.velocity(), entity.dragState);
  };

  private readonly onPointerUp = (event: FederatedPointerEvent): void => {
    if (!this.active) return;
    this.active = false;
    const entity = this.options.entity;
    entity.cursor = 'grab';
    entity.alpha = 1;
    const result = this.gesture.end({ x: event.global.x, y: event.global.y, timeMs: nowMs() });
    if (result === null || !result.dragged) {
      entity.zIndex = 0;
      entity.clearDragFrame();
      this.options.onDrop?.();
      return;
    }
    this.land(entity);
  };

  private land(entity: TableEntity): void {
    if (this.options.reducedMotion === true) {
      entity.zIndex = 0;
      entity.clearDragFrame();
      this.options.onDrop?.();
      return;
    }
    const frames = landingFor(entity.elevation);
    const last = frames[frames.length - 1];
    const duration = last === undefined ? 0.5 : Math.max(0.18, last.time);
    const startShadowX = entity.dragState.shadow.offsetX;
    const startShadowScale = entity.dragState.shadow.scaleX;
    const startScale = entity.dragScale;
    entity.baseRotationDeg = entity.idleRotation;
    const progress = { t: 0 };
    const reset = (): void => {
      entity.zIndex = 0;
      entity.clearDragFrame();
      this.options.onDrop?.();
    };
    this.tween = gsap.to(progress, {
      t: duration,
      duration,
      ease: 'none',
      onUpdate: () => {
        const remaining = 1 - Math.min(1, progress.t / duration);
        entity.setElevation(sampleLanding(frames, progress.t));
        entity.dragState.shadow.offsetX = startShadowX * remaining;
        entity.dragState.shadow.scaleX = 1 + (startShadowScale - 1) * remaining;
        entity.dragScale = 1 + (startScale - 1) * remaining;
      },
      onComplete: reset,
    });
  }

  dispose(): void {
    if (this.tween !== null) this.tween.kill();
    this.options.stage.off('globalpointermove', this.onPointerMove);
    this.options.stage.off('globalpointerup', this.onPointerUp);
    this.options.stage.off('globalpointerupoutside', this.onPointerUp);
    this.options.entity.off('pointerdown', this.onPointerDown);
    this.options.entity.clearDragFrame();
  }
}
