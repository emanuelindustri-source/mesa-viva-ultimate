import { HOLIDAY_IDS, holidayLabelKey } from '@mesa-viva/design-system';
import { BookOpen, Bot, Headphones, Palette, Radio, Sparkles, Users } from 'lucide-react';
import { DownloadSection } from './landing/download.js';
import { GameGallery } from './landing/game-gallery.js';
import { Hero } from './landing/hero.js';
import { VersionHistory } from './landing/version-history.js';
import './landing/landing.css';
import { routeHref } from './routes.js';
import { SensoryLab } from './sensory-lab.js';
import { BrandMark } from './ui/brand-mark.js';
import { TopNav } from './ui/top-nav.js';
import { useI18n } from './ui/use-i18n.js';
import { useAppTheme } from './ui/use-theme.js';

const PASOS = [
  { icon: Users, title: 'Elige tu mesa', text: 'Solo contra bots, pasa y juega en el mismo dispositivo o abre una sala con PIN y QR.' },
  { icon: Bot, title: 'Juega con reglas reales', text: 'El motor de core valida cada acción. Tres niveles de bots, sin trampas ni turnos saltados.' },
  { icon: Headphones, title: 'Siente la partida', text: 'Audio 2.0–7.1, voz tarareando, háptica y destellos que responden a lo que ocurre en la mesa.' },
];

export function LandingPage() {
  const { theme } = useAppTheme();
  const { t } = useI18n();
  return (
    <div class="pagina">
      <TopNav active="home" />
      <main>
        <Hero />
        <section class="seccion" aria-labelledby="como">
          <div class="seccion__titulo">
            <p class="sobrelinea">Cómo se juega</p>
            <h2 id="como">Tres pasos y la mesa está servida.</h2>
            <p>Sin cuentas obligatorias, sin anuncios a mitad de partida y con todo el reglamento dentro.</p>
          </div>
          <div class="rejilla rejilla--tres">
            {PASOS.map(({ icon: Icon, title, text }) => (
              <article class="tarjeta tarjeta--paso" key={title}>
                <span class="tarjeta__icono"><Icon size={24} aria-hidden="true" /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section class="seccion" aria-labelledby="juegos">
          <div class="seccion__titulo">
            <p class="sobrelinea">Catálogo jugable</p>
            <h2 id="juegos">Cinco mesas, cinco formas de ganar.</h2>
            <p>Toca un juego para ver sus reglas y abre la mesa cuando estés listo.</p>
          </div>
          <GameGallery />
        </section>

        <section class="seccion" aria-labelledby="historia">
          <div class="historia">
            <div>
              <p class="sobrelinea">Historia e ideas</p>
              <h2 id="historia">Nació de una mesa venezolana.</h2>
              <p>Mesa Viva empezó como un proyecto para jugar Caída y Dominó sin depender de internet. La idea creció: una mesa que se adapta al teléfono, al televisor y a los plegables; que habla 11 idiomas, respeta el movimiento reducido y cambia de fiesta según el día.</p>
              <p>La música no es un archivo pegado: es una orquesta procedural que respira con la tensión, la voz tarareando y los graves del LFE. La identidad tampoco es fija: el logo se transforma con cada festividad.</p>
              <a class="boton boton--secundario" href={routeHref('play')}>{t('nav.play')} <Sparkles size={17} aria-hidden="true" /></a>
            </div>
            <fieldset class="historia__fiestas" aria-label="Logos de las festividades">
              {HOLIDAY_IDS.map((id) => (
                <span class="historia__fiesta" key={id} title={t(holidayLabelKey(id))}>
                  <BrandMark holidayId={id} mode={theme.mode} size={44} label={t(holidayLabelKey(id))} />
                </span>
              ))}
            </fieldset>
          </div>
        </section>

        <SensoryLab />

        <section class="seccion" aria-labelledby="versiones">
          <div class="seccion__titulo">
            <p class="sobrelinea">Trazabilidad</p>
            <h2 id="versiones">Cada fase deja una nota.</h2>
            <p>El portal lee el historial real de <code>docs/versiones/</code>. Nada se borra: cada entrega queda publicada.</p>
          </div>
          <VersionHistory />
        </section>

        <section class="seccion" aria-labelledby="descarga">
          <DownloadSection />
        </section>

        <section class="seccion" aria-labelledby="valores">
          <div class="rejilla rejilla--tres">
            <article class="tarjeta"><span class="tarjeta__icono"><Palette size={22} /></span><h3>Identidad propia</h3><p>Material You, modo claro/oscuro y un logo distinto para cada festividad.</p></article>
            <article class="tarjeta"><span class="tarjeta__icono"><Radio size={22} /></span><h3>Audio de estudio</h3><p>8 instrumentos, voz, LFE, surround y masterización a −1 dBFS.</p></article>
            <article class="tarjeta"><span class="tarjeta__icono"><BookOpen size={22} /></span><h3>Juego limpio</h3><p>Fichas virtuales, sin apuestas. Anuncios con límite y nunca durante la partida.</p></article>
          </div>
        </section>
      </main>
      <footer class="pie">
        <p><strong>Mesa Viva</strong> · Hecho con cariño para Venezuela y el mundo.</p>
        <p><a class="enlace" href={routeHref('privacy')}>Privacidad</a> · <a class="enlace" href={routeHref('terms')}>Términos</a> · Fichas virtuales sin valor monetario real.</p>
      </footer>
    </div>
  );
}

export const App = LandingPage;
