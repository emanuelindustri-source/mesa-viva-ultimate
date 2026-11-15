import { CORE_VERSION } from '@mesa-viva/core';
import { DESIGN_SYSTEM_VERSION } from '@mesa-viva/design-system';
import { ENGINE_25D_VERSION } from '@mesa-viva/engine-25d';
import { SENSORY_ENGINE_VERSION } from '@mesa-viva/sensory-engine';

const REPO_URL = 'https://github.com/emanuelindustri-source/mesa-viva-ultimate';

const PAQUETES = [
  { nombre: 'Motor Core', detalle: 'Reglas, bots y economía', version: CORE_VERSION },
  { nombre: 'Diseño', detalle: 'Material You, 19 festividades, 11 idiomas y atlas SVG', version: DESIGN_SYSTEM_VERSION },
  { nombre: 'Motor 2.5D', detalle: 'PixiJS v8, atlas GPU, físicas táctiles y sensores', version: ENGINE_25D_VERSION },
  { nombre: 'Sensorial', detalle: 'Audio espacial y háptica', version: SENSORY_ENGINE_VERSION },
] as const;

const FASES = [
  { n: 0, nombre: 'Fundación', detalle: 'Monorepo, Git, CI/CD y repositorio público.', estado: 'Completada' },
  { n: 1, nombre: 'Motor Core', detalle: 'Reglas universales, primeros juegos, bots y economía.', estado: 'Completada' },
  { n: 2, nombre: 'Diseño Universal', detalle: 'Material You, 19 festividades, 6 pantallas y 11 idiomas.', estado: 'Completada' },
  { n: 3, nombre: 'Motor 2.5D', detalle: 'Entidades, perspectiva, sombras y sensores de movimiento.', estado: 'Completada' },
  { n: 4, nombre: 'Motor Sensorial', detalle: 'Audio HRTF, música adaptativa de 8 stems y háptica.', estado: 'Siguiente' },
  { n: 5, nombre: 'Portal y Online', detalle: 'Landing, app offline, P2P por QR/PIN y monetización.', estado: 'Planificada' },
  { n: 6, nombre: 'Catálogo Completo', detalle: 'Todos los juegos, enciclopedia y empaquetado Android.', estado: 'Planificada' },
] as const;

const JUEGOS = [
  { nombre: 'Caída Venezolana', detalle: 'Seis cantos, entrega de mesa, capturas y carrera a 24 puntos.', etiqueta: '2–4 jugadores' },
  { nombre: 'Dominó Venezolano', detalle: 'Doble seis, equipos 1v1 y 2v2, pases, tranca y 100 puntos.', etiqueta: '1v1 · 2v2' },
  { nombre: 'Blackjack 21', detalle: 'Apuestas, pedir, plantar y doblar contra el crupier. Paga 3:2.', etiqueta: '1–4 jugadores' },
  { nombre: 'Cartas de Colores', detalle: 'Salta, reversa, roba dos y comodines en una baraja original.', etiqueta: '2–4 jugadores' },
] as const;

const VERSIONES = [
  {
    version: 'v0.4.0',
    titulo: 'Fase 3 · Motor 2.5D',
    detalle:
      'PixiJS v8 y GSAP, entidades universales, cámara adaptativa en seis formatos, atlas SVG en GPU, object pooling y sensores de movimiento con degradación segura.',
    nota: 'docs/versiones/v0.4.0-fase3-motor-25d.md',
  },
  {
    version: 'v0.3.0',
    titulo: 'Fase 2 · Diseño Universal',
    detalle:
      'Material You con color dinámico, 19 festividades, 11 idiomas, seis formatos de pantalla y 200 assets SVG procedurales.',
    nota: 'docs/versiones/v0.3.0-fase2-diseno-universal.md',
  },
  {
    version: 'v0.2.0',
    titulo: 'Fase 1 · Motor Core',
    detalle:
      'Cuatro juegos completos, bots Novato/Competitivo/Maestro, economía de largo plazo con misiones, racha, tienda y guardado HMAC.',
    nota: 'docs/versiones/v0.2.0-fase1-motor-core.md',
  },
  {
    version: 'v0.1.0',
    titulo: 'Fase 0 · Fundación',
    detalle:
      'Monorepo pnpm con cuatro paquetes y cliente Preact, TypeScript estricto, Vitest, CI/CD y sistema de notas de versión.',
    nota: 'docs/versiones/v0.1.0-fase0-fundacion.md',
  },
] as const;

