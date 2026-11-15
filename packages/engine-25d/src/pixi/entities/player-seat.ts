import type { Theme } from '@mesa-viva/design-system';
import { gsap } from 'gsap';
import { Container, Graphics, Text } from 'pixi.js';
import type { Projector } from '../../camera/projector.js';
import { type GlossTier, seatFrameForRank } from '../../entities/rank-gloss.js';
import type { SeatSnapshot } from '../../state/snapshot.js';

const FRAME_COLORS: Readonly<Record<GlossTier, string>> = {
  oro: '#ffd54f',
  plata: '#cfd8dc',
  bronce: '#bcaaa4',
  satinado: '#80cbc4',
};

/** Asiento multijugador: avatar, rango, turno y burbuja de chat rápido. */
export class PlayerSeat extends Container {
  private readonly theme: Theme;
  private readonly size: number;
  private readonly avatar = new Graphics();
  private readonly initials: Text;
  private readonly nameText: Text;
  private readonly scoreText: Text;
  private readonly badge = new Graphics();
  private readonly badgeText: Text;
  private readonly turnRing = new Graphics();
  private readonly bubble = new Container();
  private readonly bubbleGraphic = new Graphics();
  private readonly bubbleText: Text;
  private readonly reducedMotion: boolean;
  private pulse: gsap.core.Tween | null = null;
  private bubbleTimer: gsap.core.Tween | null = null;
  private readonly projected = { x: 0, y: 0, scale: 1, depth: 0 };
  private seatX = 0;
  private seatY = 0;
  private hasTurn = false;

  constructor(size: number, theme: Theme, reducedMotion: boolean) {
    super();
    this.theme = theme;
    this.size = Math.max(48, size);
    this.reducedMotion = reducedMotion;
    this.initials = new Text({ text: '', style: { fontFamily: 'system-ui, sans-serif', fontSize: this.size * 0.34, fontWeight: '700', fill: theme.scheme['on-primary-container'] } });
    this.initials.anchor.set(0.5);
    this.nameText = new Text({ text: '', style: { fontFamily: 'system-ui, sans-serif', fontSize: Math.max(11, this.size * 0.18), fontWeight: '600', fill: theme.scheme['on-surface'] } });
    this.nameText.anchor.set(0.5, 0);
    this.scoreText = new Text({ text: '', style: { fontFamily: 'system-ui, sans-serif', fontSize: Math.max(10, this.size * 0.15), fill: theme.scheme['on-surface-variant'] } });
    this.scoreText.anchor.set(0.5, 0);
    this.badgeText = new Text({ text: '', style: { fontFamily: 'system-ui, sans-serif', fontSize: Math.max(9, this.size * 0.14), fontWeight: '700', fill: theme.scheme['on-primary'] } });
    this.badgeText.anchor.set(0.5);
    this.bubbleText = new Text({ text: '', style: { fontFamily: 'system-ui, sans-serif', fontSize: Math.max(10, this.size * 0.16), fill: theme.scheme['on-primary-container'] } });
    this.bubbleText.anchor.set(0.5);
    this.bubble.addChild(this.bubbleGraphic, this.bubbleText);
    this.bubble.visible = false;
    this.bubble.position.set(0, -this.size * 1.02);
    this.addChild(this.turnRing, this.avatar, this.initials, this.nameText, this.scoreText, this.badge, this.badgeText, this.bubble);
  }

