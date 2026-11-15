import type { Theme } from '@mesa-viva/design-system';
import type { Container } from 'pixi.js';
import type { Projector } from '../../camera/projector.js';
import type { StageLayout } from '../../layout/stage-layout.js';
import type { FocusItem } from '../../picking/navigation.js';
import type { HitTarget } from '../../picking/picking.js';
import { ObjectPool } from '../../pool/object-pool.js';
import { isOnScreen, type ViewportSize } from '../../render/culling.js';
import type { TileSnapshot } from '../../state/snapshot.js';
import { DragController } from '../drag/drag-controller.js';
import type { TextureProvider } from '../entities/texture-provider.js';
import { TileEntity } from '../entities/tile-entity.js';
import { cardRow, tileHandFan } from './layouts.js';

export interface TileLayerOptions {
  readonly layout: StageLayout;
  readonly theme: Theme;
  readonly textures: TextureProvider | null;
  readonly shadow: Container;
  readonly layer: Container;
  readonly stage: Container;
  readonly projector: () => Projector;
  readonly reducedMotion: boolean;
}

/** Capa de fichas de dominó/Mahjong con mano, mesa y arrastre. */
export class TileLayer {
  private readonly options: TileLayerOptions;
  private readonly tiles = new Map<string, TileEntity>();
  private readonly handTiles = new Set<TileEntity>();
  private readonly dragControllers = new Map<TileEntity, DragController>();
  private readonly pool: ObjectPool<TileEntity>;
  private handHidden = false;

  constructor(options: TileLayerOptions) {
    this.options = options;
    this.pool = new ObjectPool<TileEntity>({
      initial: 16,
      max: 64,
      create: () => {
        const tile = new TileEntity(
          options.layout.tileWidth,
          options.layout.tileHeight,
          options.shadow,
          options.theme,
          options.textures,
        );
        options.layer.addChild(tile);
        return tile;
      },
      reset: (tile) => tile.deactivate(),
      destroy: (tile) => tile.destroyVisual(),
    });
  }

  render(tiles: readonly TileSnapshot[]): void {
    const handList = tiles.filter((tile) => tile.side === 'hand');
    const tableList = tiles.filter((tile) => tile.side !== 'hand');
    const ids = new Set(tiles.map((tile) => tile.id));
    this.handTiles.clear();
    for (const [id, entity] of this.tiles) {
      if (ids.has(id)) continue;
      this.pool.release(entity);
      this.tiles.delete(id);
    }
    const fan = tileHandFan(handList.length, this.options.layout);
    for (let index = 0; index < handList.length; index += 1) {
      const tile = handList[index];
      const slot = fan[index];
      if (tile === undefined) continue;
      const entity = this.ensure(tile);
      entity.setTile(tile, !this.options.reducedMotion);
      if (slot !== undefined) entity.setFanSlot(0, this.options.layout.tableHalfHeight * 0.5, slot);
      this.handTiles.add(entity);
    }
    const row = cardRow(tableList.length, -this.options.layout.tableHalfHeight * 0.08, this.options.layout);
    for (let index = 0; index < tableList.length; index += 1) {
      const tile = tableList[index];
      const slot = row[index];
      if (tile === undefined || slot === undefined) continue;
      const entity = this.ensure(tile);
      entity.setTile(tile, !this.options.reducedMotion);
      entity.baseRotationDeg = 0;
      entity.baseScale = 1;
      entity.setTablePosition(slot.x, slot.y);
    }
    this.applyHandVisibility();
  }

  private ensure(tile: TileSnapshot): TileEntity {
    let entity = this.tiles.get(tile.id);
    if (entity === undefined) {
      entity = this.pool.acquire();
      entity.activate();
      this.tiles.set(tile.id, entity);
      this.dragControllers.set(entity, new DragController({
        stage: this.options.stage,
        entity,
        projector: this.options.projector,
        reducedMotion: this.options.reducedMotion,
      }));
    }
    return entity;
  }

  setHandHidden(hidden: boolean): void {
    this.handHidden = hidden;
    this.applyHandVisibility();
  }

  private applyHandVisibility(): void {
    for (const entity of this.handTiles) entity.visible = !this.handHidden;
  }

  sync(projector: Projector, viewport: ViewportSize): void {
    for (const entity of this.tiles.values()) {
      entity.sync(projector);
      entity.renderable = isOnScreen(
        entity.position.x,
        entity.position.y,
        entity.entityWidth * entity.baseScale,
        entity.entityHeight * entity.baseScale,
        viewport,
      );
    }
  }

  hitTargets(): readonly HitTarget[] {
    const unit = 1 / Math.max(0.05, this.options.layout.baseScale);
    return [...this.tiles].map(([id, entity]) => ({
      id,
      x: entity.tableX,
      y: entity.tableY,
      width: entity.entityWidth * unit * entity.baseScale,
      height: entity.entityHeight * unit * entity.baseScale,
      rotationDeg: entity.baseRotationDeg,
      elevation: entity.elevation,
      order: entity.zIndex,
    }));
  }

  focusItems(projector: Projector): readonly FocusItem[] {
    const items: FocusItem[] = [];
    for (const [id, entity] of this.tiles) {
      if (!entity.visible) continue;
      const point = projector.project({ x: entity.tableX, y: entity.tableY, z: 0 });
      const width = entity.entityWidth * entity.baseScale;
      const height = entity.entityHeight * entity.baseScale;
      items.push({ id, x: point.x - width / 2, y: point.y - height / 2, width, height });
    }
    return items;
  }

  get count(): number {
    return this.tiles.size;
  }

  destroy(): void {
    for (const controller of this.dragControllers.values()) controller.dispose();
    this.dragControllers.clear();
    for (const entity of this.tiles.values()) this.pool.release(entity);
    this.tiles.clear();
    this.handTiles.clear();
    this.pool.clear();
  }
}
