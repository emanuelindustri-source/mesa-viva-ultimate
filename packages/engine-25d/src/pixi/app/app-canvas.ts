import type { Application } from 'pixi.js';

/** Estilos y accesibilidad del canvas; separado para mantener la escena corta. */
export function installCanvas(app: Application, container: HTMLElement): void {
  const canvas = app.canvas;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.touchAction = 'none';
  canvas.setAttribute('aria-label', 'Mesa de juego 2.5D');
  container.appendChild(canvas);
}
