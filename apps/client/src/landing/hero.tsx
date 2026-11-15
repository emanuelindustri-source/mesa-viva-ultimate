import { motion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import { routeHref } from '../routes.js';
import { BrandMark } from '../ui/brand-mark.js';
import { useI18n } from '../ui/use-i18n.js';
import { useAppTheme } from '../ui/use-theme.js';

export const ANDROID_APK_URL = 'https://github.com/emanuelindustri-source/mesa-viva-ultimate/releases/latest';

export function Hero() {
  const { theme, holidayId } = useAppTheme();
  const { t } = useI18n();
  return (
    <section class="hero hero--nuevo">
      <motion.div class="hero__marca" initial={{ opacity: 0, scale: 0.8, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
        <BrandMark holidayId={holidayId} mode={theme.mode} size={152} animated label="Mesa Viva" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
        <p class="sobrelinea">La fiesta se juega en tu mesa</p>
        <h1>
          El juego de mesa,
          <span class="hero__brillo"> vivo.</span>
        </h1>
        <p class="hero__texto">
          Caída venezolana, dominó, blackjack, colores y ajedrez de club sobre una mesa 2.5D
          con salón atmosférico, banda sonora multicanal y 19 festividades.
        </p>
        <div class="hero__acciones">
          <a class="boton boton--principal" href={routeHref('play')}>
            {t('nav.play')} ahora <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a class="boton boton--secundario" href="#juegos">
            Ver los juegos
          </a>
          <a class="boton boton--secundario" href={ANDROID_APK_URL} target="_blank" rel="noreferrer">
            <Download size={17} aria-hidden="true" /> Android
          </a>
        </div>
        <dl class="hero__datos">
          <div><dt>5</dt><dd>juegos jugables</dd></div>
          <div><dt>19</dt><dd>festividades</dd></div>
          <div><dt>11</dt><dd>idiomas</dd></div>
          <div><dt>7.1</dt><dd>audio discreto</dd></div>
        </dl>
      </motion.div>
    </section>
  );
}
