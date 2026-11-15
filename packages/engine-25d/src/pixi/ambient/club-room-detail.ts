import type { Theme } from '@mesa-viva/design-system';
import type { Graphics } from 'pixi.js';

export function drawRug(g: Graphics, width: number, height: number, theme: Theme): void {
  const cx = width / 2;
  const cy = height * 0.72;
  const rx = width * 0.46;
  const ry = height * 0.3;
  g.ellipse(cx, cy + 10, rx * 1.04, ry * 1.04).fill({ color: '#1a0d08', alpha: 0.55 });
  g.ellipse(cx, cy, rx, ry).fill({ color: '#4a1620', alpha: 0.7 });
  g.ellipse(cx, cy, rx * 0.92, ry * 0.9).stroke({ width: 4, color: theme.scheme.tertiary, alpha: 0.24 });
  g.ellipse(cx, cy, rx * 0.8, ry * 0.76).fill({ color: '#5c1d26', alpha: 0.35 });
  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2;
    const x = cx + Math.cos(angle) * rx * 0.68;
    const y = cy + Math.sin(angle) * ry * 0.62;
    g.moveTo(x, y - 12).lineTo(x + 10, y).lineTo(x, y + 12).lineTo(x - 10, y).closePath()
      .fill({ color: theme.scheme.tertiary, alpha: 0.12 });
  }
}

export function drawWallArt(g: Graphics, width: number, height: number): void {
  for (const [x, scale, tint] of [[0.5, 1, '#6b1d24'], [0.14, 0.72, '#1f3b52'], [0.86, 0.72, '#4a3a18']] as const) {
    const frameW = width * 0.065 * scale;
    const frameH = height * 0.1 * scale;
    const cx = width * x;
    const cy = height * 0.28;
    g.roundRect(cx - frameW / 2, cy - frameH / 2, frameW, frameH, 4)
      .fill({ color: '#2b1a0c', alpha: 0.8 })
      .stroke({ width: 3, color: '#c9a24a', alpha: 0.65 });
    g.roundRect(cx - frameW / 2 + 5, cy - frameH / 2 + 5, frameW - 10, frameH - 10, 2)
      .fill({ color: tint, alpha: 0.45 });
    g.circle(cx, cy - frameH * 0.08, frameW * 0.12).fill({ color: '#d9b98a', alpha: 0.35 });
    g.moveTo(cx - frameW * 0.3, cy + frameH * 0.28).lineTo(cx, cy - frameH * 0.02).lineTo(cx + frameW * 0.3, cy + frameH * 0.28)
      .closePath().fill({ color: '#1a120b', alpha: 0.35 });
  }
  for (const x of [0.31, 0.69]) {
    g.circle(width * x, height * 0.27, height * 0.012).fill({ color: '#ffd98f', alpha: 0.5 });
    g.circle(width * x, height * 0.27, height * 0.04).fill({ color: '#ffca7a', alpha: 0.05 });
  }
}
