import type { AccentKind, FestivalId, FestivalProfile, InstrumentKind, StemId } from './types.js';

const MAJOR = [0, 2, 4, 5, 7, 9, 11] as const;
const MINOR = [0, 2, 3, 5, 7, 8, 10] as const;
const DORIAN = [0, 2, 3, 5, 7, 9, 10] as const;
const PHRYGIAN = [0, 1, 3, 5, 7, 8, 10] as const;
const LYDIAN = [0, 2, 4, 6, 7, 9, 11] as const;
const MIXOLYDIAN = [0, 2, 4, 5, 7, 9, 10] as const;
const PENTATONIC = [0, 2, 4, 7, 9] as const;
const HARMONIC_MINOR = [0, 2, 3, 5, 7, 8, 11] as const;
const WHOLE_TONE = [0, 2, 4, 6, 8, 10] as const;

function festival(
  id: FestivalId,
  label: string,
  rootMidi: number,
  scale: readonly number[],
  tempo: number,
  swing: number,
  density: number,
  accent: AccentKind,
  instrument: InstrumentKind,
  color: string,
  motif: string,
  stemBias: Readonly<Partial<Record<StemId, number>>> = {},
): FestivalProfile {
  return { id, musicId: `music.${id}`, label, rootMidi, scale, tempo, swing, density, accent, instrument, color, motif, stemBias };
}

