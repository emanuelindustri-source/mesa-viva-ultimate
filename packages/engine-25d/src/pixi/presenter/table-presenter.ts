import type { Theme } from '@mesa-viva/design-system';
import type { Container } from 'pixi.js';
import type { Projector } from '../../camera/projector.js';
import type { DropResult } from '../../drag/drop-session.js';
import type { StageLayout } from '../../layout/stage-layout.js';
import type { FocusItem } from '../../picking/navigation.js';
import type { HitTarget } from '../../picking/picking.js';
import type { ViewportSize } from '../../render/culling.js';
import type { TableSnapshot } from '../../state/snapshot.js';
import { CardLayer } from './card-layer.js';
import type { StageLayers } from './layers.js';
import { PropPresenter } from './props.js';
import { SeatLayer } from './seat-layer.js';
import { TileLayer } from './tile-layer.js';

export interface TablePresenterOptions {
  readonly layers: StageLayers;
  readonly layout: StageLayout;
  readonly theme: Theme;
  readonly textures: import('../entities/texture-provider.js').TextureProvider | null;
  readonly stage: Container;
  readonly projector: () => Projector;
  readonly reducedMotion: boolean;
  readonly onCardDrop?: (result: DropResult) => void;
  readonly showSeats?: boolean;
}

/** Orquesta las capas y traduce `TableSnapshot` a entidades reutilizadas. */
export class TablePresenter {
  private readonly cardLayer: CardLayer;
  private readonly tileLayer: TileLayer;
  private readonly seatLayer: SeatLayer;
  private readonly props: PropPresenter;

  constructor(options: TablePresenterOptions) {
    const common = {
      layout: options.layout,
      theme: options.theme,
      textures: options.textures,
      shadow: options.layers.shadow,
      stage: options.stage,
      projector: options.projector,
      reducedMotion: options.reducedMotion,
      ...(options.onCardDrop !== undefined ? { onCardDrop: options.onCardDrop } : {}),
    };
    this.cardLayer = new CardLayer({ ...common, layer: options.layers.cards });
    this.tileLayer = new TileLayer({ ...common, layer: options.layers.cards });
    this.seatLayer = new SeatLayer({
      layout: options.layout,
      theme: options.theme,
      shadow: options.layers.shadow,
      seatLayer: options.layers.seats,
      boardLayer: options.layers.board,
      reducedMotion: options.reducedMotion,
      showSeats: options.showSeats !== false,
    });
    this.props = new PropPresenter(options.layers, options.layout, options.theme, options.reducedMotion);
  }

  render(snapshot: TableSnapshot): void {
    this.cardLayer.render(snapshot.hand, snapshot.tableCards, snapshot.drops, snapshot.canInteract);
    this.tileLayer.render(snapshot.tiles);
    this.seatLayer.render(snapshot);
    this.props.render(snapshot);
  }

  sync(projector: Projector, viewport: ViewportSize): void {
    this.cardLayer.sync(projector, viewport);
    this.tileLayer.sync(projector, viewport);
    this.seatLayer.sync(projector);
    this.props.sync(projector);
  }

  setHandHidden(hidden: boolean): void {
    this.cardLayer.setHandHidden(hidden);
    this.tileLayer.setHandHidden(hidden);
  }

  hitTargets(): readonly HitTarget[] {
    return [...this.cardLayer.hitTargets(), ...this.tileLayer.hitTargets()];
  }

  focusItems(projector: Projector): readonly FocusItem[] {
    return [
      ...this.cardLayer.focusItems(projector),
      ...this.tileLayer.focusItems(projector),
      ...this.seatLayer.focusItems(projector),
    ];
  }

  focusBounds(items: readonly FocusItem[], id: string): { x: number; y: number; width: number; height: number } | null {
    const item = items.find((candidate) => candidate.id === id);
    if (item === undefined) return null;
    return { x: item.x + item.width / 2, y: item.y + item.height / 2, width: item.width, height: item.height };
  }

  get counts(): {
    readonly cards: number;
    readonly tiles: number;
    readonly seats: number;
    readonly board: boolean;
    readonly chips: number;
    readonly dice: number;
    readonly tokens: number;
  } {
    return {
      cards: this.cardLayer.count,
      tiles: this.tileLayer.count,
      seats: this.seatLayer.count,
      board: this.seatLayer.boardVisible,
      ...this.props.counts,
    };
  }

  destroy(): void {
    this.cardLayer.destroy();
    this.tileLayer.destroy();
    this.seatLayer.destroy();
    this.props.destroy();
  }
}
