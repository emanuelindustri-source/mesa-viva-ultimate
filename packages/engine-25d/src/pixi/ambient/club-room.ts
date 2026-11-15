import { blendHex, type Theme } from '@mesa-viva/design-system';
import { Container, Graphics } from 'pixi.js';
import type { StageLayout } from '../../layout/stage-layout.js';
import { drawRug, drawWallArt } from './club-room-detail.js';

interface Bokeh {
  readonly orb: Graphics;
  readonly x: number;
  readonly y: number;
  readonly phase: number;
  readonly speed: number;
}

const GARLAND_COLORS = ['#d7263d', '#f2c14e', '#2f9e44', '#1d6fb8', '#f4e6c1'];

/**
 * Salón de club procedural con profundidad: muro, molduras, candelabros,
 * guirnaldas festivas, luces cálidas y viñeta. Nunca un fondo negro plano.
 */
export class ClubRoom {
  readonly container = new Container();
  private readonly staticLayer = new Graphics();
  private readonly glowLayer = new Graphics();
  private readonly festiveLayer = new Graphics();
  private readonly bokeh: Bokeh[] = [];
  private width = 1;
  private height = 1;
  private elapsed = 0;
  private readonly reducedMotion: boolean;
  private readonly theme: Theme;

  constructor(layout: StageLayout, theme: Theme, reducedMotion: boolean) {
    this.theme = theme;
    this.reducedMotion = reducedMotion;
    this.container.addChild(this.staticLayer, this.festiveLayer, this.glowLayer);
    this.draw(layout);
    this.makeBokeh(layout);
  }

  private draw(layout: StageLayout): void {
    this.width = layout.width;
    this.height = layout.height;
    const g = this.staticLayer.clear();
    const dark = this.theme.mode === 'dark';
    const wallTop = dark ? '#100c0a' : '#3b2a1c';
    const wallBottom = dark ? '#241a13' : '#6c4a2d';
    const bands = 14;
    for (let index = 0; index < bands; index += 1) {
      const ratio = index / (bands - 1);
      g.rect(0, (this.height * index) / bands, this.width, this.height / bands + 1)
        .fill(blendHex(wallTop, wallBottom, ratio * 0.9));
    }
    this.drawArchitecture(g, dark);
    drawRug(g, this.width, this.height, this.theme);
    drawWallArt(g, this.width, this.height);
    this.drawChandeliers(g, dark);
    this.drawVignette(g);
  }

  private drawArchitecture(g: Graphics, dark: boolean): void {
    const w = this.width;
    const h = this.height;
    const panelY = h * 0.08;
    const panelH = h * 0.44;
    const gap = w * 0.035;
    const panelW = (w - gap * 5) / 4;
    for (let index = 0; index < 4; index += 1) {
      const x = gap + index * (panelW + gap);
      g.roundRect(x, panelY, panelW, panelH, 10).fill({ color: dark ? '#1a120d' : '#4a311f', alpha: 0.55 });
      g.roundRect(x + 5, panelY + 5, panelW - 10, panelH - 10, 8)
        .fill({ color: dark ? '#2a1c13' : '#6a472b', alpha: 0.55 })
        .stroke({ width: 1.4, color: this.theme.scheme.tertiary, alpha: 0.22 });
    }
    g.rect(0, h * 0.52, w, h * 0.1).fill({ color: dark ? '#0e0a07' : '#382517', alpha: 0.9 });
    g.rect(0, h * 0.52, w, 3).fill({ color: this.theme.scheme.tertiary, alpha: 0.28 });
    g.rect(0, h * 0.615, w, h * 0.02).fill({ color: dark ? '#1b120c' : '#4c3320', alpha: 0.85 });
    const archW = w * 0.16;
    for (const side of [0.045, 0.955]) {
      const x = w * side - archW / 2;
      g.roundRect(x, h * 0.11, archW, h * 0.34, archW / 2)
        .fill({ color: dark ? '#0b1622' : '#1e2d3d', alpha: 0.8 })
        .stroke({ width: 2, color: dark ? '#29465f' : '#b08a55', alpha: 0.55 });
      g.roundRect(x + 4, h * 0.115, archW - 8, h * 0.33, archW / 2)
        .fill({ color: dark ? '#0e2438' : '#38536b', alpha: 0.5 });
    }
  }

