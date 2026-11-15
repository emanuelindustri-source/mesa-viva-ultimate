import { routeHref } from '../routes.js';
import { TopNav } from '../ui/top-nav.js';

interface LegalSection {
  readonly title: string;
  readonly body: readonly string[];
}

const PRIVACY: readonly LegalSection[] = [
  { title: 'Qué guardamos', body: ['Tu perfil, XP, nivel, Fichas de Mesa, misiones, racha, cosméticos y preferencias se guardan en tu dispositivo con una firma HMAC de integridad. No son dinero real ni se convierten en dinero.', 'El progreso puede perderse si borras los datos del navegador o de la app.'] },
  { title: 'Salas y WebRTC', body: ['Las salas usan un PIN de seis dígitos y conexiones WebRTC. El anfitrión conserva el estado de la partida; los invitados reciben su vista. El chat se transmite entre los participantes y no se almacena en un servidor propio.', 'La señalización usa el proveedor público configurado por PeerJS; en redes restrictivas puede requerir STUN/TURN y, sin conexión, la mesa degrada a juego local.'] },
  { title: 'Anuncios y consentimiento', body: ['Los anuncios son opcionales y respetan un límite de frecuencia: mínimo tres minutos entre intersticiales y nunca durante una partida. Los recompensados solo se muestran si tú los eliges.', 'En Android se usará el consentimiento UMP/GDPR de Google. En web puedes rechazar el consentimiento y seguir jugando; la app no carga rastreadores de terceros por defecto.'] },
  { title: 'Telemetría', body: ['La telemetría es una cola local de eventos técnicos (inicio, modo de juego, errores). Si no hay endpoint configurado, no se envía nada. No incluye nombres, manos privadas ni contenido del chat.'] },
  { title: 'Contacto', body: ['Para ejercer tus derechos o reportar un problema: emanuel.industri@gmail.com. Responderemos desde el repositorio público.'] },
];

const TERMS: readonly LegalSection[] = [
  { title: 'Fichas virtuales, no dinero', body: ['Las Fichas de Mesa son una puntuación virtual sin valor monetario real. No se compran con dinero, no se canjean, no se transfieren y no habilitan apuestas ni premios.', 'Mesa Viva no es un casino ni un servicio de apuestas.'] },
  { title: 'Uso justo', body: ['Puedes jugar solo, con amigos o en salas privadas. No está permitido usar la app para acosar, suplantar identidades o distribuir contenido ilegal.', 'Los bots y las reglas son parte del juego; manipular el guardado local solo afecta tu propia copia.'] },
  { title: 'Compras VIP', body: ['La compra única VIP “Quitar anuncios + Temas VIP” es una función de accesibilidad y estética. No desbloquea ventajas competitivas ni fichas adicionales.', 'En web la compra es una simulación local hasta la integración de Google Play Billing en la Fase 6.'] },
  { title: 'Contenido y propiedad', body: ['Los nombres de juegos tradicionales son de dominio público. Los textos, emblemas, melodías y efectos de Mesa Viva son originales y procedurales. No se incluye música ni arte con derechos de terceros.'] },
  { title: 'Cambios', body: ['Cada versión se documenta en docs/versiones/. Si cambiamos estos términos, publicaremos una nota nueva y mantendremos el historial.'] },
];

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const sections = kind === 'privacy' ? PRIVACY : TERMS;
  const title = kind === 'privacy' ? 'Privacidad' : 'Términos de uso';
  return (
    <div class="pagina">
      <TopNav active={kind} compact />
      <main class="legal">
        <p class="sobrelinea">Mesa Viva · Documento legal</p>
        <h1>{title}</h1>
        <p class="legal__intro">
          {kind === 'privacy'
            ? 'Privacidad por diseño: sin cuentas obligatorias, sin rastreo por defecto y con tus datos en tu dispositivo.'
            : 'Reglas claras: fichas virtuales sin valor monetario, sin apuestas y con anuncios que respetan tu partida.'}
        </p>
        {sections.map((section) => (
          <section class="legal__seccion" key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
        <p class="legal__volver"><a class="enlace" href={routeHref('')}>← Volver al portal</a> · <a class="enlace" href={routeHref('play')}>Jugar</a></p>
      </main>
    </div>
  );
}
