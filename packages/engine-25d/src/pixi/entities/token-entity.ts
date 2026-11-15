import type { Theme } from '@mesa-viva/design-system';
import { gsap } from 'gsap';
import { type Container, Graphics } from 'pixi.js';
import type { TokenSnapshot } from '../../state/snapshot.js';
import { TableEntity } from './table-entity.js';

/** Peón/piedra para Ludo, Ajedrez, Damas y Go. */
export class TokenEntity extends TableEntity {
  private readonly graphic = new Graphics();
  private readonly theme: Theme;
  private kind: TokenSnapshot['kind'] = 'peon';
  private color = '#e53935';

  constructor(size: number, shadowLayer: Container, theme: Theme) {
    super(size, size, shadowLayer);
    this.theme = theme;
    this.addChild(this.graphic);
    this.draw();
  }

  setToken(token: Pick<TokenSnapshot, 'kind' | 'color'>): void {
    this.kind = token.kind;
    this.color = token.color;
    this.draw();
  }

  moveTo(x: number, y: number, height = 40): void {
    const jump = { t: 0 };
    gsap.killTweensOf(this);
    gsap.killTweensOf(jump);
    gsap.to(this, { tableX: x, tableY: y, duration: 0.3, ease: 'power2.inOut' });
    gsap.to(jump, {
      t: 1,
      duration: 0.42,
      ease: 'none',
      onUpdate: () => this.setElevation(Math.sin(jump.t * Math.PI) * height),
      onComplete: () => this.setElevation(0),
    });
  }

  private draw(): void {
    const size = this.entityWidth;
    const half = size / 2;
    const g = this.graphic.clear();
    if (this.kind === 'piedra') {
      g.circle(0, 0, half * 0.82).fill(this.color).stroke({ width: 2, color: this.theme.scheme['on-surface'], alpha: 0.35 });
      g.circle(-half * 0.22, -half * 0.24, half * 0.2).fill({ color: '#ffffff', alpha: 0.35 });
      return;
    }
    if (this.kind === 'ficha') {
      g.circle(0, 0, half).fill(this.color).stroke({ width: 2, color: this.theme.scheme.surface, alpha: 0.8 });
      g.circle(0, 0, half * 0.62).stroke({ width: 2, color: this.theme.scheme.surface, alpha: 0.5 });
      return;
    }
    g.ellipse(0, half * 0.62, half * 0.78, half * 0.22).fill({ color: this.theme.scheme.shadow, alpha: 0.28 });
    g.roundRect(-half * 0.5, -half * 0.05, size * 0.5, half * 0.82, half * 0.2).fill(this.color);
    g.circle(0, -half * 0.42, half * 0.36).fill(this.color);
    g.circle(-half * 0.12, -half * 0.52, half * 0.1).fill({ color: '#ffffff', alpha: 0.35 });
  }

  destroyVisual(): void {
    gsap.killTweensOf(this);
    this.destroy();
  }
}
