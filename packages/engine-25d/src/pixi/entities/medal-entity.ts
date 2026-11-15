import type { Theme } from '@mesa-viva/design-system';
import { Container, Graphics, Text } from 'pixi.js';
import { type GlossTier, glossForRank } from '../../entities/rank-gloss.js';

const TIER_COLORS: Readonly<Record<GlossTier, string>> = {
  oro: '#ffd54f',
  plata: '#cfd8dc',
  bronce: '#bcaaa4',
  satinado: '#80cbc4',
};

/** Medalla de rango con cinta, disco metálico y brillo por nivel. */
export class MedalEntity extends Container {
  private readonly graphic = new Graphics();
  private readonly rankText: Text;
  private readonly theme: Theme;
  private size = 64;
  private tier: GlossTier = 'satinado';

  constructor(size: number, theme: Theme) {
    super();
    this.theme = theme;
    this.rankText = new Text({
      text: '',
      style: { fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: '700', fill: theme.scheme['on-primary'] },
    });
    this.rankText.anchor.set(0.5);
    this.addChild(this.graphic, this.rankText);
    this.resize(size);
  }

  resize(size: number): void {
    this.size = Math.max(24, size);
    this.redraw();
  }

  setRank(rank: string): void {
    this.tier = glossForRank(rank, this.theme).tier;
    this.rankText.text = rank.slice(0, 1).toUpperCase();
    this.redraw();
  }

  private redraw(): void {
    const size = this.size;
    const half = size / 2;
    const color = TIER_COLORS[this.tier];
    const g = this.graphic.clear();
    g.poly([-half * 0.34, -half, 0, -half * 0.32, half * 0.34, -half])
      .fill({ color: this.theme.scheme.primary, alpha: 0.85 });
    g.poly([-half * 0.34, -half, 0, -half * 0.32, half * 0.34, -half])
      .stroke({ width: 2, color: this.theme.scheme['on-primary'], alpha: 0.6 });
    g.circle(0, half * 0.18, half * 0.78).fill(color).stroke({ width: 3, color: this.theme.scheme.surface, alpha: 0.9 });
    g.circle(0, half * 0.18, half * 0.56).stroke({ width: 2, color: this.theme.scheme['on-surface'], alpha: 0.3 });
    g.circle(-half * 0.22, half * 0.02, half * 0.12).fill({ color: '#ffffff', alpha: 0.45 });
    this.rankText.position.set(0, half * 0.18);
    this.rankText.style.fontSize = Math.max(10, half * 0.45);
  }
}
