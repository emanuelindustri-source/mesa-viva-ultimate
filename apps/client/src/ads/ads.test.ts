import { describe, expect, it, vi } from 'vitest';
import { AdService } from './ad-service.js';
import { BillingService } from './billing-service.js';
import { TelemetryService } from './telemetry-service.js';

describe('AdService', () => {
  it('respeta el límite de tres minutos y nunca interrumpe una partida', async () => {
    let now = 1_000_000;
    const showInterstitial = vi.fn(async () => true);
    const service = new AdService({
      now: () => now,
      online: () => true,
      vip: () => false,
      adapter: { showInterstitial, showRewarded: async () => true },
    });
    expect(service.canShowInterstitial).toBe(true);
    await expect(service.showInterstitial()).resolves.toBe(true);
    expect(service.canShowInterstitial).toBe(false);
    await expect(service.showInterstitial()).resolves.toBe(false);
    expect(showInterstitial).toHaveBeenCalledTimes(1);
    service.setInGame(true);
    now += 180_000;
    expect(service.canShowInterstitial).toBe(false);
    service.setInGame(false);
    expect(service.canShowInterstitial).toBe(true);
    expect(service.remainingCooldownMs).toBe(0);
  });

  it('degrada sin conexión, sin adaptador y para usuarios VIP', async () => {
    const offline = new AdService({ online: () => false, adapter: { showInterstitial: async () => true, showRewarded: async () => true } });
    expect(offline.canShowInterstitial).toBe(false);
    await expect(offline.showRewarded()).resolves.toBe(false);
    const vip = new AdService({ online: () => true, vip: () => true, adapter: { showInterstitial: async () => true, showRewarded: async () => true } });
    expect(vip.canShowInterstitial).toBe(false);
    const noAdapter = new AdService({ online: () => true });
    await expect(noAdapter.showInterstitial()).resolves.toBe(false);
  });
});

describe('BillingService', () => {
  it('activa VIP una sola vez y notifica el cambio', async () => {
    const onVip = vi.fn();
    const purchaseVip = vi.fn(async () => true);
    const billing = new BillingService({ adapter: { purchaseVip }, onVip });
    await expect(billing.purchaseVip()).resolves.toBe(true);
    expect(billing.isVip).toBe(true);
    await expect(billing.purchaseVip()).resolves.toBe(true);
    expect(purchaseVip).toHaveBeenCalledTimes(1);
    expect(onVip).toHaveBeenCalledWith(true);
  });

  it('no activa VIP si la compra falla', async () => {
    const billing = new BillingService({ adapter: { purchaseVip: async () => false } });
    await expect(billing.purchaseVip()).resolves.toBe(false);
    expect(billing.isVip).toBe(false);
  });
});

describe('TelemetryService', () => {
  it('acumula eventos offline y vacía la cola al enviarlos', async () => {
    const service = new TelemetryService('https://telemetria.local/eventos', () => 42);
    service.track('app.started');
    service.track('match.finished', { game: 'caida', won: true });
    expect(service.size).toBe(2);
    expect(service.drain()[0]).toMatchObject({ name: 'app.started', at: 42 });
    const sent: string[] = [];
    const fetchImpl = async (_url: string, init: { body: string }) => {
      sent.push(init.body);
      return { ok: true };
    };
    await expect(service.flush(fetchImpl)).resolves.toBe(true);
    expect(service.size).toBe(0);
    expect(sent[0]).toContain('match.finished');
  });

  it('no envía nada sin endpoint y conserva la cola si falla', async () => {
    const local = new TelemetryService();
    local.track('offline');
    await expect(local.flush(async () => ({ ok: true }))).resolves.toBe(false);
    const failing = new TelemetryService('https://telemetria.local/eventos');
    failing.track('error');
    await expect(failing.flush(async () => ({ ok: false }))).resolves.toBe(false);
    expect(failing.size).toBe(1);
    failing.clear();
    expect(failing.size).toBe(0);
  });
});
