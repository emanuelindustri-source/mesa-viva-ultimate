import type { Html5Qrcode } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'preact/hooks';

interface RoomScannerProps {
  readonly onCode: (text: string) => void;
  readonly onClose: () => void;
}

/** Escáner QR bajo demanda; la cámara solo se abre cuando el usuario lo pide. */
export function RoomScanner({ onCode, onClose }: RoomScannerProps) {
  const [error, setError] = useState('');
  const scanner = useRef<Html5Qrcode | null>(null);
  const region = useRef<HTMLDivElement>(null);
  const handled = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const id = 'mesa-viva-scanner';
    if (region.current !== null) region.current.id = id;
    void import('html5-qrcode').then(async ({ Html5Qrcode }) => {
      if (cancelled) return;
      const instance = new Html5Qrcode(id);
      scanner.current = instance;
      try {
        await instance.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (text) => {
            if (handled.current) return;
            handled.current = true;
            onCode(text);
            void instance.stop().catch(() => undefined);
          },
          () => undefined,
        );
      } catch {
        if (!cancelled) setError('No se pudo abrir la cámara. Escribe el PIN de 6 dígitos.');
      }
    }).catch(() => setError('El escáner no está disponible en este navegador.'));
    return () => {
      cancelled = true;
      const instance = scanner.current;
      scanner.current = null;
      if (instance !== null) {
        void instance.stop().then(() => instance.clear()).catch(() => undefined);
      }
    };
  }, [onCode]);

  return (
    <div class="escaner">
      <div class="escaner__cabecera"><span><Camera size={17} /> Escanear QR</span><button class="icono-boton" type="button" aria-label="Cerrar escáner" onClick={onClose}><X size={18} /></button></div>
      <div class="escaner__region" ref={region} />
      <p>{error.length > 0 ? error : 'Apunta la cámara al QR de la sala.'}</p>
    </div>
  );
}
