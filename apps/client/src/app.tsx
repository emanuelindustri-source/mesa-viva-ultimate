import { FASES, JUEGOS, PAQUETES, REPO_URL, VERSIONES } from './content.js';
import { SensoryLab } from './sensory-lab.js';

export function App() {
  return (
    <div class="pagina">
      <header class="cabecera">
        <a class="marca" href="./">
          <span class="marca__naipe" aria-hidden="true" />
          <span>Mesa Viva</span>
        </a>
        <div class="cabecera__derecha">
          <span class="pastilla pastilla--viva">Fase 4.5 completada</span>
          <a class="enlace" href="#sensorial">
            Sensorial
          </a>
          <a class="enlace" href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </header>

      <main>
        <section class="hero">
          <p class="sobrelinea">Motor universal de juegos · Fase 4.5</p>
          <h1>
            El juego de mesa,
            <span class="hero__brillo"> vivo.</span>
          </h1>
          <p class="hero__texto">
            Clásicos del mundo, cartas venezolanas, estrategia original y un motor 2.5D
            que se adapta a tu teléfono, tablet, laptop o televisor. Ahora la mesa suena
            en 7.1, canta con voz humana y adapta su melodía a la partida.
          </p>
          <div class="hero__acciones">
            <a class="boton boton--principal" href="#sensorial">
              Probar el sonido
            </a>
            <a class="boton boton--secundario" href="#fases">
              Ver hoja de ruta
            </a>
          </div>
          <p class="hero__nota">
            Fase 4.5 entregada: banda sonora multicanal 2.0–7.1, voz tarareando con
            formantes, compositor de 32–64 compases, graves LFE y masterización a
            −1 dBFS, verificada con 283 pruebas automáticas.
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

        <SensoryLab />

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
            {FASES.map((fase) => {
              const estado = fase.estado === 'Completada' ? 'hecha' : fase.estado === 'Siguiente' ? 'siguiente' : 'pendiente';
              return (
                <li class={`fase fase--${estado}`} key={fase.n}>
                  <span class="fase__numero">{String(fase.n).padStart(2, '0')}</span>
                  <div class="fase__contenido">
                    <h3>{fase.nombre}</h3>
                    <p>{fase.detalle}</p>
                  </div>
                  <span class="fase__estado">{fase.estado}</span>
                </li>
              );
            })}
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
        <p>Fichas virtuales sin valor monetario. Sin apuestas. Audio original y procedural. Próximamente en Google Play.</p>
      </footer>
    </div>
  );
}
