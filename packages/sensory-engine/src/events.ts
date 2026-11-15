import type { EffectId } from './audio/effect-sounds.js';
import type { HapticGesture } from './version.js';

export interface SensoryEventDefinition {
  readonly type: EffectId;
  readonly label: string;
  readonly haptic: HapticGesture;
  readonly spatial: boolean;
}

/** Traducción única de acciones de mesa a sonido y háptica. */
export const SENSORY_EVENT_CATALOG: Readonly<Record<EffectId, SensoryEventDefinition>> = Object.freeze({
  'carta-deslizar': { type: 'carta-deslizar', label: 'Deslizar carta', haptic: 'deslizarCarta', spatial: true },
  'carta-colocar': { type: 'carta-colocar', label: 'Colocar carta', haptic: 'colocarFicha', spatial: true },
  'ficha-colocar': { type: 'ficha-colocar', label: 'Colocar ficha', haptic: 'colocarFicha', spatial: true },
  'dados-lanzar': { type: 'dados-lanzar', label: 'Lanzar dados', haptic: 'lanzarDados', spatial: true },
  barajar: { type: 'barajar', label: 'Barajar', haptic: 'barajar', spatial: false },
  turno: { type: 'turno', label: 'Cambio de turno', haptic: 'turno', spatial: false },
  'ui-click': { type: 'ui-click', label: 'Toque de interfaz', haptic: 'turno', spatial: false },
  victoria: { type: 'victoria', label: 'Victoria', haptic: 'victoria', spatial: false },
  derrota: { type: 'derrota', label: 'Derrota', haptic: 'derrota', spatial: false },
  alerta: { type: 'alerta', label: 'Aviso', haptic: 'alerta', spatial: false },
  silencio: { type: 'silencio', label: 'Silenciar', haptic: 'silencio', spatial: false },
  celebracion: { type: 'celebracion', label: 'Celebración', haptic: 'victoria', spatial: false },
});

export function sensoryEvent(type: EffectId): SensoryEventDefinition {
  return SENSORY_EVENT_CATALOG[type];
}
