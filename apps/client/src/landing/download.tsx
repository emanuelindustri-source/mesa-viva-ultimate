import { Download, ShieldCheck, Smartphone, WifiOff } from 'lucide-react';
import { ANDROID_APK_URL } from './hero.js';

export function DownloadSection() {
  return (
    <div class="descarga">
      <div>
        <p class="sobrelinea">Android · PWA · Offline</p>
        <h3>La mesa también va en tu bolsillo.</h3>
        <p>APK preparado para Android 16, notificaciones de actualización y la misma mesa que ves en el navegador. La app web se instala y funciona sin conexión después de la primera visita.</p>
        <a class="boton boton--principal" href={ANDROID_APK_URL} target="_blank" rel="noreferrer">
          <Download size={18} aria-hidden="true" /> Descargar APK
        </a>
      </div>
      <ul class="descarga__lista">
        <li><Smartphone size={18} aria-hidden="true" /> Un solo código para móvil, tablet, TV y plegable.</li>
        <li><WifiOff size={18} aria-hidden="true" /> Salas y partidas offline-first.</li>
        <li><ShieldCheck size={18} aria-hidden="true" /> Fichas virtuales, sin apuestas ni dinero real.</li>
      </ul>
    </div>
  );
}
