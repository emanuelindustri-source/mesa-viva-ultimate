import type { HolidayId } from '../holidays/holiday-ids.js';
import type { FestiveTheme, FrameKind, ParticleKind } from './types.js';

export function festive(
  holidayId: HolidayId,
  seed: string,
  accent: string,
  particles: ParticleKind,
  frame: FrameKind,
  icon: string,
  motif: string,
): FestiveTheme {
  return {
    holidayId,
    labelKey: `holidays.${holidayId}`,
    seed,
    accent,
    particles,
    frame,
    icon,
    musicId: `music.${holidayId}`,
    motif,
  };
}

/** Invierno, Año Nuevo y festividades de diciembre. */
export const WINTER_THEMES: readonly FestiveTheme[] = [
  festive('navidad', '#b3261e', '#2e7d32', 'snow', 'garland', 'arbol', 'belen'),
  festive('halloween', '#f57c00', '#6a1b9a', 'bats', 'cobweb', 'calabaza', 'mansión'),
  festive('reyes-magos', '#c9a227', '#1a237e', 'stars', 'gifts', 'corona', 'camellos'),
  festive('san-patricio', '#2e7d32', '#fbc02d', 'clovers', 'clovers', 'trebol', 'duende'),
  festive('san-valentin', '#c2185b', '#f8bbd0', 'hearts', 'hearts', 'corazon', 'cupido'),
  festive('dia-inocentes', '#455a64', '#ffb300', 'confetti', 'serpentine', 'bufon', 'broma'),
  festive('ano-bisiesto', '#00838f', '#4dd0e1', 'stars', 'calendar', 'calendario29', 'salto'),
];
