import { blendHex, type Theme } from '@mesa-viva/design-system';
import { Container, Graphics, Sprite } from 'pixi.js';
import type { Projector } from '../../camera/projector.js';
import type { StageLayout } from '../../layout/stage-layout.js';
import { ClubRoom } from '../ambient/club-room.js';
import { shadowTexture } from '../entities/shadow.js';

interface ScreenPoint { x: number; y: number; }

/** Mesa ovalada de nogal con bisel, filete dorado y tapete de fieltro texturizado. */
export class TableFelt {
  readonly container = new Container();
  private readonly table = new Graphics();
  private readonly topLight = new Sprite(shadowTexture());
  private readonly ambient: ClubRoom;
  private readonly theme: Theme;
  private readonly width: number;
  private readonly height: number;

  constructor(layout: StageLayout, projector: Projector, theme: Theme, reducedMotion = false) {
    this.theme = theme;
    this.width = layout.width;
    this.height = layout.height;
    this.ambient = new ClubRoom(layout, theme, reducedMotion);
    this.ambient.container.addChild(this.table);
    this.ambient.drawFestive();
    this.topLight.anchor.set(0.5);
    this.topLight.tint = 0xffffff;
    this.topLight.alpha = 0.12;
    this.topLight.width = layout.width * 0.6;
    this.topLight.height = layout.height * 0.4;
    this.ambient.container.addChild(this.topLight);
    this.container.addChild(this.ambient.container);
    this.draw(layout, projector);
  }

  private draw(layout: StageLayout, projector: Projector): void {
    const g = this.table.clear();
    const rx = layout.tableHalfWidth;
    const ry = layout.tableHalfHeight;
    const woodDark = blendHex('#2b170c', this.theme.scheme.background, 0.22);
    const wood = this.theme.mode === 'dark' ? '#6b3f22' : '#8a532b';
    const woodLight = blendHex(wood, '#f0c07a', 0.45);
    const gold = blendHex(this.theme.festive?.accent ?? this.theme.scheme.tertiary, '#f5cf6a', 0.85);
    const felt = blendHex('#0f5a3e', this.theme.scheme.primary, this.theme.mode === 'dark' ? 0.16 : 0.24);
    const feltLight = blendHex(felt, '#ffffff', 0.14);
    const shadow = projectEllipse(projector, rx + 90, ry + 78, 0, 34);
    fillPolygon(g, shadow, 0x000000, 0.42);
    const apron = projectEllipse(projector, rx + 40, ry + 36, 0, 22);
    fillPolygon(g, apron, woodDark, 1);
    const rim = projectEllipse(projector, rx + 34, ry + 32, 0, 0);
    fillPolygon(g, rim, wood, 1);
    strokePolygon(g, rim, woodLight, 0.55, 3);
    const grain = projectEllipse(projector, rx + 12, ry + 11, 0, 0);
    strokePolygon(g, grain, woodDark, 0.35, 1.4);
    const fillet = projectEllipse(projector, rx - 2, ry - 2, 0, 0);
    strokePolygon(g, fillet, gold, 0.95, 5);
    const filletInner = projectEllipse(projector, rx - 12, ry - 11, 0, 0);
    strokePolygon(g, filletInner, blendHex(gold, '#ffffff', 0.4), 0.55, 1.6);
    const feltOuter = projectEllipse(projector, rx - 22, ry - 20, 0, 0);
    fillPolygon(g, feltOuter, blendHex(felt, '#000000', 0.35), 1);
    const feltPoly = projectEllipse(projector, rx - 30, ry - 27, 0, 0);
    fillPolygon(g, feltPoly, felt, 1);
    const innerGlow = projectEllipse(projector, rx - 48, ry - 43, 0, 0);
    fillPolygon(g, innerGlow, feltLight, 0.22);
    const softLight = projectEllipse(projector, rx - 78, ry - 70, 0, 0);
    fillPolygon(g, softLight, blendHex(felt, '#ffffff', 0.22), 0.13);
    const border = projectEllipse(projector, rx - 34, ry - 31, 0, 0);
    strokePolygon(g, border, gold, 0.35, 1.2);
    this.drawWeave(g, projector, rx - 44, ry - 40, felt);
    const medallion = projectEllipse(projector, Math.min(rx, ry) * 0.24, Math.min(rx, ry) * 0.2, 0, 0);
    strokePolygon(g, medallion, gold, 0.22, 1.6);
    const medallion2 = projectEllipse(projector, Math.min(rx, ry) * 0.2, Math.min(rx, ry) * 0.16, 0, 0);
    strokePolygon(g, medallion2, gold, 0.16, 1);
    this.drawCrest(g, projector, Math.min(rx, ry) * 0.1, gold);
    this.topLight.position.set(layout.centerX, layout.centerY - layout.height * 0.05);
  }

