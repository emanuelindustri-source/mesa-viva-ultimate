import { Sprite, Texture } from 'pixi.js';

let sharedShadow: Texture | null = null;

/** Sombra suave generada una vez y reutilizada por todas las entidades. */
export function shadowTexture(): Texture {
  if (sharedShadow !== null) return sharedShadow;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context === null) {
    sharedShadow = Texture.WHITE;
    return sharedShadow;
  }
  const gradient = context.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(0,0,0,0.72)');
  gradient.addColorStop(0.45, 'rgba(0,0,0,0.38)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  sharedShadow = Texture.from(canvas);
  return sharedShadow;
}

export function disposeShadowTexture(): void {
  sharedShadow?.destroy(true);
  sharedShadow = null;
}

export class ShadowView extends Sprite {
  constructor() {
    super(shadowTexture());
    this.anchor.set(0.5);
    this.tint = 0x000000;
    this.alpha = 0.4;
    this.visible = false;
    this.eventMode = 'none';
  }

  place(x: number, y: number, width: number, height: number, alpha: number): void {
    this.position.set(x, y);
    this.width = width;
    this.height = height;
    this.alpha = Math.max(0.02, Math.min(0.7, alpha));
  }
}