export function App() {
  return (
    <div class="pagina">
      <header class="cabecera">
        <a class="marca" href="./">
          <span class="marca__naipe" aria-hidden="true" />
          <span>Mesa Viva</span>
        </a>
        <div class="cabecera__derecha">
          <span class="pastilla pastilla--viva">Fase 3 completada</span>
          <a class="enlace" href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </header>

      <main>
        <section class="hero">
          <p class="sobrelinea">Motor universal de juegos · Fase 3</p>
          <h1>
            El juego de mesa,
            <span class="hero__brillo"> vivo.</span>
          </h1>
          <p class="hero__texto">
            Clásicos del mundo, cartas venezolanas, estrategia original y un motor 2.5D
            que se adapta a tu teléfono, tablet, laptop o televisor. Sin internet, sin
            fricción y con reglas verificadas por el propio motor.
          </p>
          <div class="hero__acciones">
            <span class="boton boton--principal" aria-disabled="true">
              Jugar ahora · Próximamente
            </span>
            <a class="boton boton--secundario" href="#fases">
              Ver hoja de ruta
            </a>
          </div>
          <p class="hero__nota">
            Fase 3 entregada: motor 2.5D con cartas, fichas, dados y tableros, seis
            cámaras adaptativas, sombras con elevación Z y sensores de movimiento,
            verificados con 203 pruebas.
          </p>
        </section>

        <section class="seccion" aria-labelledby="motores">
          <div class="seccion__titulo">
            <h2 id="motores">Cuatro motores, una mesa</h2>
            <p>Arquitectura modular con archivos pequeños, pruebas automáticas y tipos estrictos.</p>
          </div>
          <div class="rejilla rejilla--cuatro">
            {PAQUETES.map((paquete) => (
              <article class="tarjeta" key={paquete.nombre}>
                <h3>{paquete.nombre}</h3>
                <p>{paquete.detalle}</p>
                <span class="version">v{paquete.version}</span>
              </article>
            ))}
          </div>
        </section>

        <section class="seccion" aria-labelledby="catalogo">
          <div class="seccion__titulo">
            <h2 id="catalogo">Primer catálogo jugable</h2>
            <p>Cuatro juegos funcionan de punta a punta en el motor, con reglas y bots verificados.</p>
          </div>
          <div class="rejilla rejilla--cuatro">
            {JUEGOS.map((juego) => (
              <article class="tarjeta" key={juego.nombre}>
                <h3>{juego.nombre}</h3>
                <p>{juego.detalle}</p>
                <span class="version">{juego.etiqueta}</span>
              </article>
            ))}
          </div>
        </section>

        <section class="seccion" id="fases" aria-labelledby="titulo-fases">
          <div class="seccion__titulo">
            <h2 id="titulo-fases">Siete fases verificables</h2>
            <p>Cada entrega termina con pruebas, compilación y despliegue automático.</p>
          </div>
          <ol class="fases">
            {FASES.map((fase) => (
              <li class={`fase fase--${fase.estado === 'Completada' ? 'hecha' : 'pendiente'}`} key={fase.n}>
                <span class="fase__numero">{String(fase.n).padStart(2, '0')}</span>
                <div class="fase__contenido">
                  <h3>{fase.nombre}</h3>
                  <p>{fase.detalle}</p>
                </div>
                <span class="fase__estado">{fase.estado}</span>
              </li>
            ))}
          </ol>
        </section>

        <section class="seccion" aria-labelledby="versiones">
          <div class="seccion__titulo">
            <h2 id="versiones">Historial de versiones</h2>
            <p>Cada versión queda documentada en el repositorio y publicada aquí.</p>
          </div>
          <div class="versiones-lista">
            {VERSIONES.map((version) => (
              <article class="version-card" key={version.version}>
                <div>
                  <span class="pastilla">{version.version}</span>
                  <h3>{version.titulo}</h3>
                  <p>{version.detalle}</p>
                </div>
                <a class="enlace" href={`${REPO_URL}/blob/main/${version.nota}`} target="_blank" rel="noreferrer">
                  Leer la nota completa →
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer class="pie">
        <p>Mesa Viva · Construido por emanuelindustri-source</p>
        <p>Fichas virtuales sin valor monetario. Sin apuestas. Próximamente en Google Play.</p>
      </footer>
    </div>
  );
}
