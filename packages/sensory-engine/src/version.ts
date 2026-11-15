export const SENSORY_ENGINE_VERSION = '0.1.0';

/** Primitivas hápticas nativas que se combinan para cada gesto del juego. */
export const HAPTIC_PRIMITIVES = ['tick', 'click', 'thud', 'spin'] as const;

export type HapticPrimitive = (typeof HAPTIC_PRIMITIVES)[number];

/** Perfiles de háptica asociados a acciones reales de la mesa. */
export const HAPTIC_GESTURES = {
  deslizarCarta: ['tick'],
  colocarFicha: ['click', 'thud'],
  lanzarDados: ['spin', 'thud'],
  barajar: ['click', 'click', 'tick'],
} as const satisfies Record<string, readonly HapticPrimitive[]>;

export type HapticGesture = keyof typeof HAPTIC_GESTURES;
