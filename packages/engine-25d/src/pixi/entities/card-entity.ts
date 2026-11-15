import type { Theme } from '@mesa-viva/design-system';
import { gsap } from 'gsap';
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { glossForRank } from '../../entities/rank-gloss.js';
import type { CardDeck } from '../../state/snapshot.js';
import { cardAssetId } from './asset-id.js';
import { TableEntity } from './table-entity.js';
import type { TextureProvider } from './texture-provider.js';

const SUIT_GLYPHS: Readonly<Record<string, string>> = {
  corazones: '♥',
  diamantes: '♦',
  treboles: '♣',
  picas: '♠',
  oro: 'O',
  copa: 'C',
  espada: 'E',
  basto: 'B',
  rojo: '●',
  azul: '●',
  verde: '●',
  amarillo: '●',
  negro: '★',
};

const COLOR_VALUES: Readonly<Record<string, string>> = {
  rojo: '#e53935',
  azul: '#1e88e5',
  verde: '#43a047',
  amarillo: '#fdd835',
  negro: '#263238',
};

export interface CardVisual {
  readonly rank: string;
  readonly suit: string;
  readonly deck: CardDeck;
  readonly faceUp: boolean;
}

/** Carta 2.5D con volteo suave, abanico y brillo metálico por rango. */
export class CardEntity extends TableEntity {
  readonly visual = new Container();
  private readonly face = new Container();
  private readonly back = new Container();
  private readonly faceBase = new Graphics();
  private readonly gloss = new Graphics();
  private readonly art = new Sprite();
  private readonly rankText: Text;
  private readonly suitText: Text;
  private readonly backText: Text;
  private readonly theme: Theme;
  private readonly textures: TextureProvider | null;
  private faceUp = true;
  private flipTimeline: gsap.core.Timeline | null = null;

  constructor(width: number, height: number, shadowLayer: Container, theme: Theme, textures: TextureProvider | null) {
    super(width, height, shadowLayer);
    this.theme = theme;
    this.textures = textures;
    this.rankText = new Text({ text: '', style: { fontFamily: 'system-ui, sans-serif', fontSize: Math.round(width * 0.22), fontWeight: '700', fill: theme.scheme['on-surface'] } });
    this.suitText = new Text({ text: '', style: { fontFamily: 'system-ui, sans-serif', fontSize: Math.round(width * 0.3), fill: theme.scheme.primary } });
    this.backText = new Text({ text: 'MV', style: { fontFamily: 'Georgia, serif', fontSize: Math.round(width * 0.3), fontWeight: '700', fill: theme.scheme['on-primary-container'] } });
    this.art.anchor.set(0.5);
    this.face.addChild(this.faceBase, this.art, this.rankText, this.suitText, this.gloss);
    this.back.addChild(this.makeBack(), this.backText);
    this.visual.addChild(this.face, this.back);
    this.addChild(this.visual);
    this.face.visible = true;
    this.back.visible = false;
  }

  private makeBack(): Graphics {
    const width = this.entityWidth;
    const height = this.entityHeight;
    const graphic = new Graphics()
      .roundRect(-width / 2, -height / 2, width, height, width * 0.09)
      .fill(this.theme.scheme['primary-container'])
      .stroke({ width: 2, color: this.theme.scheme.primary, alpha: 0.8 });
    const step = width * 0.22;
    for (let y = -height / 2 + step; y < height / 2; y += step) {
      for (let x = -width / 2 + step; x < width / 2; x += step) {
        graphic.circle(x, y, width * 0.035).fill({ color: this.theme.scheme['on-primary-container'], alpha: 0.22 });
      }
    }
    return graphic;
  }

  override idleRotationDeg(): number {
    return this.fanRotationDeg;
  }

  setCard(card: CardVisual, animate = false): void {
    this.drawFace(card);
    if (this.faceUp !== card.faceUp) this.flip(card.faceUp, animate);
  }

  private drawFace(card: CardVisual): void {
    const width = this.entityWidth;
    const height = this.entityHeight;
    const gloss = glossForRank(card.rank, this.theme);
    const isRed = card.suit === 'corazones' || card.suit === 'diamantes' || card.suit === 'rojo';
    this.faceBase
      .clear()
      .roundRect(-width / 2, -height / 2, width, height, width * 0.09)
      .fill(gloss.base)
      .stroke({ width: 2, color: this.theme.scheme.outline, alpha: 0.55 });
    this.gloss
      .clear()
      .roundRect(-width / 2 + 2, -height / 2 + 2, width - 4, height * 0.28, width * 0.07)
      .fill({ color: gloss.highlight, alpha: gloss.sheenAlpha })
      .stroke({ width: 1, color: gloss.highlight, alpha: gloss.strokeAlpha * 0.4 });
    this.rankText.text = card.rank;
    this.rankText.style.fontSize = Math.round(width * 0.22);
    this.rankText.style.fill = isRed ? this.theme.scheme.error : this.theme.scheme['on-surface'];
    this.rankText.position.set(-width / 2 + width * 0.1, -height / 2 + height * 0.06);
    const glyph = SUIT_GLYPHS[card.suit] ?? card.suit.slice(0, 1).toUpperCase();
    this.suitText.text = glyph;
    this.suitText.style.fill = COLOR_VALUES[card.suit] ?? (isRed ? this.theme.scheme.error : this.theme.scheme.primary);
    this.suitText.anchor.set(0.5);
    this.suitText.position.set(0, height * 0.08);
    const texture = this.textures?.get(cardAssetId(card.deck, card.rank, card.suit)) ?? null;
    this.art.visible = texture !== null;
    this.faceBase.visible = texture === null;
    this.rankText.visible = texture === null;
    this.suitText.visible = texture === null;
    if (texture !== null) {
      this.art.texture = texture;
      const ratio = Math.min(width / texture.width, height / texture.height);
      this.art.width = texture.width * ratio;
      this.art.height = texture.height * ratio;
    }
    this.backText.anchor.set(0.5);
  }

  flip(faceUp: boolean, animate = true): void {
    this.faceUp = faceUp;
    this.flipTimeline?.kill();
    const apply = (): void => {
      this.face.visible = faceUp;
      this.back.visible = !faceUp;
    };
    if (!animate) {
      this.visual.scale.x = 1;
      apply();
      return;
    }
    this.visual.scale.x = 1;
    const timeline = gsap.timeline();
    timeline.to(this.visual.scale, { x: 0.04, duration: 0.11, ease: 'power2.in' });
    timeline.call(apply);
    timeline.to(this.visual.scale, { x: 1, duration: 0.16, ease: 'back.out(1.7)' });
    this.flipTimeline = timeline;
  }

  dealTo(x: number, y: number, delay = 0, duration = 0.32): void {
    gsap.to(this, { tableX: x, tableY: y, delay, duration, ease: 'power2.out' });
  }

  destroyVisual(): void {
    this.flipTimeline?.kill();
    gsap.killTweensOf(this);
    this.destroy();
  }
}
