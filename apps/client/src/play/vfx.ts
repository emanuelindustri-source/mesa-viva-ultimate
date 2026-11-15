import confetti from 'canvas-confetti';
import type { GameKey } from './game-defs.js';

export type VfxEvent = 'canto' | 'captura' | 'doble' | 'tranca' | 'especial' | 'reversa' | 'roba' | '21' | 'blackjack' | 'victoria' | 'derrota';

export interface VfxConfig {
  readonly colors: readonly string[];
  readonly count: number;
  readonly spread: number;
  readonly shapes: readonly ('circle' | 'square' | 'star')[];
  readonly shockwave: boolean;
  readonly shine: boolean;
  readonly aura: string | null;
}

const DEFAULT: VfxConfig = { colors: ['#c9a227', '#f4e6c1', '#fff4e0'], count: 30, spread: 55, shapes: ['circle'], shockwave: false, shine: false, aura: null };

export const GAME_VFX: Readonly<Record<GameKey, Partial<Record<VfxEvent, VfxConfig>>>> = {
  caida: {
    canto: { colors: ['#f4d06f', '#c9a227', '#fff4e0', '#b3261e'], count: 90, spread: 100, shapes: ['circle', 'star'], shockwave: true, shine: true, aura: 'rgba(201,162,39,0.35)' },
    captura: { colors: ['#f4d06f', '#c9a227', '#fff4e0'], count: 45, spread: 70, shapes: ['circle', 'star'], shockwave: true, shine: true, aura: 'rgba(201,162,39,0.25)' },
    victoria: { colors: ['#f4d06f', '#c9a227', '#b3261e', '#fff4e0'], count: 160, spread: 120, shapes: ['circle', 'square', 'star'], shockwave: true, shine: true, aura: 'rgba(201,162,39,0.45)' },
  },
  domino: {
    doble: { colors: ['#f4e6c1', '#d9a066', '#8d5a2b'], count: 55, spread: 75, shapes: ['square'], shockwave: true, shine: true, aura: 'rgba(217,160,102,0.28)' },
    tranca: { colors: ['#d9a066', '#8d5a2b', '#f4e6c1'], count: 90, spread: 110, shapes: ['square', 'circle'], shockwave: true, shine: false, aura: 'rgba(141,90,43,0.35)' },
    victoria: { colors: ['#f4e6c1', '#c9a227', '#8d5a2b'], count: 140, spread: 120, shapes: ['square', 'circle', 'star'], shockwave: true, shine: true, aura: 'rgba(201,162,39,0.4)' },
  },
  colores: {
    especial: { colors: ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'], count: 100, spread: 110, shapes: ['square', 'circle'], shockwave: true, shine: true, aura: 'rgba(30,136,229,0.3)' },
    reversa: { colors: ['#8e24aa', '#1e88e5', '#ffd54f'], count: 50, spread: 70, shapes: ['square'], shockwave: false, shine: true, aura: 'rgba(142,36,170,0.25)' },
    roba: { colors: ['#e53935', '#ffd54f', '#1e88e5'], count: 35, spread: 60, shapes: ['circle'], shockwave: false, shine: false, aura: 'rgba(229,57,53,0.2)' },
    victoria: { colors: ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#c9a227'], count: 160, spread: 120, shapes: ['square', 'circle', 'star'], shockwave: true, shine: true, aura: 'rgba(201,162,39,0.4)' },
  },
  blackjack: {
    '21': { colors: ['#f4d06f', '#c9a227', '#fff4e0'], count: 110, spread: 100, shapes: ['circle', 'star'], shockwave: true, shine: true, aura: 'rgba(201,162,39,0.45)' },
    blackjack: { colors: ['#f4d06f', '#c9a227', '#fff4e0', '#b3261e'], count: 180, spread: 130, shapes: ['circle', 'square', 'star'], shockwave: true, shine: true, aura: 'rgba(201,162,39,0.55)' },
    victoria: { colors: ['#f4d06f', '#c9a227', '#fff4e0'], count: 90, spread: 100, shapes: ['circle'], shockwave: true, shine: true, aura: 'rgba(201,162,39,0.4)' },
    derrota: { colors: ['#455a64', '#b3261e'], count: 40, spread: 50, shapes: ['circle'], shockwave: false, shine: false, aura: 'rgba(69,90,100,0.25)' },
  },
};

export function vfxFor(game: GameKey, event: VfxEvent): VfxConfig {
  return GAME_VFX[game][event] ?? DEFAULT;
}

export class GameVFXController {
  private target: HTMLElement | null;
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(target: HTMLElement | null = null) {
    this.target = target;
  }

  attach(target: HTMLElement | null): void {
    this.target = target;
  }

  trigger(game: GameKey, event: VfxEvent, origin = { x: 0.5, y: 0.45 }): void {
    const config = vfxFor(game, event);
    try {
      void confetti({
        particleCount: config.count,
        spread: config.spread,
        origin,
        colors: [...config.colors],
        shapes: [...config.shapes],
        scalar: 0.9,
        disableForReducedMotion: true,
      });
    } catch {
      // Sin canvas o en modo reducido se mantiene el resto de la interfaz.
    }
    if (config.shockwave) this.shockwave();
    if (config.shine) this.shine();
    if (config.aura !== null && this.target !== null) this.aura(config.aura);
  }

  private shockwave(): void {
    const target = this.target;
    if (target === null) return;
    const wave = document.createElement('span');
    wave.className = 'vfx-onda';
    target.appendChild(wave);
    const timer = setTimeout(() => wave.remove(), 850);
    this.timers.push(timer);
  }

  private shine(): void {
    const target = this.target;
    if (target === null) return;
    target.classList.add('vfx-brillo');
    const timer = setTimeout(() => target.classList.remove('vfx-brillo'), 700);
    this.timers.push(timer);
  }

  private aura(color: string): void {
    const target = this.target;
    if (target === null) return;
    target.style.setProperty('--vfx-aura', color);
    target.classList.add('vfx-aura');
    const timer = setTimeout(() => target.classList.remove('vfx-aura'), 1100);
    this.timers.push(timer);
  }

  destroy(): void {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers = [];
    this.target?.classList.remove('vfx-aura', 'vfx-brillo');
  }
}
