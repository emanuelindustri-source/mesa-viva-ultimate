import type { Projector } from '../../camera/projector.js';
import type { FocusItem } from '../../picking/navigation.js';
import type { HitTarget } from '../../picking/picking.js';
import type { CardEntity } from '../entities/card-entity.js';

export function cardHitTargets(cards: ReadonlyMap<string, CardEntity>, baseScale: number): readonly HitTarget[] {
  const unit = 1 / Math.max(0.05, baseScale);
  return [...cards].map(([id, entity]) => ({
    id,
    x: entity.tableX,
    y: entity.tableY,
    width: entity.entityWidth * unit * entity.baseScale,
    height: entity.entityHeight * unit * entity.baseScale,
    rotationDeg: entity.baseRotationDeg,
    elevation: entity.elevation,
    order: entity.zIndex,
  }));
}

export function cardFocusItems(cards: ReadonlyMap<string, CardEntity>, projector: Projector): readonly FocusItem[] {
  const items: FocusItem[] = [];
  for (const [id, entity] of cards) {
    if (!entity.visible) continue;
    const point = projector.project({ x: entity.tableX, y: entity.tableY, z: 0 });
    const width = entity.entityWidth * entity.baseScale;
    const height = entity.entityHeight * entity.baseScale;
    items.push({ id, x: point.x - width / 2, y: point.y - height / 2, width, height });
  }
  return items;
}
