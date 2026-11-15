import type { ParticleKind, Theme } from '@mesa-viva/design-system';
import { Container, Sprite, Texture } from 'pixi.js';
import { type ParticleProfile, particleBudget, particleProfile } from '../../effects/particles.js';
import { createSeededRandom, type SeededRandom } from '../../math/random.js';
import type { QualityTier } from '../../perf/quality.js';
import type { PoolStats } from '../../pool/object-pool.js';
import { ObjectPool } from '../../pool/object-pool.js';

interface ParticleView {
  readonly sprite: Sprite;
  active: boolean;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  spin: number;
  behavior: ParticleProfile['behavior'];
}

let particleTexture: Texture | null = null;

function softCircle(): Texture {
  if (particleTexture !== null) return particleTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  if (context !== null) {
    const gradient = context.createRadialGradient(16, 16, 1, 16, 16, 15);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.55, 'rgba(255,255,255,0.85)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
  }
  particleTexture = Texture.from(canvas);
  return particleTexture;
}

/** Partículas festivas con pooling estricto: cero objetos nuevos por frame. */
export class ParticleSystem {
  readonly container = new Container();
  private readonly pool: ObjectPool<ParticleView>;
  private readonly active: ParticleView[] = [];
  private readonly random: SeededRandom;
  private readonly quality: QualityTier;

  constructor(quality: QualityTier, seed = 0x5eed) {
    this.quality = quality;
    this.random = createSeededRandom(seed);
    this.container.eventMode = 'none';
    this.pool = new ObjectPool<ParticleView>({
      initial: particleBudget('confetti', quality, 40),
      max: quality === 'alta' ? 256 : quality === 'media' ? 128 : 48,
      create: () => {
        const sprite = new Sprite(softCircle());
        sprite.anchor.set(0.5);
        sprite.visible = false;
        this.container.addChild(sprite);
        return { sprite, active: false, life: 0, maxLife: 1, vx: 0, vy: 0, gravity: 0, drag: 0, spin: 0, behavior: 'caer' };
      },
      reset: (particle) => {
        particle.active = false;
        particle.sprite.visible = false;
      },
    });
  }

  emit(kind: ParticleKind, x: number, y: number, theme: Theme, count?: number): void {
    const profile = particleProfile(kind, theme);
    const amount = count ?? particleBudget(kind, this.quality);
    for (let index = 0; index < amount; index += 1) {
      let particle: ParticleView;
      try {
        particle = this.pool.acquire();
      } catch {
        return;
      }
      this.configure(particle, profile, x, y);
      this.active.push(particle);
    }
  }

  private configure(particle: ParticleView, profile: ParticleProfile, x: number, y: number): void {
    const color = this.random.pick(profile.colors);
    const angle = this.random.range(0, Math.PI * 2);
    const speed = this.random.range(40, 180);
    const velocityX = profile.behavior === 'estallar' ? Math.cos(angle) * speed : this.random.range(-60, 60);
    const velocityY = profile.behavior === 'estallar'
      ? Math.sin(angle) * speed
      : profile.behavior === 'subir'
        ? this.random.range(-90, -35)
        : this.random.range(20, 80);
    particle.active = true;
    particle.life = 1;
    particle.maxLife = profile.lifetimeMs / 1000;
    particle.vx = velocityX;
    particle.vy = velocityY;
    particle.gravity = profile.gravity;
    particle.drag = profile.drag;
    particle.spin = this.random.range(-profile.spin, profile.spin);
    particle.behavior = profile.behavior;
    particle.sprite.visible = true;
    particle.sprite.tint = color;
    particle.sprite.position.set(x + this.random.range(-16, 16), y + this.random.range(-16, 16));
    particle.sprite.width = profile.size * this.random.range(0.7, 1.3);
    particle.sprite.height = particle.sprite.width;
    particle.sprite.rotation = this.random.range(0, Math.PI * 2);
    particle.sprite.alpha = profile.glow ? 0.95 : 0.8;
  }

  update(dtSeconds: number): void {
    const dt = Math.max(0, Math.min(0.08, dtSeconds));
    for (let index = this.active.length - 1; index >= 0; index -= 1) {
      const particle = this.active[index];
      if (particle === undefined) continue;
      particle.maxLife -= dt;
      if (particle.maxLife <= 0) {
        this.pool.release(particle);
        this.active[index] = this.active[this.active.length - 1] as ParticleView;
        this.active.pop();
        continue;
      }
      particle.vy += particle.gravity * dt;
      const drag = Math.max(0, 1 - particle.drag * dt);
      particle.vx *= drag;
      particle.vy *= drag;
      const sprite = particle.sprite;
      sprite.x += particle.vx * dt;
      sprite.y += particle.vy * dt;
      sprite.rotation += (particle.spin * dt * Math.PI) / 180;
      sprite.alpha = Math.min(0.95, particle.maxLife / 0.6);
    }
  }

  get activeCount(): number {
    return this.active.length;
  }

  get poolStats(): PoolStats {
    return this.pool.stats;
  }

  destroy(): void {
    this.pool.clear();
    this.active.length = 0;
    this.container.destroy({ children: true });
  }
}
