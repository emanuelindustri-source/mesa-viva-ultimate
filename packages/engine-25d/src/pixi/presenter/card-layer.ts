import type { Theme } from '@mesa-viva/design-system';
import type { Container } from 'pixi.js';
import type { Projector } from '../../camera/projector.js';
import type { StageLayout } from '../../layout/stage-layout.js';
import type { FocusItem } from '../../picking/navigation.js';
import type { HitTarget } from '../../picking/picking.js';
import { ObjectPool } from '../../pool/object-pool.js';
import { isOnScreen, type ViewportSize } from '../../render/culling.js';
import type { CardSnapshot } from '../../state/snapshot.js';
import { DragController } from '../drag/drag-controller.js';
import { CardEntity } from '../entities/card-entity.js';
import type { TextureProvider } from '../entities/texture-provider.js';
import { cardRow, handFan } from './layouts.js';

export interface CardLayerOptions {
  readonly layout: StageLayout;
  readonly theme: Theme;
  readonly textures: TextureProvider | null;
  readonly shadow: Container;
  readonly layer: Container;
  readonly stage: Container;
  readonly projector: () => Projector;
  readonly reducedMotion: boolean;
}

/** Capa de cartas con fan, zonas de mesa, volteo y arrastre. */
export class CardLayer {
  private readonly options: CardLayerOptions;
  private readonly cards = new Map<string, CardEntity>();
  private readonly handCards = new Set<CardEntity>();
  private readonly dragControllers = new Map<CardEntity, DragController>();
  private readonly pool: ObjectPool<CardEntity>;
  private handHidden = false;

  constructor(options: CardLayerOptions) {
    this.options = options;
    this.pool = new ObjectPool<CardEntity>({
      initial: 24,
      max: 96,
      create: () => {
        const card = new CardEntity(
          options.layout.cardWidth,
          options.layout.cardHeight,
          options.shadow,
          options.theme,
          options.textures,
        );
        options.layer.addChild(card);
        return card;
      },
      reset: (card) => card.deactivate(),
      destroy: (card) => card.destroyVisual(),
    });
  }

  render(hand: readonly CardSnapshot[], tableCards: readonly CardSnapshot[]): void {
    const ids = new Set([...hand.map((card) => card.id), ...tableCards.map((card) => card.id)]);
    this.handCards.clear();
    for (const [id, entity] of this.cards) {
      if (ids.has(id)) continue;
      this.pool.release(entity);
      this.cards.delete(id);
    }
    const slots = handFan(hand.length, this.options.layout);
    for (let index = 0; index < hand.length; index += 1) {
      const card = hand[index];
      const slot = slots[index];
      if (card === undefined) continue;
      const entity = this.ensure(card);
      if (slot !== undefined) entity.setFanSlot(0, this.options.layout.tableHalfHeight * 0.42, slot);
      entity.setCard(cardVisual(card), !this.options.reducedMotion);
      this.handCards.add(entity);
    }
    this.layoutZone(tableCards.filter((card) => card.zone === 'dealer'), -this.options.layout.tableHalfHeight * 0.3);
    this.layoutZone(tableCards.filter((card) => card.zone === 'table'), -this.options.layout.tableHalfHeight * 0.1);
    this.layoutZone(tableCards.filter((card) => card.zone === 'discard'), 0);
    this.applyHandVisibility();
  }

  private ensure(card: CardSnapshot): CardEntity {
    let entity = this.cards.get(card.id);
    if (entity === undefined) {
      entity = this.pool.acquire();
      entity.activate();
      this.cards.set(card.id, entity);
      this.dragControllers.set(entity, new DragController({
        stage: this.options.stage,
        entity,
        projector: this.options.projector,
        reducedMotion: this.options.reducedMotion,
      }));
    }
    return entity;
  }

  private layoutZone(cards: readonly CardSnapshot[], y: number): void {
    const row = cardRow(cards.length, y, this.options.layout);
    for (let index = 0; index < cards.length; index += 1) {
      const card = cards[index];
      const slot = row[index];
      if (card === undefined || slot === undefined) continue;
      const entity = this.ensure(card);
      entity.setCard(cardVisual(card), !this.options.reducedMotion);
      entity.baseRotationDeg = 0;
      entity.baseScale = 1;
      entity.setTablePosition(slot.x, slot.y);
    }
  }

  setHandHidden(hidden: boolean): void {
    this.handHidden = hidden;
    this.applyHandVisibility();
  }

  private applyHandVisibility(): void {
    for (const entity of this.handCards) entity.visible = !this.handHidden;
  }

  sync(projector: Projector, viewport: ViewportSize): void {
    for (const entity of this.cards.values()) {
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
    return [...this.cards].map(([id, entity]) => ({
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
    for (const [id, entity] of this.cards) {
      if (!entity.visible) continue;
      const point = projector.project({ x: entity.tableX, y: entity.tableY, z: 0 });
      const width = entity.entityWidth * entity.baseScale;
      const height = entity.entityHeight * entity.baseScale;
      items.push({ id, x: point.x - width / 2, y: point.y - height / 2, width, height });
    }
    return items;
  }

  get count(): number {
    return this.cards.size;
  }

  destroy(): void {
    for (const controller of this.dragControllers.values()) controller.dispose();
    this.dragControllers.clear();
    for (const entity of this.cards.values()) this.pool.release(entity);
    this.cards.clear();
    this.handCards.clear();
    this.pool.clear();
  }
}

export function cardVisual(card: CardSnapshot): { rank: string; suit: string; deck: CardSnapshot['deck']; faceUp: boolean } {
  return { rank: card.label ?? card.rank, suit: card.suit, deck: card.deck, faceUp: card.faceUp };
}
