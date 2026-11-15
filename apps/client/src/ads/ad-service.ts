export interface AdAdapter {
  showInterstitial(): Promise<boolean>;
  showRewarded(): Promise<boolean>;
}

export interface AdServiceOptions {
  readonly now?: () => number;
  readonly online?: () => boolean;
  readonly vip?: () => boolean;
  readonly adapter?: AdAdapter | null;
  readonly cooldownMs?: number;
}

const STORAGE_KEY = 'mesa-viva:ads:last-interstitial';

/** Anuncios con frecuencia limitada, sin interrumpir una partida. */
export class AdService {
  private readonly now: () => number;
  private readonly online: () => boolean;
  private readonly vip: () => boolean;
  private readonly adapter: AdAdapter | null;
  private readonly cooldownMs: number;
  private lastInterstitial: number;
  private inGame = false;

  constructor(options: AdServiceOptions = {}) {
    this.now = options.now ?? (() => Date.now());
    this.online = options.online ?? (() => (typeof navigator === 'undefined' ? true : navigator.onLine));
    this.vip = options.vip ?? (() => false);
    this.adapter = options.adapter ?? null;
    this.cooldownMs = Math.max(180_000, options.cooldownMs ?? 180_000);
    this.lastInterstitial = this.readLast();
  }

  setInGame(inGame: boolean): void {
    this.inGame = inGame;
  }

  get canShowInterstitial(): boolean {
    return !this.vip() && this.online() && !this.inGame && this.adapter !== null && this.now() - this.lastInterstitial >= this.cooldownMs;
  }

  get remainingCooldownMs(): number {
    return Math.max(0, this.cooldownMs - (this.now() - this.lastInterstitial));
  }

  async showInterstitial(): Promise<boolean> {
    if (!this.canShowInterstitial || this.adapter === null) return false;
    const shown = await this.adapter.showInterstitial().catch(() => false);
    if (shown) {
      this.lastInterstitial = this.now();
      this.writeLast(this.lastInterstitial);
    }
    return shown;
  }

  async showRewarded(): Promise<boolean> {
    if (!this.online() || this.inGame || this.adapter === null) return false;
    return this.adapter.showRewarded().catch(() => false);
  }

  private readLast(): number {
    try {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
      const value = raw === null || raw === undefined ? 0 : Number(raw);
      return Number.isFinite(value) ? value : 0;
    } catch {
      return 0;
    }
  }

  private writeLast(value: number): void {
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, String(value));
    } catch {
      // Sin almacenamiento, el límite se mantiene en memoria.
    }
  }
}
