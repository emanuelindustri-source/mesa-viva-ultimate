import type { Theme } from '@mesa-viva/design-system';
import { gsap } from 'gsap';
import { Container, Graphics } from 'pixi.js';
import { clampDie, type DieValue, diceRollPlan, PIP_LAYOUTS } from '../../entities/dice.js';
import { TableEntity } from './table-entity.js';

/** Dado 2.5D con pips, giro físico y rebote de asentamiento. */
export class DiceEntity extends TableEntity {
  private readonly visual = new Container();
  private readonly faceGraphic = new Graphics();
  private readonly pipGraphic = new Graphics();
  private readonly theme: Theme;
  private face: DieValue = 1;
  private timeline: gsap.core.Timeline | null = null;

  constructor(size: number, shadowLayer: Container, theme: Theme) {
    super(size, size, shadowLayer);
    this.theme = theme;
    this.visual.addChild(this.faceGraphic, this.pipGraphic);
    this.addChild(this.visual);
    this.drawFace();
  }

  setFace(value: number): void {
    this.face = clampDie(value);
    this.drawFace();
  }

  rollTo(value: number, seed: number, reducedMotion = false): void {
    const plan = diceRollPlan(value, seed, reducedMotion);
    this.timeline?.kill();
    this.visual.rotation = 0;
    this.visual.scale.set(1);
    const timeline = gsap.timeline();
    timeline.to(this.visual, { rotation: (plan.spinDeg * Math.PI) / 180, duration: plan.spinDurationMs / 1000, ease: 'power2.out' });
    if (!reducedMotion) {
      timeline.to(this.visual.scale, { y: plan.bounceScale, duration: 0.1, ease: 'power2.in' });
      timeline.to(this.visual.scale, { y: 1, duration: 0.2, ease: 'bounce.out' });
    }
    timeline.call(() => {
      this.visual.rotation = (plan.settleDeg * Math.PI) / 180;
      this.setFace(plan.face);
    });
    this.timeline = timeline;
  }

  private drawFace(): void {
    const size = this.entityWidth;
    const half = size / 2;
    const radius = size * 0.18;
    this.faceGraphic
      .clear()
      .roundRect(-half + size * 0.04, -half + size * 0.06, size, size, radius)
      .fill({ color: this.theme.scheme.shadow, alpha: 0.22 })
      .roundRect(-half, -half, size, size, radius)
      .fill(this.theme.scheme.surface)
      .stroke({ width: 2, color: this.theme.scheme['outline-variant'] });
    this.pipGraphic.clear();
    const radiusPip = size * 0.065;
    for (const pip of PIP_LAYOUTS[this.face]) {
      this.pipGraphic
        .circle(-half + pip.x * size, -half + pip.y * size, radiusPip)
        .fill(this.theme.scheme['on-surface']);
    }
  }

  destroyVisual(): void {
    this.timeline?.kill();
    gsap.killTweensOf(this.visual);
    this.destroy();
  }
}
