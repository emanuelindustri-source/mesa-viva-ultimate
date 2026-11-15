import { Container } from 'pixi.js';
import type { ProjectedPoint, Projector } from '../../camera/projector.js';
import { createDragFrame, type DragFrame } from '../../drag/physics.js';
import type { FanSlot } from '../../entities/fan-layout.js';
import { ShadowView } from './shadow.js';

const DEG = Math.PI / 180;

export interface EntityShadowState {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly widthScale: number;
  readonly heightScale: number;
  readonly alpha: number;
}

/**
 * Base de toda entidad 2.5D: posición de mesa, elevación Z, inclinación por
 * arrastre y sombra proyectada en la capa inferior.
 */
export abstract class TableEntity extends Container {
  readonly entityWidth: number;
  readonly entityHeight: number;
  readonly shadow: ShadowView;
  protected readonly dragFrame: DragFrame = createDragFrame();
  protected readonly projected: ProjectedPoint = { x: 0, y: 0, scale: 1, depth: 0 };
  private readonly ground: ProjectedPoint = { x: 0, y: 0, scale: 1, depth: 0 };
  tableX = 0;
  tableY = 0;
  elevation = 0;
  baseRotationDeg = 0;
  baseScale = 1;
  dragScale = 1;
  shadowsEnabled = true;
  protected fanRotationDeg = 0;
  private visibleShadow = true;

  constructor(width: number, height: number, shadowLayer: Container) {
    super();
    this.entityWidth = Math.max(1, width);
    this.entityHeight = Math.max(1, height);
    this.shadow = new ShadowView();
    shadowLayer.addChild(this.shadow);
    this.eventMode = 'static';
    this.cursor = 'grab';
  }

  setTablePosition(x: number, y: number): void {
    this.tableX = x;
    this.tableY = y;
  }

  setElevation(value: number): void {
    this.elevation = Math.max(0, Math.min(140, value));
  }

  setFanSlot(anchorX: number, anchorY: number, slot: FanSlot): void {
    this.fanRotationDeg = slot.rotationDeg;
    this.baseRotationDeg = slot.rotationDeg;
    this.baseScale = slot.scale;
    this.tableX = anchorX + slot.x;
    this.tableY = anchorY + slot.y;
  }

  applyDragFrame(frame: DragFrame): void {
    this.dragFrame.lift = frame.lift;
    this.dragFrame.tiltDeg = frame.tiltDeg;
    this.dragFrame.rotationDeg = frame.rotationDeg;
    this.dragFrame.scale = frame.scale;
    this.dragFrame.shadow.offsetX = frame.shadow.offsetX;
    this.dragFrame.shadow.offsetY = frame.shadow.offsetY;
    this.dragFrame.shadow.blur = frame.shadow.blur;
    this.dragFrame.shadow.alpha = frame.shadow.alpha;
    this.dragFrame.shadow.scaleX = frame.shadow.scaleX;
    this.dragFrame.shadow.scaleY = frame.shadow.scaleY;
    this.elevation = frame.lift;
    this.dragScale = frame.scale;
    this.baseRotationDeg = this.idleRotationDeg() + frame.rotationDeg;
  }

  clearDragFrame(): void {
    this.dragFrame.lift = 0;
    this.dragFrame.rotationDeg = 0;
    this.dragFrame.shadow.offsetX = 0;
    this.dragFrame.shadow.offsetY = 0;
    this.dragFrame.shadow.scaleX = 1;
    this.dragFrame.shadow.scaleY = 1;
    this.dragFrame.shadow.alpha = 0.4;
    this.elevation = 0;
    this.dragScale = 1;
    this.baseRotationDeg = this.idleRotationDeg();
  }

  protected idleRotationDeg(): number {
    return this.fanRotationDeg;
  }

  /** Ángulo base del abanico, sin la inclinación temporal del arrastre. */
  get idleRotation(): number {
    return this.idleRotationDeg();
  }

  /** Estado mutable de arrastre para que el controlador no duplique memoria. */
  get dragState(): DragFrame {
    return this.dragFrame;
  }

  /** Proyecta posición y sombra. No asigna memoria por frame. */
  sync(projector: Projector): void {
    projector.projectXYZ(this.tableX, this.tableY, this.elevation, this.projected);
    this.position.set(this.projected.x, this.projected.y);
    const depth = projector.depthFactor(this.elevation);
    this.scale.set(this.baseScale * this.dragScale * depth);
    this.rotation = this.baseRotationDeg * DEG;
    projector.projectXYZ(this.tableX, this.tableY, 0, this.ground);
    const shadowWidth = this.entityWidth * 1.2 * this.dragFrame.shadow.scaleX * this.baseScale;
    const shadowHeight = this.entityWidth * 0.42 * this.dragFrame.shadow.scaleY * this.baseScale;
    this.shadow.place(
      this.ground.x + this.dragFrame.shadow.offsetX,
      this.ground.y + this.dragFrame.shadow.offsetY,
      shadowWidth,
      shadowHeight,
      this.dragFrame.shadow.alpha * (this.shadowsEnabled ? 1 : 0),
    );
    this.shadow.visible = this.shadowsEnabled && this.visibleShadow;
  }

  activate(): void {
    this.visible = true;
    this.visibleShadow = true;
  }

  deactivate(): void {
    this.visible = false;
    this.visibleShadow = false;
    this.shadow.visible = false;
  }

  setShadows(enabled: boolean): void {
    this.shadowsEnabled = enabled;
    this.shadow.visible = enabled && this.visibleShadow;
  }

  override destroy(options?: Parameters<Container['destroy']>[0]): void {
    this.shadow.destroy();
    super.destroy(options);
  }
}
