import type { SpatialPoint } from '../audio/params.js';
import type { SpatialAudioEngine } from '../audio/spatial.js';
import type { TableSpatialLayout } from '../audio/spatial-layout.js';
import type { Vec3 } from '../types.js';

/** Ataduras de asientos/cartas de TableStage con el audio espacial. */
export class SpatialLayoutController {
  private readonly spatial: SpatialAudioEngine;

  constructor(spatial: SpatialAudioEngine) {
    this.spatial = spatial;
  }

  setLayout(layout: TableSpatialLayout): void {
    for (const seat of layout.seats) this.spatial.attach(seat.id, 'asiento', seat.position);
    for (const card of layout.cards) this.spatial.attach(card.id, 'carta', card.position);
    const first = layout.seats[0];
    if (first !== undefined) this.spatial.setListenerFromSeat(first.position);
  }

  moveCard(id: string, position: Vec3, fadeSeconds = 0.08): void {
    this.spatial.updateSource(id, position, fadeSeconds);
  }

  attachSeat(id: string, position: SpatialPoint): void {
    this.spatial.attach(id, 'asiento', position);
  }

  attachCard(id: string, position: SpatialPoint): void {
    this.spatial.attach(id, 'carta', position);
  }
}
