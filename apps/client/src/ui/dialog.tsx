import { X } from 'lucide-react';
import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

interface DialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ComponentChildren;
  readonly wide?: boolean;
}

/** Diálogo accesible con Escape, foco inicial y cierre por fondo. */
export function Dialog({ open, title, onClose, children, wide = false }: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('sin-scroll');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('sin-scroll');
      previous?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div class="dialogo-fondo">
      <div class={`dialogo ${wide ? 'dialogo--ancho' : ''}`} role="dialog" aria-modal="true" aria-labelledby="dialogo-titulo" tabIndex={-1} ref={panel}>
        <div class="dialogo__cabecera">
          <h2 id="dialogo-titulo">{title}</h2>
          <button class="icono-boton" type="button" aria-label="Cerrar" onClick={onClose}><X size={20} /></button>
        </div>
        <div class="dialogo__cuerpo">{children}</div>
      </div>
    </div>
  );
}
