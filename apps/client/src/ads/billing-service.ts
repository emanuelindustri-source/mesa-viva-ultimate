export interface BillingAdapter {
  purchaseVip(): Promise<boolean>;
}

export interface BillingServiceOptions {
  readonly adapter?: BillingAdapter | null;
  readonly isVip?: () => boolean;
  readonly onVip?: (vip: boolean) => void;
}

const STORAGE_KEY = 'mesa-viva:billing:vip';

/** Compra única VIP preparada para Google Play Billing; en web es demo local. */
export class BillingService {
  private readonly adapter: BillingAdapter | null;
  private readonly onVip: ((vip: boolean) => void) | null;
  private vip: boolean;

  constructor(options: BillingServiceOptions = {}) {
    this.adapter = options.adapter ?? null;
    this.onVip = options.onVip ?? null;
    this.vip = options.isVip?.() ?? this.readVip();
  }

  get isVip(): boolean {
    return this.vip;
  }

  async purchaseVip(): Promise<boolean> {
    if (this.vip) return true;
    const purchased = this.adapter === null ? true : await this.adapter.purchaseVip().catch(() => false);
    if (!purchased) return false;
    this.vip = true;
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, '1');
    } catch {
      // La compra demo sigue activa en memoria.
    }
    this.onVip?.(true);
    return true;
  }

  restore(): boolean {
    this.vip = this.readVip();
    this.onVip?.(this.vip);
    return this.vip;
  }

  private readVip(): boolean {
    try {
      return globalThis.localStorage?.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }
}
