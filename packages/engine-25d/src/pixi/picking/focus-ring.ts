import { Graphics } from 'pixi.js';

export interface FocusBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export class FocusRing extends Graphics {
  private readonly color: string | number;

  constructor(color: string | number) {
    super();
    this.color = color;
    this.visible = false;
    this.eventMode = 'none';
  }

  show(bounds: FocusBounds): void {
    this.clear()
      .roundRect(bounds.x - bounds.width / 2 - 6, bounds.y - bounds.height / 2 - 6, bounds.width + 12, bounds.height + 12, 10)
      .stroke({ width: 4, color: this.color, alpha: 0.95 });
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }
}
