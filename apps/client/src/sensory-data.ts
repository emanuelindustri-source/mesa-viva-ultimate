import {
  type ComposerInstrument,
  type EffectId,
  FESTIVAL_IDS,
  FESTIVAL_PROFILES,
  type FestivalId,
  type OutputMode,
  type PerformanceState,
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

export interface InstrumentChoice {
  readonly id: ComposerInstrument;
  readonly label: string;
  readonly role: string;
  readonly zone: string;
}

export const SENSORY_INSTRUMENTS: readonly InstrumentChoice[] = [
  { id: 'hum', label: 'Voz', role: 'Tarareo solista', zone: 'Central' },
  { id: 'rhodes', label: 'Rhodes', role: 'Piano eléctrico', zone: 'Frontal L/R' },
  { id: 'guitar', label: 'Cuatro', role: 'Karplus acústico', zone: 'Frontal L/R' },
  { id: 'bass', label: 'Contrabajo', role: 'Graves y LFE', zone: 'Subwoofer' },
  { id: 'marimba', label: 'Marimba', role: 'Madera orgánica', zone: 'Surround' },
  { id: 'strings', label: 'Cuerdas', role: 'Sala y traseros', zone: 'Rear' },
  { id: 'percussion', label: 'Percusión', role: 'Maracas y cajón', zone: 'Surround' },
  { id: 'beatbox', label: 'Beatbox', role: 'Ritmo vocal', zone: 'Surround' },
];

export const INITIAL_LEVELS: Readonly<Record<ComposerInstrument, number>> = {
  hum: 0.8, rhodes: 0.75, guitar: 0.7, bass: 0.8, marimba: 0.65, strings: 0.6, percussion: 0.65, beatbox: 0.5,
};

export interface OutputChoice {
  readonly id: OutputMode;
  readonly label: string;
  readonly detail: string;
}

export const SENSORY_OUTPUTS: readonly OutputChoice[] = [
  { id: 'auto', label: 'Auto', detail: 'Detecta el dispositivo' },
  { id: 'binaural', label: 'Binaural 2.0', detail: 'HRTF + ondas alpha/beta/theta' },
  { id: 'stereo', label: 'Estéreo 2.0', detail: 'L/R clásico' },
  { id: '2.1', label: '2.1', detail: 'Frontales + LFE' },
  { id: '5.1', label: '5.1', detail: '6 canales discretos' },
  { id: '5.2', label: '5.2', detail: '6 canales, doble sub' },
  { id: '7.1', label: '7.1', detail: '8 canales discretos' },
];

export interface StateChoice {
  readonly id: PerformanceState;
  readonly label: string;
}

export const SENSORY_STATES: readonly StateChoice[] = [
  { id: 'calma', label: 'Calma' },
  { id: 'concentracion', label: 'Concentración' },
  { id: 'energia', label: 'Energía' },
  { id: 'climax', label: 'Clímax' },
];

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
