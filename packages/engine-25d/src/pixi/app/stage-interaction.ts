import type { FocusRing } from '../picking/focus-ring.js';
import { FocusController, PixiPicker } from '../picking/picker.js';
import type { StageScene } from './stage-scene.js';

/** Picking y foco D-pad sobre la escena activa. */
export class StageInteraction {
  private readonly scene: () => StageScene | null;
  private readonly ring: FocusRing;
  private readonly focus: FocusController;

  constructor(scene: () => StageScene | null, ring: FocusRing) {
    this.scene = scene;
    this.ring = ring;
    this.focus = new FocusController(() => {
      const active = this.scene();
      return active === null ? [] : active.presenter.focusItems(active.projector);
    });
  }

  pickAt(screenX: number, screenY: number): string | null {
    const active = this.scene();
    if (active === null) return null;
    return new PixiPicker(() => active.projector, () => active.presenter.hitTargets()).pickScreen(screenX, screenY);
  }

  focusNext(direction: 'up' | 'down' | 'left' | 'right', wrap = true): string | null {
    const id = this.focus.move(direction, wrap);
    const active = this.scene();
    if (id === null || active === null) {
      this.ring.hide();
      return null;
    }
    const items = active.presenter.focusItems(active.projector);
    const bounds = active.presenter.focusBounds(items, id);
    if (bounds !== null) this.ring.show(bounds);
    return id;
  }

  reset(): void {
    this.focus.reset();
    this.ring.hide();
  }
}