  private drawChandeliers(g: Graphics, dark: boolean): void {
    const w = this.width;
    const h = this.height;
    const lamp = dark ? '#ffca7a' : '#ffe0a3';
    for (const [x, y, scale] of [[w * 0.5, h * 0.06, 1], [w * 0.22, h * 0.1, 0.65], [w * 0.78, h * 0.1, 0.65]] as const) {
      g.moveTo(x, 0).lineTo(x, y - 18 * scale).stroke({ width: 2, color: '#8a6a3a', alpha: 0.7 });
      g.circle(x, y, 7 * scale).fill('#b89152');
      for (let index = -3; index <= 3; index += 1) {
        const angle = (index / 3) * 0.9;
        const cx = x + Math.sin(angle) * 34 * scale;
        const cy = y + Math.cos(angle) * 10 * scale;
        g.circle(cx, cy - 6 * scale, 3.6 * scale).fill(lamp);
        g.circle(cx, cy - 6 * scale, 7 * scale).fill({ color: lamp, alpha: 0.16 });
      }
    }
  }

  private drawVignette(g: Graphics): void {
    const w = this.width;
    const h = this.height;
    const bands = 8;
    for (let index = 0; index < bands; index += 1) {
      const alpha = 0.055 * (1 - index / bands);
      const inset = (index / bands) * Math.min(w, h) * 0.16;
      g.rect(0, 0, w, inset + 2).fill({ color: '#000000', alpha });
      g.rect(0, h - inset - 2, w, inset + 2).fill({ color: '#000000', alpha });
      g.rect(0, 0, inset + 2, h).fill({ color: '#000000', alpha });
      g.rect(w - inset - 2, 0, inset + 2, h).fill({ color: '#000000', alpha });
    }
  }

  private makeBokeh(layout: StageLayout): void {
    const count = this.reducedMotion ? 10 : 18;
    for (let index = 0; index < count; index += 1) {
      const radius = 3 + (index % 5) * 2.6;
      const orb = new Graphics()
        .circle(0, 0, radius)
        .fill({ color: index % 3 === 0 ? this.theme.scheme.tertiary : '#ffcf87', alpha: 0.14 })
        .circle(-radius * 0.3, -radius * 0.3, radius * 0.45)
        .fill({ color: '#ffffff', alpha: 0.12 });
      this.glowLayer.addChild(orb);
      this.bokeh.push({
        orb,
        x: (index * 137.5) % layout.width,
        y: layout.height * (0.12 + ((index * 61) % 52) / 100),
        phase: (index * 1.7) % (Math.PI * 2),
        speed: 0.12 + (index % 4) * 0.05,
      });
    }
  }

  drawFestive(): void {
    const g = this.festiveLayer.clear();
    const theme = this.theme;
    if (theme.festive === null && theme.holidayId === 'dia-normal') return;
    const w = this.width;
    const h = this.height;
    const accent = theme.festive?.accent ?? theme.scheme.tertiary;
    g.moveTo(0, h * 0.055);
    g.quadraticCurveTo(w * 0.5, h * 0.13, w, h * 0.055);
    g.stroke({ width: 3, color: accent, alpha: 0.65 });
    const count = 22;
    for (let index = 0; index < count; index += 1) {
      const t = index / (count - 1);
      const x = t * w;
      const curve = Math.sin(t * Math.PI) * h * 0.075;
      const y = h * 0.055 + curve;
      const color = index % 5 === 0 ? accent : GARLAND_COLORS[index % GARLAND_COLORS.length] ?? accent;
      g.moveTo(x - 13, y).lineTo(x + 13, y).lineTo(x, y + 26 + (index % 3) * 6).closePath()
        .fill({ color, alpha: 0.72 });
    }
    g.ellipse(w * 0.5, h * 1.02, w * 0.3, h * 0.16).fill({ color: accent, alpha: 0.08 });
  }

  update(dtSeconds: number, parallaxX: number, parallaxY: number): void {
    if (this.reducedMotion) return;
    this.elapsed += dtSeconds;
    for (const item of this.bokeh) {
      const drift = Math.sin(this.elapsed * item.speed + item.phase) * 18;
      item.orb.position.set(
        item.x + drift + parallaxX * 0.12,
        item.y + Math.cos(this.elapsed * item.speed * 0.8 + item.phase) * 12 + parallaxY * 0.1,
      );
      item.orb.alpha = 0.6 + Math.sin(this.elapsed * 0.9 + item.phase) * 0.4;
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
