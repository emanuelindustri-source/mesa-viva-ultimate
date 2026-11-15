import { RefreshCw, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'preact/hooks';

/** Banner de actualización del Service Worker y aviso offline. */
export function UpdateBanner() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [offline, setOffline] = useState(typeof navigator === 'undefined' ? false : !navigator.onLine);
  const [update, setUpdate] = useState<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    let cancelled = false;
    const onOnline = (): void => setOffline(false);
    const onOffline = (): void => setOffline(true);
    globalThis.addEventListener?.('online', onOnline);
    globalThis.addEventListener?.('offline', onOffline);
    void import('virtual:pwa-register').then(({ registerSW }) => {
      if (cancelled) return;
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh: () => setNeedRefresh(true),
        onOfflineReady: () => setOfflineReady(true),
      });
      setUpdate(() => updateSW);
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      globalThis.removeEventListener?.('online', onOnline);
      globalThis.removeEventListener?.('offline', onOffline);
    };
  }, []);

  if (!needRefresh && !offline && !offlineReady) return null;
  return (
    <div class={`aviso-flotante ${offline ? 'aviso-flotante--offline' : ''}`} role="status">
      {offline ? <WifiOff size={18} aria-hidden="true" /> : <RefreshCw size={18} aria-hidden="true" />}
      <span>
        {offline
          ? 'Sin conexión. La mesa sigue disponible desde la caché.'
          : needRefresh
            ? 'Nueva actualización disponible. Toca para actualizar.'
            : 'Mesa lista para jugar sin conexión.'}
      </span>
      {needRefresh ? (
        <button class="aviso-flotante__accion" type="button" onClick={() => { setOfflineReady(false); void update?.(true); }}>
          Actualizar
        </button>
      ) : (
        <button class="aviso-flotante__accion" type="button" onClick={() => setOfflineReady(false)}>Cerrar</button>
      )}
    </div>
  );
}