/** Veinte perfiles musicales: 19 festividades temáticas y el Día Normal. */
export const FESTIVAL_PROFILES: Readonly<Record<FestivalId, FestivalProfile>> = Object.freeze({
  navidad: festival('navidad', 'Navidad', 67, MAJOR, 88, 0.05, 0.55, 'campanas', 'campanas', '#b3261e', 'belen', { campanas: 0.18, coro: 0.14, pad: 0.08 }),
  halloween: festival('halloween', 'Halloween', 57, HARMONIC_MINOR, 76, 0.12, 0.6, 'metal', 'metal', '#f57c00', 'mansión', { bajo: 0.14, acento: 0.18, campanas: 0.1 }),
  'reyes-magos': festival('reyes-magos', 'Reyes Magos', 62, DORIAN, 84, 0.04, 0.52, 'campanas', 'metal', '#c9a227', 'camellos', { campanas: 0.16, acento: 0.1 }),
  'san-patricio': festival('san-patricio', 'San Patricio', 62, MIXOLYDIAN, 116, 0.08, 0.72, 'flauta', 'flauta', '#2e7d32', 'duende', { arpegio: 0.18, pulso: 0.12, acento: 0.12 }),
  'san-valentin': festival('san-valentin', 'San Valentín', 65, MAJOR, 72, 0.03, 0.4, 'cuerdas', 'cuerdas', '#c2185b', 'cupido', { melodia: 0.2, coro: 0.14, pulso: -0.08 }),
  carnaval: festival('carnaval', 'Carnaval', 60, MINOR, 124, 0.18, 0.9, 'tambor', 'metal', '#7b1fa2', 'comparsa', { pulso: 0.24, acento: 0.28, bajo: 0.1 }),
  'semana-santa': festival('semana-santa', 'Semana Santa', 57, PHRYGIAN, 64, 0.02, 0.32, 'coro', 'coro', '#6d4c41', 'procesion', { coro: 0.3, pad: 0.12, pulso: -0.18 }),
  'dia-inocentes': festival('dia-inocentes', 'Día de Inocentes', 61, WHOLE_TONE, 108, 0.1, 0.68, 'cascabeles', 'marimba', '#455a64', 'broma', { acento: 0.24, arpegio: 0.14 }),
  'dia-madre': festival('dia-madre', 'Día de la Madre', 60, MAJOR, 76, 0.03, 0.42, 'cuerdas', 'cuerdas', '#ad1457', 'abrazo', { melodia: 0.22, campanas: 0.1 }),
  'dia-padre': festival('dia-padre', 'Día del Padre', 58, MAJOR, 82, 0.04, 0.5, 'palmas', 'cuerdas', '#1565c0', 'familia', { bajo: 0.14, melodia: 0.1 }),
  'dia-nino': festival('dia-nino', 'Día del Niño', 67, PENTATONIC, 118, 0.1, 0.78, 'marimba', 'marimba', '#f9a825', 'juegos', { pulso: 0.2, acento: 0.2, arpegio: 0.1 }),
  'dia-hijo': festival('dia-hijo', 'Día del Hijo', 64, PENTATONIC, 112, 0.08, 0.7, 'flauta', 'flauta', '#00897b', 'travesuras', { arpegio: 0.18, campanas: 0.14 }),
  'dia-familia': festival('dia-familia', 'Día de la Familia', 60, MAJOR, 86, 0.04, 0.55, 'coro', 'coro', '#5e35b1', 'mesa-compartida', { pad: 0.14, coro: 0.16 }),
  'dia-tierra': festival('dia-tierra', 'Día de la Tierra', 62, LYDIAN, 62, 0.0, 0.3, 'viento', 'flauta', '#2e7d32', 'bosque', { pad: 0.2, coro: 0.16, pulso: -0.14 }),
  'dia-encuentro-dos-mundos': festival('dia-encuentro-dos-mundos', 'Encuentro de Dos Mundos', 62, PENTATONIC, 96, 0.06, 0.6, 'flauta', 'flauta', '#8d6e63', 'carabela', { arpegio: 0.18, acento: 0.14 }),
  'dia-independencia': festival('dia-independencia', 'Día de la Independencia', 60, MAJOR, 100, 0.03, 0.62, 'fuegos', 'metal', '#1565c0', 'patria', { pulso: 0.18, acento: 0.26 }),
  'vacaciones-verano': festival('vacaciones-verano', 'Vacaciones de Verano', 65, MIXOLYDIAN, 114, 0.14, 0.8, 'marimba', 'marimba', '#f57c00', 'playa', { arpegio: 0.18, pulso: 0.1, campanas: 0.08 }),
  'vacaciones-invierno': festival('vacaciones-invierno', 'Vacaciones de Invierno', 64, LYDIAN, 70, 0.02, 0.35, 'campanas', 'campanas', '#0277bd', 'montana', { campanas: 0.24, pad: 0.14, pulso: -0.18 }),
  'ano-bisiesto': festival('ano-bisiesto', 'Año Bisiesto', 65, WHOLE_TONE, 126, 0.16, 0.74, 'cascada', 'sintetizador', '#00838f', 'salto', { acento: 0.2, arpegio: 0.16 }),
  'dia-normal': festival('dia-normal', 'Día Normal', 60, MAJOR, 80, 0.04, 0.48, 'ninguno', 'sintetizador', '#546e7a', 'mesa'),
});

/** Las 19 festividades temáticas; el modo neutro se gestiona aparte. */
export const THEMED_FESTIVAL_IDS: readonly Exclude<FestivalId, 'dia-normal'>[] = [
  'navidad', 'halloween', 'reyes-magos', 'san-patricio', 'san-valentin', 'carnaval', 'semana-santa',
  'dia-inocentes', 'dia-madre', 'dia-padre', 'dia-nino', 'dia-hijo', 'dia-familia', 'dia-tierra',
  'dia-encuentro-dos-mundos', 'dia-independencia', 'vacaciones-verano', 'vacaciones-invierno', 'ano-bisiesto',
];

export function festivalProfile(id: FestivalId = 'dia-normal'): FestivalProfile {
  return FESTIVAL_PROFILES[id] ?? FESTIVAL_PROFILES['dia-normal'];
}

export function festivalMusicId(id: FestivalId): string {
  return festivalProfile(id).musicId;
}

export function isThemedFestival(id: FestivalId): boolean {
  return id !== 'dia-normal';
}
