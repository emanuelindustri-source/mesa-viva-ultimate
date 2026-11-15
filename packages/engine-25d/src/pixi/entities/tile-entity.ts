import type { Theme } from '@mesa-viva/design-system';
import { gsap } from 'gsap';
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { dominoPips } from '../../entities/domino-pips.js';
import type { TileSnapshot } from '../../state/snapshot.js';
import { tileAssetId } from './asset-id.js';
import { TableEntity } from './table-entity.js';
import type { TextureProvider } from './texture-provider.js';

/** Ficha de dominó/Mahjong con grosor, pips y volteo 2.5D. */
export class TileEntity extends TableEntity {
  readonly visual = new Container();
  private readonly thickness = new Graphics();
  private readonly faceBase = new Graphics();
  private readonly pips = new Graphics();
  private readonly art = new Sprite();
  private readonly valueText: Text;
  private readonly theme: Theme;
  private readonly textures: TextureProvider | null;
  private faceUp = true;
  private orientation: 'horizontal' | 'vertical' = 'horizontal';
  private a = 0;
  private b = 0;
  private flipTimeline: gsap.core.Timeline | null = null;

  constructor(width: number, height: number, shadowLayer: Container, theme: Theme, textures: TextureProvider | null) {
    super(width, height, shadowLayer);
    this.theme = theme;
    this.textures = textures;
    this.valueText = new Text({
      text: '',
      style: { fontFamily: 'system-ui, sans-serif', fontSize: Math.round(height * 0.24), fill: theme.scheme['on-surface'], fontWeight: '600' },
    });
    this.valueText.anchor.set(0.5);
    this.valueText.position.set(0, height * 0.34);
    this.art.anchor.set(0.5);
    this.visual.addChild(this.thickness, this.faceBase, this.art, this.pips, this.valueText);
    this.addChild(this.visual);
  }

  setTile(tile: TileSnapshot, animate = false): void {
    this.a = tile.a;
    this.b = tile.b;
    this.orientation = tile.orientation;
    this.drawFace();
    if (this.faceUp !== tile.faceUp) this.setFaceUp(tile.faceUp, animate);
  }

  setFaceUp(faceUp: boolean, animate = true): void {
    this.faceUp = faceUp;
    this.flipTimeline?.kill();
    const apply = (): void => {
      this.faceBase.visible = faceUp;
      this.pips.visible = faceUp;
      this.valueText.visible = false;
      this.art.visible = faceUp && this.art.texture.width > 1;
      this.thickness.visible = true;
    };
    if (!animate) {
      this.visual.scale.x = 1;
      apply();
      return;
    }
    const timeline = gsap.timeline();
    timeline.to(this.visual.scale, { x: 0.04, duration: 0.1, ease: 'power2.in' });
    timeline.call(apply);
    timeline.to(this.visual.scale, { x: 1, duration: 0.15, ease: 'back.out(1.6)' });
    this.flipTimeline = timeline;
  }

  setOrientation(orientation: 'horizontal' | 'vertical'): void {
    this.orientation = orientation;
    this.visual.rotation = orientation === 'vertical' ? Math.PI / 2 : 0;
  }

  private drawFace(): void {
    const width = this.entityWidth;
    const height = this.entityHeight;
    const radius = Math.max(3, height * 0.12);
    this.thickness
      .clear()
      .roundRect(-width / 2 + 3, -height / 2 + 4, width, height, radius)
      .fill(this.theme.scheme['surface-container-highest'])
      .stroke({ width: 1, color: this.theme.scheme.shadow, alpha: 0.4 });
    this.faceBase
      .clear()
      .roundRect(-width / 2, -height / 2, width, height, radius)
      .fill(this.theme.scheme.surface)
      .stroke({ width: 2, color: this.theme.scheme['outline-variant'] });
    this.faceBase.rect(-1, -height / 2 + 3, 2, height - 6).fill({ color: this.theme.scheme.outline, alpha: 0.5 });
    this.pips.clear();
    this.drawHalf(this.a, -width / 4);
    this.drawHalf(this.b, width / 4);
    const texture = this.textures?.get(tileAssetId(this.a, this.b)) ?? null;
    this.art.visible = this.faceUp && texture !== null;
    this.faceBase.visible = this.faceUp && texture === null;
    this.pips.visible = this.faceUp && texture === null;
    if (texture !== null) {
      this.art.texture = texture;
      const ratio = Math.min(width / texture.width, height / texture.height);
      this.art.width = texture.width * ratio;
      this.art.height = texture.height * ratio;
    }
    this.setOrientation(this.orientation);
  }

  private drawHalf(value: number, offsetX: number): void {
    const width = this.entityWidth / 2;
    const height = this.entityHeight;
    const radius = Math.max(1.5, Math.min(width, height) * 0.035);
    for (const pip of dominoPips(value)) {
      this.pips.circle(offsetX - width / 2 + pip.x * width, -height / 2 + pip.y * height, radius).fill(this.theme.scheme['on-surface']);
    }
  }

  destroyVisual(): void {
    this.flipTimeline?.kill();
    gsap.killTweensOf(this);
    this.destroy();
  }
}
