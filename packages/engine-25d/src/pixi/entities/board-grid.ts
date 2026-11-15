import type { Theme } from '@mesa-viva/design-system';
import { Container, Graphics } from 'pixi.js';
import type { Projector } from '../../camera/projector.js';
import { cellCenter, createGridLayout } from '../../entities/board-layout.js';
import type { BoardKind } from '../../state/snapshot.js';
import { ShadowView } from './shadow.js';

const DARK = 0x2f3e46;

/** Tablero de casillas con volumen 2.5D para ajedrez, damas, Go y Ludo. */
export class BoardGrid extends Container {
  private readonly graphic = new Graphics();
  private readonly shadow: ShadowView;
  private readonly theme: Theme;
  private kind: BoardKind = 'ajedrez';
  private rows = 8;
  private columns = 8;
  private size = 480;
  private highlighted: readonly string[] = [];
  private tableX = 0;
  private tableY = 0;
  private readonly projected = { x: 0, y: 0, scale: 1, depth: 0 };

  constructor(size: number, theme: Theme, shadowLayer: Container) {
    super();
    this.theme = theme;
    this.shadow = new ShadowView();
    shadowLayer.addChild(this.shadow);
    this.addChild(this.graphic);
    this.resizeBoard(size);
  }

  resizeBoard(size: number): void {
    this.size = Math.max(120, Math.round(size));
    this.redraw();
  }

  setBoard(kind: BoardKind, rows: number, columns: number, highlighted: readonly string[] = []): void {
    this.kind = kind;
    this.rows = Math.max(1, Math.min(24, Math.round(rows || 8)));
    this.columns = Math.max(1, Math.min(24, Math.round(columns || 8)));
    this.highlighted = highlighted;
    this.redraw();
  }

  setTablePosition(x: number, y: number): void {
    this.tableX = x;
    this.tableY = y;
  }

  setRotationDeg(degrees: number): void {
    this.rotation = (degrees * Math.PI) / 180;
  }

  sync(projector: Projector): void {
    projector.projectXYZ(this.tableX, this.tableY, 0, this.projected);
    this.position.set(this.projected.x, this.projected.y);
    this.scale.set(1);
    this.shadow.place(this.projected.x, this.projected.y + this.size * 0.18, this.size * 1.08, this.size * 0.42, 0.34);
    this.shadow.visible = this.visible;
  }

  private redraw(): void {
    const g = this.graphic.clear();
    const size = this.size;
    const radius = size * 0.035;
    g.roundRect(-size / 2 + 4, -size / 2 + 8, size, size, radius)
      .fill({ color: this.theme.scheme.shadow, alpha: 0.25 });
    g.roundRect(-size / 2, -size / 2, size, size, radius)
      .fill(this.kind === 'go' ? this.theme.scheme['tertiary-container'] : this.theme.scheme['surface-container-high'])
      .stroke({ width: 3, color: this.theme.scheme.outline, alpha: 0.7 });
    if (this.kind === 'ajedrez' || this.kind === 'damas' || this.kind === 'ludo') {
      this.drawCheckers(g);
    } else {
      this.drawGrid(g);
    }
    this.drawHighlights(g);
  }

  private drawCheckers(g: Graphics): void {
    const size = this.size - 16;
    const cellW = size / this.columns;
    const cellH = size / this.rows;
    for (let row = 0; row < this.rows; row += 1) {
      for (let column = 0; column < this.columns; column += 1) {
        if ((row + column) % 2 === 0) continue;
        g.rect(-size / 2 + column * cellW, -size / 2 + row * cellH, cellW, cellH)
          .fill({ color: this.kind === 'ludo' ? this.theme.scheme.primary : DARK, alpha: this.kind === 'ludo' ? 0.25 : 0.82 });
      }
    }
    if (this.kind === 'ludo') {
      const half = size / 2;
      g.rect(-half + 6, -half + 6, half * 0.34, half * 0.34).fill(this.theme.scheme.error);
      g.rect(half - 6 - half * 0.34, -half + 6, half * 0.34, half * 0.34).fill(this.theme.scheme.primary);
      g.rect(-half + 6, half - 6 - half * 0.34, half * 0.34, half * 0.34).fill(this.theme.scheme.tertiary);
      g.rect(half - 6 - half * 0.34, half - 6 - half * 0.34, half * 0.34, half * 0.34).fill(this.theme.scheme.secondary);
    } else {
      g.rect(-size / 2, -size / 2, size, size).stroke({ width: 3, color: this.theme.scheme['on-surface'], alpha: 0.5 });
    }
  }

  private drawGrid(g: Graphics): void {
    const size = this.size - 20;
    const cell = size / this.columns;
    for (let index = 0; index <= this.columns; index += 1) {
      const offset = -size / 2 + index * cell;
      g.moveTo(offset, -size / 2).lineTo(offset, size / 2).stroke({ width: index === 0 || index === this.columns ? 2 : 1, color: this.theme.scheme['on-surface'], alpha: 0.55 });
      g.moveTo(-size / 2, offset).lineTo(size / 2, offset).stroke({ width: index === 0 || index === this.columns ? 2 : 1, color: this.theme.scheme['on-surface'], alpha: 0.55 });
    }
  }

  private drawHighlights(g: Graphics): void {
    if (this.highlighted.length === 0) return;
    const cell = this.size / Math.max(this.rows, this.columns);
    const layout = createGridLayout({ rows: this.rows, columns: this.columns, cellSize: cell, originX: 0, originY: 0 });
    for (const key of this.highlighted) {
      const [rowText, columnText] = key.split(',');
      const row = Number(rowText);
      const column = Number(columnText);
      if (!Number.isFinite(row) || !Number.isFinite(column)) continue;
      const center = cellCenter(layout, row, column);
      g.circle(center.x, center.y, cell * 0.34).fill({ color: this.theme.scheme.primary, alpha: 0.45 });
    }
  }

  override destroy(options?: Parameters<Container['destroy']>[0]): void {
    this.shadow.destroy();
    super.destroy(options);
  }
}
