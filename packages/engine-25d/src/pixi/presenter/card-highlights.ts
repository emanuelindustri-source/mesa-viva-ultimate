import type { Graphics } from 'pixi.js';
import type { DropHint } from '../../state/snapshot.js';
import type { CardEntity } from '../entities/card-entity.js';

export function paintCardHighlights(
  cards: ReadonlyMap<string, CardEntity>,
  drops: readonly DropHint[],
  hovered: string | null,
  dragging: boolean,
): void {
  for (const [id, entity] of cards) {
    const hinted = drops.some((hint) => hint.cardId === id && hint.kind !== 'table');
    entity.setDropHighlight(hovered === id || (dragging && hinted));
  }
}

export function paintTableGlow(
  graphics: Graphics,
  layout: { readonly centerX: number; readonly centerY: number; readonly width: number; readonly height: number },
  dragging: boolean,
  drops: readonly DropHint[],
): void {
  const g = graphics.clear();
  if (!dragging || !drops.some((hint) => hint.kind === 'table')) return;
  const w = layout.width * 0.44;
  const h = layout.height * 0.3;
  g.roundRect(layout.centerX - w / 2, layout.centerY - h / 2, w, h, 26)
    .fill({ color: '#ffd76a', alpha: 0.06 })
    .stroke({ width: 8, color: '#ffca52', alpha: 0.13 })
    .stroke({ width: 2, color: '#ffe9a8', alpha: 0.55 });
}
