import { festive } from './festive-winter.js';
import type { FestiveTheme } from './types.js';

/**Verano, familia, efemérides patrias y vacaciones. */
export const SUMMER_THEMES: readonly FestiveTheme[] = [
  festive('dia-familia', '#5e35b1', '#b39ddb', 'hearts', 'garland', 'familia', 'mesa-compartida'),
  festive('dia-tierra', '#2e7d32', '#81c784', 'leaves', 'leaves', 'planeta', 'bosque'),
  festive('dia-encuentro-dos-mundos', '#8d6e63', '#ffb74d', 'leaves', 'flags', 'globo', 'carabela'),
  festive('dia-independencia', '#1565c0', '#ffd54f', 'fireworks', 'flags', 'bandera', 'patria'),
  festive('vacaciones-verano', '#f57c00', '#4fc3f7', 'sun', 'waves', 'sol', 'playa'),
  festive('vacaciones-invierno', '#0277bd', '#b3e5fc', 'snow', 'snow', 'copo', 'montana'),
];
