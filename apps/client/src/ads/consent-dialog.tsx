import { Dialog } from '../ui/dialog.js';
import { updateSettings } from '../ui/settings.js';

interface ConsentDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

/** Consentimiento tipo UMP: se puede rechazar y seguir jugando. */
export function ConsentDialog({ open, onClose }: ConsentDialogProps) {
  return (
    <Dialog open={open} title="Tu privacidad, tu mesa" onClose={onClose}>
      <p class="legal__intro">Mesa Viva puede mostrar anuncios para mantener el portal y los temas gratuitos. Tú decides.</p>
      <div class="consentimiento__acciones">
        <button class="boton boton--principal" type="button" onClick={() => { updateSettings({ adsConsent: 'granted' }); onClose(); }}>
          Aceptar anuncios personalizados
        </button>
        <button class="boton boton--secundario" type="button" onClick={() => { updateSettings({ adsConsent: 'denied' }); onClose(); }}>
          Solo lo necesario
        </button>
      </div>
      <p class="anuncio__nota">Puedes cambiar esta decisión en Ajustes. No hay apuestas ni fichas con valor real.</p>
    </Dialog>
  );
}