  setPlayer(seat: SeatSnapshot): void {
    const tier = seatFrameForRank(seat.rank);
    const frame = FRAME_COLORS[tier];
    this.drawAvatar(frame, seat.isViewer);
    this.initials.text = initialsOf(seat.name);
    this.nameText.text = seat.name;
    this.nameText.position.set(0, this.size * 0.56);
    this.scoreText.text = seat.isDealer ? 'Crupier' : seat.badge !== undefined ? seat.badge : String(seat.score);
    this.scoreText.position.set(0, this.size * 0.56 + Math.max(13, this.size * 0.21));
    this.badgeText.text = seat.isDealer ? 'D' : seat.rank.slice(0, 1).toUpperCase();
    this.badge
      .clear()
      .circle(this.size * 0.42, -this.size * 0.4, this.size * 0.15)
      .fill(frame)
      .stroke({ width: 2, color: this.theme.scheme.surface, alpha: 0.9 });
    this.badgeText.position.set(this.size * 0.42, -this.size * 0.4);
    this.badgeText.style.fill = this.theme.scheme['on-primary'];
    this.badgeText.visible = true;
    this.badge.visible = true;
    this.setTurn(seat.isTurn);
  }

  private drawAvatar(frame: string, isViewer: boolean): void {
    const r = this.size / 2;
    this.avatar
      .clear()
      .circle(0, 0, r)
      .fill(this.theme.scheme['primary-container'])
      .stroke({ width: isViewer ? 4 : 3, color: frame, alpha: 0.95 });
    this.avatar.circle(0, -r * 0.16, r * 0.62).fill({ color: this.theme.scheme.primary, alpha: 0.18 });
    this.turnRing.clear().circle(0, 0, r + 6).stroke({ width: 3, color: frame, alpha: 0.25 });
  }

  setTurn(isTurn: boolean): void {
    this.hasTurn = isTurn;
    this.turnRing.clear();
    const frame = isTurn ? this.theme.scheme.primary : this.theme.scheme.outline;
    this.turnRing.circle(0, 0, this.size / 2 + 6).stroke({ width: isTurn ? 4 : 2, color: frame, alpha: isTurn ? 0.95 : 0.25 });
    this.pulse?.kill();
    this.pulse = null;
    if (isTurn && !this.reducedMotion) {
      this.pulse = gsap.to(this.turnRing.scale, {
        x: 1.08,
        y: 1.08,
        duration: 0.8,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }
    this.turnRing.scale.set(1);
  }

  showBubble(message: string, durationMs = 2600): void {
    const text = message.trim();
    if (text.length === 0) return;
    this.bubbleText.text = text.slice(0, 60);
    const width = Math.max(this.size * 1.5, this.bubbleText.width + 18);
    this.bubbleGraphic
      .clear()
      .roundRect(-width / 2, -this.size * 0.2, width, this.size * 0.4, this.size * 0.18)
      .fill(this.theme.scheme['primary-container'])
      .stroke({ width: 1, color: this.theme.scheme.primary, alpha: 0.4 });
    this.bubble.visible = true;
    this.bubble.alpha = this.reducedMotion ? 1 : 0;
    this.bubble.scale.set(1);
    this.bubbleTimer?.kill();
    if (!this.reducedMotion) gsap.to(this.bubble, { alpha: 1, duration: 0.16 });
    this.bubbleTimer = gsap.delayedCall(durationMs / 1000, () => {
      if (this.reducedMotion) {
        this.bubble.visible = false;
        return;
      }
      gsap.to(this.bubble, { alpha: 0, duration: 0.2, onComplete: () => { this.bubble.visible = false; } });
    });
  }

  setSeatPosition(x: number, y: number): void {
    this.seatX = x;
    this.seatY = y;
  }

  get seatPosition(): { readonly x: number; readonly y: number } {
    return { x: this.seatX, y: this.seatY };
  }

  sync(projector: Projector): void {
    projector.projectXYZ(this.seatX, this.seatY, 0, this.projected);
    this.position.set(this.projected.x, this.projected.y);
    this.alpha = this.hasTurn ? 1 : 0.92;
  }

  override destroy(options?: Parameters<Container['destroy']>[0]): void {
    this.pulse?.kill();
    this.bubbleTimer?.kill();
    gsap.killTweensOf(this.bubble);
    super.destroy(options);
  }
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '?';
  const second = parts.length > 1 ? parts[1]?.[0] ?? '' : '';
  return `${first}${second}`.toUpperCase();
}
