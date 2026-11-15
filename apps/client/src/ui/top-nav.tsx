import { type Route, routeHref } from '../routes.js';
import { useAppTheme } from '../ui/use-theme.js';
import { AppearanceToggle } from './appearance-toggle.js';
import { BrandMark } from './brand-mark.js';
import { HolidayPicker } from './holiday-picker.js';
import { LanguagePicker } from './language-picker.js';

interface TopNavProps {
  readonly active?: Route;
  readonly compact?: boolean;
}

export function TopNav({ active = 'home', compact = false }: TopNavProps) {
  const { theme, holidayId } = useAppTheme();
  return (
    <header class={`top-nav ${compact ? 'top-nav--compact' : ''}`}>
      <a class="top-nav__marca" href={routeHref('')} aria-label="Mesa Viva, inicio">
        <BrandMark holidayId={holidayId} mode={theme.mode} size={compact ? 38 : 46} label="Mesa Viva" />
        <span class="top-nav__nombre">Mesa Viva</span>
      </a>
      <nav class="top-nav__enlaces" aria-label="Navegación principal">
        <a class={active === 'home' ? 'activo' : ''} href={routeHref('')}>Inicio</a>
        <a class={active === 'play' ? 'activo' : ''} href={routeHref('play')}>Jugar</a>
        {!compact && <a href="#juegos">Juegos</a>}
        {!compact && <a href="#versiones">Versiones</a>}
        <a href={routeHref('privacy')}>Privacidad</a>
      </nav>
      <div class="top-nav__controles">
        <HolidayPicker />
        <AppearanceToggle />
        <LanguagePicker />
      </div>
    </header>
  );
}