  private drawWeave(g: Graphics, projector: Projector, rx: number, ry: number, felt: string): void {
    const dotColor = blendHex(felt, '#ffffff', 0.5);
    for (let row = -10; row <= 10; row += 1) {
      for (let column = -14; column <= 14; column += 1) {
        const nx = column / 14;
        const ny = row / 10;
        const distance = nx * nx + ny * ny;
        if (distance > 0.9) continue;
        const point = projector.projectXYZ(nx * rx, ny * ry, 0);
        g.circle(point.x, point.y, 1).fill({ color: dotColor, alpha: 0.15 });
      }
    }
    for (let index = 1; index <= 4; index += 1) {
      const ring = projectEllipse(projector, rx * (0.2 + index * 0.18), ry * (0.2 + index * 0.18), 0, 0);
      strokePolygon(g, ring, dotColor, 0.05, 1);
    }
  }

  private drawCrest(g: Graphics, projector: Projector, size: number, gold: string): void {
    const center = projector.projectXYZ(0, 0, 0);
    g.moveTo(center.x, center.y - size * 0.55)
      .lineTo(center.x + size * 0.45, center.y)
      .lineTo(center.x, center.y + size * 0.55)
      .lineTo(center.x - size * 0.45, center.y)
      .closePath()
      .stroke({ width: 1.6, color: gold, alpha: 0.28 });
    g.circle(center.x, center.y, size * 0.16).stroke({ width: 1.4, color: gold, alpha: 0.32 });
    g.circle(center.x, center.y, size * 0.05).fill({ color: gold, alpha: 0.3 });
  }

  updateLight(parallaxX: number, parallaxY: number): void {
    this.topLight.position.set(this.width / 2 + parallaxX * 0.6, this.height / 2 + parallaxY * 0.6 - this.height * 0.05);
  }

  update(dtSeconds: number, parallaxX: number, parallaxY: number): void {
    this.ambient.update(dtSeconds, parallaxX, parallaxY);
  }

  destroy(): void {
    this.ambient.destroy();
  }
}

function projectEllipse(projector: Projector, rx: number, ry: number, ox: number, oy: number): ScreenPoint[] {
  const points: ScreenPoint[] = [];
  const steps = 72;
  for (let index = 0; index < steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2;
    const point = projector.projectXYZ(Math.cos(angle) * rx + ox, Math.sin(angle) * ry + oy, 0);
    points.push({ x: point.x, y: point.y });
  }
  return points;
}

function fillPolygon(g: Graphics, points: readonly ScreenPoint[], color: string | number, alpha: number): void {
  const first = points[0];
  if (first === undefined) return;
  g.moveTo(first.x, first.y);
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    if (point !== undefined) g.lineTo(point.x, point.y);
  }
  g.closePath();
  g.fill({ color, alpha });
}

function strokePolygon(g: Graphics, points: readonly ScreenPoint[], color: string | number, alpha: number, width: number): void {
  const first = points[0];
  if (first === undefined) return;
  g.moveTo(first.x, first.y);
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    if (point !== undefined) g.lineTo(point.x, point.y);
  }
  g.closePath();
  g.stroke({ width, color, alpha });
}
