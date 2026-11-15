import type { Theme } from '@mesa-viva/design-system';
import type { Container } from 'pixi.js';
import type { Projector } from '../../camera/projector.js';
import { boardRotationForViewer } from '../../entities/seats.js';
import type { StageLayout } from '../../layout/stage-layout.js';
import type { FocusItem } from '../../picking/navigation.js';
import { ObjectPool } from '../../pool/object-pool.js';
import type { TableSnapshot } from '../../state/snapshot.js';
import { viewerSeatIndex } from '../../state/snapshot.js';
import { BoardGrid } from '../entities/board-grid.js';
import { PlayerSeat } from '../entities/player-seat.js';
import { boardSizeFor, seatsFor } from './layouts.js';

export interface SeatLayerOptions {
  readonly layout: StageLayout;
  readonly theme: Theme;
  readonly shadow: Container;
  readonly seatLayer: Container;
  readonly boardLayer: Container;
  readonly reducedMotion: boolean;
}

/** Asientos con rango/turno/chat y tablero de casillas compartido. */
export class SeatLayer {
  private readonly options: SeatLayerOptions;
  private readonly seats = new Map<string, PlayerSeat>();
  private readonly pool: ObjectPool<PlayerSeat>;
  private readonly board: BoardGrid;

  constructor(options: SeatLayerOptions) {
    this.options = options;
    this.pool = new ObjectPool<PlayerSeat>({
      initial: 4,
      max: 8,
      create: () => {
        const seat = new PlayerSeat(options.layout.cardWidth * 1.35, options.theme, options.reducedMotion);
        options.seatLayer.addChild(seat);
        return seat;
      },
      reset: (seat) => { seat.visible = false; },
      destroy: (seat) => seat.destroy({ children: true }),
    });
    this.board = new BoardGrid(boardSizeFor(options.layout), options.theme, options.shadow);
    options.boardLayer.addChild(this.board);
  }

  render(snapshot: TableSnapshot): void {
    const ids = new Set(snapshot.seats.map((seat) => seat.id));
    for (const [id, entity] of this.seats) {
      if (ids.has(id)) continue;
      this.pool.release(entity);
      this.seats.delete(id);
    }
    const viewer = Math.max(0, viewerSeatIndex(snapshot));
    const slots = seatsFor(snapshot.seats.length, this.options.layout, viewer);
    for (let index = 0; index < snapshot.seats.length; index += 1) {
      const seat = snapshot.seats[index];
      const slot = slots[index];
      if (seat === undefined || slot === undefined) continue;
      let entity = this.seats.get(seat.id);
      if (entity === undefined) {
        entity = this.pool.acquire();
        entity.visible = true;
        this.seats.set(seat.id, entity);
      }
      entity.setPlayer(seat);
      entity.setSeatPosition(slot.x, slot.y);
    }
    this.board.setBoard(snapshot.board.kind, snapshot.board.rows || 8, snapshot.board.columns || 8, snapshot.board.highlighted);
    this.board.setTablePosition(0, 0);
    this.board.setRotationDeg(boardRotationForViewer(snapshot.seats.length, viewer));
    this.board.visible = snapshot.board.kind !== 'ninguno';
  }

  sync(projector: Projector): void {
    for (const entity of this.seats.values()) entity.sync(projector);
    if (this.board.visible) this.board.sync(projector);
  }

  focusItems(projector: Projector): readonly FocusItem[] {
    const items: FocusItem[] = [];
    for (const [id, entity] of this.seats) {
      if (!entity.visible) continue;
      const point = projector.project({ x: entity.seatPosition.x, y: entity.seatPosition.y, z: 0 });
      const width = this.options.layout.cardWidth * 1.35;
      const height = this.options.layout.cardWidth * 1.6;
      items.push({ id, x: point.x - width / 2, y: point.y - height / 2, width, height });
    }
    return items;
  }

  get count(): number {
    return this.seats.size;
  }

  get boardVisible(): boolean {
    return this.board.visible;
  }

  destroy(): void {
    for (const entity of this.seats.values()) this.pool.release(entity);
    this.seats.clear();
    this.pool.clear();
    this.board.destroy({ children: true });
  }
}
