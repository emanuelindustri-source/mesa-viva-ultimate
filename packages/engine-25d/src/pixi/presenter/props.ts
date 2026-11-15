import type { Theme } from '@mesa-viva/design-system';
import type { Container } from 'pixi.js';
import type { Projector } from '../../camera/projector.js';
import type { StageLayout } from '../../layout/stage-layout.js';
import { ObjectPool } from '../../pool/object-pool.js';
import type { TableSnapshot } from '../../state/snapshot.js';
import { ChipEntity } from '../entities/chip-entity.js';
import { DiceEntity } from '../entities/dice-entity.js';
import { TokenEntity } from '../entities/token-entity.js';
import type { StageLayers } from './layers.js';

/** Fichas, dados y peones: entidades simples con pooling propio. */
export class PropPresenter {
  private readonly theme: Theme;
  private readonly chipPool: ObjectPool<ChipEntity>;
  private readonly dicePool: ObjectPool<DiceEntity>;
  private readonly tokenPool: ObjectPool<TokenEntity>;
  private readonly chips = new Map<string, ChipEntity>();
  private readonly dice = new Map<string, DiceEntity>();
  private readonly tokens = new Map<string, TokenEntity>();
  private readonly rolledDice = new Set<string>();
  private readonly diceFaces = new Map<string, number>();
  private readonly reducedMotion: boolean;

  constructor(layers: StageLayers, layout: StageLayout, theme: Theme, reducedMotion: boolean) {
    this.theme = theme;
    this.reducedMotion = reducedMotion;
    const shadow = layers.shadow;
    this.chipPool = this.makePool<ChipEntity>(
      () => new ChipEntity(layout.cardWidth * 0.92, shadow, theme),
      (entity) => entity.deactivate(),
      (entity) => entity.destroy(),
      layers.chips,
      12,
      36,
    );
    this.dicePool = this.makePool<DiceEntity>(
      () => new DiceEntity(Math.max(70, layout.cardWidth * 1.35), shadow, theme),
      (entity) => entity.deactivate(),
      (entity) => entity.destroyVisual(),
      layers.tokens,
      4,
      12,
    );
    this.tokenPool = this.makePool<TokenEntity>(
      () => new TokenEntity(layout.cardWidth * 0.55, shadow, theme),
      (entity) => entity.deactivate(),
      (entity) => entity.destroyVisual(),
      layers.tokens,
      8,
      32,
    );
  }

  private makePool<T extends Container>(
    create: () => T,
    reset: (item: T) => void,
    destroy: (item: T) => void,
    layer: Container,
    initial: number,
    max: number,
  ): ObjectPool<T> {
    return new ObjectPool<T>({
      initial,
      max,
      create: () => {
        const item = create();
        layer.addChild(item);
        return item;
      },
      reset,
      destroy,
    });
  }

  render(snapshot: TableSnapshot): void {
    this.renderChips(snapshot);
    this.renderDice(snapshot);
    this.renderTokens(snapshot);
  }

  private renderChips(snapshot: TableSnapshot): void {
    const ids = new Set(snapshot.chips.map((chip) => chip.id));
    for (const [id, entity] of this.chips) {
      if (ids.has(id)) continue;
      this.chipPool.release(entity);
      this.chips.delete(id);
    }
    for (const chip of snapshot.chips) {
      let entity = this.chips.get(chip.id);
      if (entity === undefined) {
        entity = this.chipPool.acquire();
        entity.activate();
        this.chips.set(chip.id, entity);
      }
      entity.setAmount(chip.amount, this.theme.scheme.primary);
      entity.setTablePosition(chip.x, chip.y);
    }
  }

  private renderDice(snapshot: TableSnapshot): void {
    const ids = new Set(snapshot.dice.map((die) => die.id));
    for (const [id, entity] of this.dice) {
      if (ids.has(id)) continue;
      this.dicePool.release(entity);
      this.dice.delete(id);
      this.rolledDice.delete(id);
      this.diceFaces.delete(id);
    }
    for (const die of snapshot.dice) {
      let entity = this.dice.get(die.id);
      if (entity === undefined) {
        entity = this.dicePool.acquire();
        entity.activate();
        this.dice.set(die.id, entity);
      }
      entity.setTablePosition(die.x, die.y);
      const previous = this.diceFaces.get(die.id);
      if (!this.rolledDice.has(die.id) || (previous !== undefined && previous !== die.face)) {
        entity.setFace(die.face);
        entity.rollTo(die.face, hashId(`${die.id}-${die.face}`), this.reducedMotion);
        this.rolledDice.add(die.id);
      }
      this.diceFaces.set(die.id, die.face);
    }
  }

  private renderTokens(snapshot: TableSnapshot): void {
    const ids = new Set(snapshot.tokens.map((token) => token.id));
    for (const [id, entity] of this.tokens) {
      if (ids.has(id)) continue;
      this.tokenPool.release(entity);
      this.tokens.delete(id);
    }
    for (const token of snapshot.tokens) {
      let entity = this.tokens.get(token.id);
      if (entity === undefined) {
        entity = this.tokenPool.acquire();
        entity.activate();
        this.tokens.set(token.id, entity);
      }
      entity.setToken(token);
      entity.setTablePosition(token.x, token.y);
    }
  }

  sync(projector: Projector): void {
    for (const entity of this.chips.values()) entity.sync(projector);
    for (const entity of this.dice.values()) entity.sync(projector);
    for (const entity of this.tokens.values()) entity.sync(projector);
  }

  get counts(): { chips: number; dice: number; tokens: number } {
    return { chips: this.chips.size, dice: this.dice.size, tokens: this.tokens.size };
  }

  destroy(): void {
    for (const entity of this.chips.values()) this.chipPool.release(entity);
    for (const entity of this.dice.values()) this.dicePool.release(entity);
    for (const entity of this.tokens.values()) this.tokenPool.release(entity);
    this.chips.clear();
    this.dice.clear();
    this.tokens.clear();
    this.chipPool.clear();
    this.dicePool.clear();
    this.tokenPool.clear();
  }
}

function hashId(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  return hash;
}
