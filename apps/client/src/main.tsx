import { render } from 'preact';
import { App as LandingPage } from './app.js';
import { LegalPage } from './legal/legal-page.js';
import { PlayApp } from './play/play-app.js';
import { currentRoute } from './routes.js';
import { UpdateBanner } from './ui/update-banner.js';
import './styles.css';
import './ui/ui.css';

const container = document.getElementById('app');
if (!container) throw new Error('No se encontró el contenedor #app');

const route = currentRoute();
const TITLES = {
  home: 'Mesa Viva — Juegos de cartas y mesa',
  play: 'Jugar · Mesa Viva',
  privacy: 'Privacidad · Mesa Viva',
  terms: 'Términos · Mesa Viva',
} as const;
document.title = TITLES[route];
const page = route === 'play'
  ? <PlayApp />
  : route === 'privacy'
    ? <LegalPage kind="privacy" />
    : route === 'terms'
      ? <LegalPage kind="terms" />
      : <LandingPage />;

render(<><UpdateBanner />{page}</>, container);
