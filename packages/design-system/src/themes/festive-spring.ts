import { festive } from './festive-winter.js';
import type { FestiveTheme } from './types.js';

/** Carnaval, Semana Santa y celebraciones familiares de primavera. */
export const SPRING_THEMES: readonly FestiveTheme[] = [
  festive('carnaval', '#7b1fa2', '#fdd835', 'confetti', 'serpentine', 'mascara', 'comparsa'),
  festive('semana-santa', '#6d4c41', '#d7ccc8', 'petals', 'olive', 'palma', 'procesion'),
  festive('dia-madre', '#ad1457', '#f8bbd0', 'petals', 'hearts', 'flor', 'abrazo'),
  festive('dia-padre', '#1565c0', '#90caf9', 'confetti', 'stars', 'corbata', 'familia'),
  festive('dia-nino', '#f9a825', '#42a5f5', 'bubbles', 'balloons', 'globo', 'juegos'),
  festive('dia-hijo', '#00897b', '#80cbc4', 'bubbles', 'stars', 'cometa', 'travesuras'),
];
