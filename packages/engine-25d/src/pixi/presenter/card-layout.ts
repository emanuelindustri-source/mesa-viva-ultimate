import type { StageLayout } from '../../layout/stage-layout.js';
import type { CardSnapshot } from '../../state/snapshot.js';
import type { CardEntity } from '../entities/card-entity.js';
import { cardRow } from './layouts.js';

export function layoutCardZone(
  cards: readonly CardSnapshot[],
  y: number,
  layout: StageLayout,
  ensure: (card: CardSnapshot) => CardEntity,
  animate: boolean,
): void {
  const row = cardRow(cards.length, y, layout);
  for (let index = 0; index < cards.length; index += 1) {
    const card = cards[index];
    const slot = row[index];
    if (card === undefined || slot === undefined) continue;
    const entity = ensure(card);
    entity.setCard({ rank: card.label ?? card.rank, suit: card.suit, deck: card.deck, faceUp: card.faceUp }, animate);
    entity.baseRotationDeg = 0;
    entity.baseScale = 1;
    entity.setTablePosition(slot.x, slot.y);
  }
}
