import type { Projector } from '../../camera/projector.js';
import { type FocusDirection, type FocusItem, nextFocus } from '../../picking/navigation.js';
import { type HitTarget, pickTopmost } from '../../picking/picking.js';

/** Picking táctil/ratón sobre el plano de la mesa. */
export class PixiPicker {
  private readonly projector: () => Projector;
  private readonly targets: () => readonly HitTarget[];

  constructor(projector: () => Projector, targets: () => readonly HitTarget[]) {
    this.projector = projector;
    this.targets = targets;
  }

  pickScreen(screenX: number, screenY: number): string | null {
    const point = this.projector().screenToPlane(screenX, screenY);
    return pickTopmost(point.x, point.y, this.targets());
  }
}

/** Navegación D-pad con anillo de foco visible. */
export class FocusController {
  private readonly items: () => readonly FocusItem[];
  private current: string | null = null;

  constructor(items: () => readonly FocusItem[]) {
    this.items = items;
  }

  get focusedId(): string | null {
    return this.current;
  }

  setFocus(id: string | null): void {
    this.current = id;
  }

  move(direction: FocusDirection, wrap = true): string | null {
    const next = nextFocus(this.current, this.items(), direction, { wrap });
    this.current = next;
    return next;
  }

  reset(): void {
    this.current = null;
  }
}
