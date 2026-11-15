import type { AdAdapter } from './ad-service.js';

export interface WebAdPortal {
  showInterstitial?: (() => Promise<boolean>) | undefined;
  showRewarded?: (() => Promise<boolean>) | undefined;
}

export const webAdPortal: WebAdPortal = {};

function h5Break(type: 'start' | 'next' | 'reward', name: string): boolean {
  const scope = globalThis as {
    adBreak?: (options: { type: string; name: string }) => Promise<unknown>;
    adConfig?: (options: Record<string, unknown>) => void;
  };
  if (scope.adBreak === undefined) return false;
  try {
    scope.adConfig?.({ preloadAdBreaks: 'on', sound: 'off' });
    void scope.adBreak({ type, name });
    return true;
  } catch {
    return false;
  }
}

/** Adaptador web: H5 Games Ads si existe; si no, portal local de demostración. */
export function createWebAdAdapter(): AdAdapter {
  return {
    showInterstitial: async () => {
      if (h5Break('next', 'interstitial')) return true;
      return webAdPortal.showInterstitial?.() ?? false;
    },
    showRewarded: async () => {
      if (h5Break('reward', 'rewarded')) return true;
      return webAdPortal.showRewarded?.() ?? false;
    },
  };
}

export interface NativeAdBridge {
  showInterstitial(): Promise<boolean>;
  showRewarded(): Promise<boolean>;
  requestConsent?(): Promise<'granted' | 'denied'>;
}

/** Puente estructural para @capacitor-community/admob; se inyecta en Fase 6. */
export function createNativeAdAdapter(bridge: NativeAdBridge): AdAdapter {
  return {
    showInterstitial: () => bridge.showInterstitial().catch(() => false),
    showRewarded: () => bridge.showRewarded().catch(() => false),
  };
}
