import type { Theme } from '@mesa-viva/design-system';
import { type Container, type FederatedPointerEvent, Graphics } from 'pixi.js';
import type { Projector } from '../../camera/projector.js';
import type { DropResult, DropZone } from '../../drag/drop-session.js';
import type { StageLayout } from '../../layout/stage-layout.js';
import type { FocusItem } from '../../picking/navigation.js';
import type { HitTarget } from '../../picking/picking.js';
import { ObjectPool } from '../../pool/object-pool.js';
import { isOnScreen, type ViewportSize } from '../../render/culling.js';
import type { CardSnapshot, DropHint } from '../../state/snapshot.js';
import { DragDirector } from '../drag/drag-director.js';
import { CardEntity } from '../entities/card-entity.js';
import type { TextureProvider } from '../entities/texture-provider.js';
import { buildCardZones } from './card-drop-zones.js';
import { paintCardHighlights, paintTableGlow } from './card-highlights.js';
import { layoutCardZone } from './card-layout.js';
import { cardFocusItems, cardHitTargets } from './card-picking.js';
import { handFan } from './layouts.js';

export interface CardLayerOptions {
  readonly layout: StageLayout;
  readonly theme: Theme;
  readonly textures: TextureProvider | null;
  readonly shadow: Container;
  readonly layer: Container;
  readonly stage: Container;
  readonly projector: () => Projector;
  readonly reducedMotion: boolean;
  readonly onCardDrop?: (result: DropResult) => void;
}

/** Capa de cartas con fan, zonas de mesa, volteo y arrastre global. */
export class CardLayer {
  private readonly options: CardLayerOptions;
  private readonly cards = new Map<string, CardEntity>();
  private readonly handCards = new Set<CardEntity>();
  private readonly ids = new Map<CardEntity, string>();
  private readonly pool: ObjectPool<CardEntity>;
  private readonly director: DragDirector;
  private readonly tableGlow = new Graphics();
  private handHidden = false;
  private dragging = false;
  private hovered: string | null = null;
  private drops: readonly DropHint[] = [];
  private canInteract = false;
  constructor(options: CardLayerOptions) {
    this.options = options;
    options.layer.addChild(this.tableGlow);
    this.pool = new ObjectPool<CardEntity>({
      initial: 24,
      max: 96,
      create: () => {
        const card = new CardEntity(options.layout.cardWidth, options.layout.cardHeight, options.shadow, options.theme, options.textures);
        card.on('pointerdown', this.onPointerDown);
        options.layer.addChild(card);
        return card;
      },
      reset: (card) => { card.deactivate(); card.setDropHighlight(false); },
      destroy: (card) => card.destroyVisual(),
    });
    this.director = new DragDirector({
      stage: options.stage,
      projector: options.projector,
      reducedMotion: options.reducedMotion,
      zones: () => this.zones(),
      hoverZone: (zone) => { this.hovered = zone?.id ?? null; this.paintHighlights(); },
      onPlay: (result) => { options.onCardDrop?.(result); },
      onDragEnd: () => { this.dragging = false; this.hovered = null; this.paintHighlights(); this.paintTableGlow(); },
    });
  }

  private readonly onPointerDown = (event: FederatedPointerEvent): void => {
    const entity = event.currentTarget as CardEntity;
    if (!this.canInteract || !this.handCards.has(entity)) return;
    const id = this.ids.get(entity);
    if (id === undefined) return;
    this.dragging = true;
    this.paintHighlights();
    this.paintTableGlow();
    this.director.begin(id, entity, { x: event.global.x, y: event.global.y });
  };

  render(hand: readonly CardSnapshot[], tableCards: readonly CardSnapshot[], drops: readonly DropHint[] = [], canInteract = false): void {
    const ids = new Set([...hand.map((card) => card.id), ...tableCards.map((card) => card.id)]);
    this.handCards.clear();
    this.drops = drops;
    this.canInteract = canInteract;
    for (const [id, entity] of this.cards) {
      if (ids.has(id)) continue;
      this.ids.delete(entity);
      this.pool.release(entity);
      this.cards.delete(id);
    }
    const slots = handFan(hand.length, this.options.layout);
    for (let index = 0; index < hand.length; index += 1) {
      const card = hand[index];
      const slot = slots[index];
      if (card === undefined) continue;
      const entity = this.ensure(card);
      if (slot !== undefined) entity.setFanSlot(0, this.options.layout.tableHalfHeight * 0.64, slot);
      entity.setCard(cardVisual(card), !this.options.reducedMotion);
      this.handCards.add(entity);
    }
    this.layoutZone(tableCards.filter((card) => card.zone === 'dealer'), -this.options.layout.tableHalfHeight * 0.3);
    this.layoutZone(tableCards.filter((card) => card.zone === 'table'), -this.options.layout.tableHalfHeight * 0.1);
    this.layoutZone(tableCards.filter((card) => card.zone === 'discard'), 0);
    this.applyHandVisibility();
    this.paintHighlights();
    this.paintTableGlow();
  }

  private ensure(card: CardSnapshot): CardEntity {
    let entity = this.cards.get(card.id);
    if (entity === undefined) {
      entity = this.pool.acquire();
      entity.activate();
      this.cards.set(card.id, entity);
      this.ids.set(entity, card.id);
    }
    return entity;
  }

  private layoutZone(cards: readonly CardSnapshot[], y: number): void {
    layoutCardZone(cards, y, this.options.layout, (card) => this.ensure(card), !this.options.reducedMotion);
  }

  private zones(): readonly DropZone[] {
    const projector = this.options.projector();
    const sources = [...this.cards].map(([cardId, entity]) => ({
      cardId,
      x: entity.tableX,
      y: entity.tableY,
      width: entity.entityWidth,
      height: entity.entityHeight,
      scale: entity.baseScale,
    }));
    return buildCardZones(sources, this.drops, (x, y) => {
      const point = projector.projectXYZ(x, y, 0);
      return { x: point.x, y: point.y, scale: point.scale };
    }, this.options.layout);
  }

  private paintHighlights(): void {
    paintCardHighlights(this.cards, this.drops, this.hovered, this.dragging);
  }

  private paintTableGlow(): void {
    paintTableGlow(this.tableGlow, this.options.layout, this.dragging, this.drops);
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
    return cardHitTargets(this.cards, this.options.layout.baseScale);
  }

  focusItems(projector: Projector): readonly FocusItem[] {
    return cardFocusItems(this.cards, projector);
  }

  get count(): number {
    return this.cards.size;
  }
  destroy(): void {
    this.director.dispose();
    for (const entity of this.cards.values()) {
      entity.off('pointerdown', this.onPointerDown);
      this.pool.release(entity);
    }
    this.cards.clear();
    this.ids.clear();
    this.handCards.clear();
    this.pool.clear();
    this.tableGlow.destroy();
  }
}

export function cardVisual(card: CardSnapshot): { rank: string; suit: string; deck: CardSnapshot['deck']; faceUp: boolean } {
  return { rank: card.label ?? card.rank, suit: card.suit, deck: card.deck, faceUp: card.faceUp };
}
