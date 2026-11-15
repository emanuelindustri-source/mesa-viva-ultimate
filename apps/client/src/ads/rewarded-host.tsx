import { Gift, Play, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'preact/hooks';
import { webAdPortal } from './web-adapter.js';

interface PendingAd {
  readonly resolve: (value: boolean) => void;
}

/** Anuncio recompensado local para web sin red publicitaria; no simula dinero real. */
export function RewardedAdHost() {
  const [open, setOpen] = useState(false);
  const [seconds, setSeconds] = useState(3);
  const pending = useRef<PendingAd | null>(null);

  useEffect(() => {
    webAdPortal.showRewarded = () => new Promise<boolean>((resolve) => {
      pending.current = { resolve };
      setSeconds(3);
      setOpen(true);
    });
    return () => {
      webAdPortal.showRewarded = undefined;
      pending.current?.resolve(false);
      pending.current = null;
    };
  }, []);

  useEffect(() => {
    if (!open || seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [open, seconds]);

  const finish = (value: boolean): void => {
    pending.current?.resolve(value);
    pending.current = null;
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div class="dialogo-fondo" role="presentation">
      <div class="dialogo dialogo--anuncio" role="dialog" aria-modal="true" aria-labelledby="anuncio-titulo">
        <div class="anuncio__cabecera">
          <span class="anuncio__sello"><Gift size={16} /> Recompensa</span>
          <button class="icono-boton" type="button" aria-label="Cerrar anuncio" onClick={() => finish(false)}><X size={18} /></button>
        </div>
        <div class="anuncio__arte" aria-hidden="true">
          <span class="anuncio__sol" />
          <span class="anuncio__carta">21</span>
          <span class="anuncio__ficha">★</span>
        </div>
        <h2 id="anuncio-titulo">Mesa Viva, sin interrumpir la partida</h2>
        <p>Este espacio está reservado para un anuncio recompensado. Al terminar, recibirás fichas virtuales para la mesa.</p>
        {seconds > 0 ? (
          <p class="anuncio__cuenta">Podrás reclamar en {seconds} s</p>
        ) : (
          <button class="boton boton--principal" type="button" onClick={() => finish(true)}>
            <Play size={17} /> Reclamar 80 fichas
          </button>
        )}
        <p class="anuncio__nota">Sin valor monetario real. Nunca se muestra durante una mano.</p>
      </div>
    </div>
  );
}
