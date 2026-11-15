import type { Theme } from '@mesa-viva/design-system';
import { gsap } from 'gsap';
import { Container, Graphics } from 'pixi.js';
import { clampDie, type DieValue, diceRollPlan, PIP_LAYOUTS } from '../../entities/dice.js';
import { TableEntity } from './table-entity.js';

/** Dado 2.5D grande, brillante y con destellos al lanzar. */
export class DiceEntity extends TableEntity {
  private readonly visual = new Container();
  private readonly glow = new Graphics();
  private readonly body = new Graphics();
  private readonly pips = new Graphics();
  private readonly sparkles = new Graphics();
  private readonly theme: Theme;
  private face: DieValue = 1;
  private timeline: gsap.core.Timeline | null = null;
  private sparkleTween: gsap.core.Tween | null = null;

  constructor(size: number, shadowLayer: Container, theme: Theme) {
    super(size, size, shadowLayer);
    this.theme = theme;
    this.visual.addChild(this.glow, this.body, this.pips, this.sparkles);
    this.addChild(this.visual);
    this.drawFace();
    this.drawSparkles(0);
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
    this.glow.alpha = reducedMotion ? 0.3 : 0;
    const timeline = gsap.timeline();
    if (!reducedMotion) {
      timeline.to(this.visual, { rotation: (plan.spinDeg * Math.PI) / 180, duration: plan.spinDurationMs / 1000, ease: 'power2.out' });
      timeline.to(this.visual.scale, { x: 1.16, y: 0.9, duration: 0.1, ease: 'power2.in' }, 0);
      timeline.to(this.visual.scale, { x: 1, y: 1, duration: 0.24, ease: 'bounce.out' });
      timeline.fromTo(this.glow, { alpha: 0 }, { alpha: 0.7, duration: 0.2, yoyo: true, repeat: 1 }, 0);
      this.playSparkles();
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
    const radius = size * 0.2;
    const surface = this.theme.scheme.surface;
    const onSurface = this.theme.scheme['on-surface'];
    this.glow.clear()
      .circle(0, 0, half * 1.18)
      .fill({ color: this.theme.scheme.primary, alpha: 0.18 })
      .stroke({ width: 3, color: this.theme.scheme.primary, alpha: 0.35 });
    this.body.clear()
      .roundRect(-half + size * 0.06, -half + size * 0.1, size, size, radius)
      .fill({ color: 0x000000, alpha: 0.32 })
      .roundRect(-half, -half, size, size, radius)
      .fill(surface)
      .stroke({ width: size * 0.035, color: onSurface, alpha: 0.25 })
      .roundRect(-half + size * 0.06, -half + size * 0.06, size - size * 0.12, size - size * 0.12, radius * 0.82)
      .fill({ color: 0xffffff, alpha: 0.08 });
    this.body.moveTo(-half + radius, -half + size * 0.05)
      .lineTo(half - radius, -half + size * 0.05)
      .stroke({ width: 2, color: 0xffffff, alpha: 0.45 });
    this.pips.clear();
    const radiusPip = size * 0.072;
    for (const pip of PIP_LAYOUTS[this.face]) {
      const x = -half + pip.x * size;
      const y = -half + pip.y * size;
      this.pips.circle(x + 1, y + 2, radiusPip).fill({ color: 0x000000, alpha: 0.18 });
      this.pips.circle(x, y, radiusPip).fill(onSurface);
      this.pips.circle(x - radiusPip * 0.28, y - radiusPip * 0.3, radiusPip * 0.3).fill({ color: 0xffffff, alpha: 0.5 });
    }
  }

  private drawSparkles(t: number): void {
    this.sparkles.clear();
    const half = this.entityWidth / 2;
    const spots = [[-1, -0.9, 0.7], [0.95, -0.55, 0.55], [0.8, 0.9, 0.65], [-0.75, 0.85, 0.5]] as const;
    for (let index = 0; index < spots.length; index += 1) {
      const [x, y, scale] = spots[index] ?? [0, 0, 0];
      const pulse = 0.5 + Math.sin(t * Math.PI * 2 + index) * 0.5;
      const size = half * 0.16 * scale * (0.7 + pulse * 0.5);
      const cx = x * half * 1.04;
      const cy = y * half * 1.04;
      this.sparkles.moveTo(cx, cy - size).lineTo(cx + size * 0.28, cy - size * 0.28)
        .lineTo(cx + size, cy).lineTo(cx + size * 0.28, cy + size * 0.28)
        .lineTo(cx, cy + size).lineTo(cx - size * 0.28, cy + size * 0.28)
        .lineTo(cx - size, cy).lineTo(cx - size * 0.28, cy - size * 0.28)
        .closePath().fill({ color: '#fff3c4', alpha: 0.55 + pulse * 0.4 });
    }
  }

  private playSparkles(): void {
    const progress = { t: 0 };
    this.sparkles.visible = true;
    this.sparkleTween?.kill();
    this.sparkleTween = gsap.to(progress, {
      t: 1,
      duration: 1.1,
      ease: 'none',
      onUpdate: () => this.drawSparkles(progress.t),
      onComplete: () => {
        this.sparkles.visible = false;
        this.glow.alpha = 0.2;
      },
    });
  }

  destroyVisual(): void {
    this.timeline?.kill();
    this.sparkleTween?.kill();
    gsap.killTweensOf(this.visual);
    gsap.killTweensOf(this.glow);
    this.destroy();
  }
}
