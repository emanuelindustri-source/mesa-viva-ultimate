import { blendHex, type Theme } from '@mesa-viva/design-system';
import { Container, Graphics, Sprite } from 'pixi.js';
import type { Projector } from '../../camera/projector.js';
import type { StageLayout } from '../../layout/stage-layout.js';
import { shadowTexture } from '../entities/shadow.js';

/** Tapete, borde, bisagra y luz reactiva al giroscopio. */
export class TableFelt {
  readonly container = new Container();
  private readonly felt = new Graphics();
  private readonly light = new Sprite(shadowTexture());
  private readonly theme: Theme;
  private readonly width: number;
  private readonly height: number;

  constructor(layout: StageLayout, projector: Projector, theme: Theme) {
    this.theme = theme;
    this.width = layout.width;
    this.height = layout.height;
    this.light.anchor.set(0.5);
    this.light.tint = 0xffffff;
    this.light.alpha = 0.1;
    this.light.width = layout.width * 0.72;
    this.light.height = layout.height * 0.52;
    this.container.addChild(this.felt, this.light);
    this.draw(layout, projector);
  }

  private draw(layout: StageLayout, projector: Projector): void {
    const g = this.felt.clear();
    g.rect(0, 0, layout.width, layout.height).fill(this.theme.scheme.background);
    const polygon = projector.tablePolygon(layout.tableHalfWidth, layout.tableHalfHeight);
    const feltColor = blendHex(this.theme.scheme.primary, this.theme.scheme.background, 0.58);
    this.drawPolygon(g, polygon, 0, 22, 0x000000, 0.28);
    this.drawPolygon(g, polygon, 0, 0, feltColor, 1);
    this.drawPolygon(g, polygon, 0, 0, this.theme.festive?.accent ?? this.theme.scheme.tertiary, 0.22, 5);
    g.circle(layout.centerX, layout.centerY - 8, Math.min(layout.width, layout.height) * 0.16)
      .fill({ color: this.theme.scheme['primary-container'], alpha: 0.22 })
      .stroke({ width: 3, color: this.theme.scheme.primary, alpha: 0.28 });
    if (layout.panes.length > 1) {
      const hinge = layout.hinge;
      if (hinge?.orientation === 'horizontal') {
        const y = layout.panes[0] === undefined ? layout.height / 2 : layout.panes[0].height;
        g.rect(0, y, layout.width, hinge.size).fill({ color: this.theme.scheme.background, alpha: 0.96 });
      } else {
        const x = layout.panes[0]?.width ?? layout.width / 2;
        const size = hinge?.size ?? 24;
        g.rect(x, 0, size, layout.height).fill({ color: this.theme.scheme.background, alpha: 0.96 });
      }
    }
    this.light.position.set(layout.centerX, layout.centerY);
  }

  private drawPolygon(
    g: Graphics,
    points: readonly { x: number; y: number }[],
    offsetX: number,
    offsetY: number,
    color: string | number,
    alpha: number,
    width = 0,
  ): void {
    const first = points[0];
    if (first === undefined) return;
    g.moveTo(first.x + offsetX, first.y + offsetY);
    for (let index = 1; index < points.length; index += 1) {
      const point = points[index];
      if (point !== undefined) g.lineTo(point.x + offsetX, point.y + offsetY);
    }
    g.closePath();
    if (width > 0) g.stroke({ width, color, alpha });
    else g.fill({ color, alpha });
  }

  updateLight(parallaxX: number, parallaxY: number): void {
    this.light.position.set(this.width / 2 + parallaxX * 0.6, this.height / 2 + parallaxY * 0.6);
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
