import type { Theme } from '@mesa-viva/design-system';
import { type Container, Graphics, Text } from 'pixi.js';
import { chipStackLayout, dominantChipColor } from '../../entities/chips.js';
import { TableEntity } from './table-entity.js';

/** Pila de fichas virtuales sin valor monetario. */
export class ChipEntity extends TableEntity {
  private readonly graphic = new Graphics();
  private readonly amountLabel: Text;
  private readonly theme: Theme;
  private amount = 0;
  private widthPerStack = 30;

  constructor(width: number, shadowLayer: Container, theme: Theme) {
    super(width, width * 1.2, shadowLayer);
    this.theme = theme;
    this.amountLabel = new Text({
      text: '',
      style: { fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: '700', fill: theme.scheme['on-surface'] },
    });
    this.amountLabel.anchor.set(0.5, 1);
    this.addChild(this.graphic, this.amountLabel);
  }

  setAmount(amount: number, fallbackColor = this.theme.scheme.primary): void {
    this.amount = Math.max(0, Math.floor(amount));
    this.widthPerStack = Math.max(18, this.entityWidth * 0.5);
    this.draw(dominantChipColor(chipStackLayout(this.amount), fallbackColor));
  }

  private draw(dominant: string): void {
    const layout = chipStackLayout(this.amount, { maxPerStack: 8, spacing: this.widthPerStack, chipHeight: 4 });
    const g = this.graphic.clear();
    for (const stack of layout.stacks) {
      for (let index = 0; index < stack.count; index += 1) {
        const y = -index * 4;
        g.ellipse(stack.x * 0.5, y, this.entityWidth * 0.32, this.entityHeight * 0.09)
          .fill(stack.denomination.color)
          .stroke({ width: 1, color: stack.denomination.rim, alpha: 0.8 });
      }
    }
    if (layout.stacks.length === 0) {
      g.ellipse(0, 0, this.entityWidth * 0.32, this.entityHeight * 0.09).fill({ color: dominant, alpha: 0.3 });
    }
    this.amountLabel.text = this.amount > 0 ? String(this.amount) : '';
    this.amountLabel.position.set(0, this.entityHeight * 0.42);
  }

  setLabelVisible(visible: boolean): void {
    this.amountLabel.visible = visible;
  }
}
