import {
  type EffectId,
  FESTIVAL_IDS,
  FESTIVAL_PROFILES,
  type FestivalId,
  STEM_DEFINITIONS,
  STEM_IDS,
} from '@mesa-viva/sensory-engine';

export interface FestivalChoice {
  readonly id: FestivalId;
  readonly label: string;
  readonly color: string;
  readonly motif: string;
}

export const SENSORY_FESTIVALS: readonly FestivalChoice[] = FESTIVAL_IDS.map((id) => ({
  id,
  label: FESTIVAL_PROFILES[id].label,
  color: FESTIVAL_PROFILES[id].color,
  motif: FESTIVAL_PROFILES[id].motif,
}));

export const SENSORY_STEMS = STEM_IDS.map((id) => ({
  id,
  label: STEM_DEFINITIONS[id].label,
  role: STEM_DEFINITIONS[id].role,
}));

export interface SensoryGesture {
  readonly event: EffectId;
  readonly label: string;
  readonly icon: string;
}

export const SENSORY_GESTURES: readonly SensoryGesture[] = [
  { event: 'barajar', label: 'Barajar', icon: '🂠' },
  { event: 'dados-lanzar', label: 'Dados', icon: '🎲' },
  { event: 'carta-deslizar', label: 'Carta', icon: '🃏' },
  { event: 'ficha-colocar', label: 'Ficha', icon: '⚪' },
  { event: 'turno', label: 'Turno', icon: '🔔' },
  { event: 'celebracion', label: 'Celebrar', icon: '✨' },
];
