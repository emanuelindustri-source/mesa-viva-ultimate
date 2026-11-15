export const SENSORY_ENGINE_VERSION = '0.7.0';

/** Frecuencia de trabajo del motor de audio. */
export const AUDIO_SAMPLE_RATE = 48_000;

/** Primitivas hápticas nativas que se combinan para cada gesto del juego. */
export const HAPTIC_PRIMITIVES = ['tick', 'click', 'thud', 'spin'] as const;

export type HapticPrimitive = (typeof HAPTIC_PRIMITIVES)[number];

/** Perfiles de háptica asociados a acciones reales de la mesa. */
export const HAPTIC_GESTURES = {
  deslizarCarta: ['tick'],
  colocarFicha: ['click', 'thud'],
  lanzarDados: ['spin', 'thud'],
  barajar: ['click', 'click', 'tick'],
  turno: ['tick', 'tick'],
  victoria: ['click', 'click', 'thud'],
  derrota: ['thud'],
  alerta: ['click', 'click'],
  silencio: ['tick'],
} as const satisfies Record<string, readonly HapticPrimitive[]>;

export type HapticGesture = keyof typeof HAPTIC_GESTURES;

/** Rasgos que la capa de presentación puede anunciar sin cargar audio. */
export const SENSORY_FEATURES = [
  'audio-espacial-hrtf',
  'musica-adaptativa-8-stems',
  'multicanal-2.0-7.1',
  'voz-tarareando-formantes',
  'compositor-32-64-compases',
  'masterizacion-brickwall',
  'festividades-19',
  'haptica-capacitor',
  'haptica-web',
  'silencio-boca-abajo',
  'movimiento-reducido',
] as const;
