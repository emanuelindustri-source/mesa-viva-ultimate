import type { Theme, ViewportInfo } from '@mesa-viva/design-system';
import type { TableSnapshot } from '../../state/snapshot.js';
import type { StageHandle } from './stage-handle.js';

export interface FallbackStageOptions {
  readonly container: HTMLElement;
  readonly theme: Theme;
  readonly reason: string;
  readonly viewport?: ViewportInfo;
}

/**
 * Respaldo sin WebGL: una mesa estática legible en DOM. Mantiene nombres,
 * turnos y conteos; las animaciones y la GPU no son requisito para jugar.
 */
export class FallbackStage implements StageHandle {
  readonly kind = 'dom' as const;
  private readonly options: FallbackStageOptions;
  private readonly root: HTMLDivElement;
  private readonly seats: HTMLDivElement;
  private readonly status: HTMLParagraphElement;
  private handHidden = false;

  constructor(options: FallbackStageOptions) {
    this.options = options;
    const documentRef = options.container.ownerDocument;
    this.root = documentRef.createElement('div');
    this.root.setAttribute('role', 'img');
    this.root.setAttribute('aria-label', 'Mesa de juego estática');
    Object.assign(this.root.style, {
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '240px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '24px',
      borderRadius: '24px',
      background: `radial-gradient(circle at 50% 40%, ${options.theme.scheme['primary-container']}, ${options.theme.scheme.background})`,
      color: options.theme.scheme['on-background'],
      fontFamily: 'system-ui, sans-serif',
    });
    const table = documentRef.createElement('div');
    Object.assign(table.style, {
      width: 'min(92%, 720px)',
      minHeight: '160px',
      borderRadius: '48%',
      border: `2px solid ${options.theme.scheme.primary}`,
      background: options.theme.scheme.surface,
      boxShadow: '0 18px 40px rgba(0,0,0,0.28)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '10px',
      padding: '24px',
    });
    this.seats = documentRef.createElement('div');
    Object.assign(this.seats.style, { display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' });
    table.appendChild(this.seats);
    this.status = documentRef.createElement('p');
    this.status.textContent = options.reason;
    Object.assign(this.status.style, { margin: '0', fontSize: '13px', opacity: '0.78', textAlign: 'center' });
    this.root.append(table, this.status);
    options.container.appendChild(this.root);
  }

  render(snapshot: TableSnapshot): void {
    const documentRef = this.root.ownerDocument;
    this.seats.replaceChildren();
    for (const seat of snapshot.seats) {
      const card = documentRef.createElement('span');
      card.textContent = `${seat.name}${seat.isTurn ? ' · turno' : ''}`;
      Object.assign(card.style, {
        padding: '6px 10px',
        borderRadius: '999px',
        background: seat.isTurn ? this.options.theme.scheme.primary : this.options.theme.scheme['surface-container-high'],
        color: seat.isTurn ? this.options.theme.scheme['on-primary'] : this.options.theme.scheme['on-surface'],
        fontSize: '12px',
        fontWeight: '600',
      });
      this.seats.appendChild(card);
    }
    const hand = this.handHidden ? 'mano oculta' : `${snapshot.hand.length} cartas en mano`;
    this.status.textContent = `${this.options.reason} · ${hand} · ${snapshot.phase}`;
  }

  resize(_viewport?: ViewportInfo): void {
    // El layout estático se adapta con CSS; no requiere GPU.
  }

  setHandHidden(hidden: boolean): void {
    this.handHidden = hidden;
    this.root.style.opacity = hidden ? '0.92' : '1';
  }

  destroy(): void {
    this.root.remove();
  }
}
