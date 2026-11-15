import { clamp, clamp01 } from '../types.js';
import type { FestivalProfile, StemDefinition, StemId } from './types.js';
import { STEM_IDS } from './types.js';

/** Los ocho stems comparten reloj, tempo y compás; solo cambia su mezcla. */
export const STEM_DEFINITIONS: Readonly<Record<StemId, StemDefinition>> = Object.freeze({
  pulso: { id: 'pulso', label: 'Pulso', role: 'Corazón rítmico de la mesa', low: 0.04, high: 0.82, floor: 0.04, wave: 'sine', octave: 2 },
  bajo: { id: 'bajo', label: 'Bajo', role: 'Raíz armónica que sostiene la partida', low: 0.08, high: 0.68, floor: 0.06, wave: 'sawtooth', octave: 2 },
  pad: { id: 'pad', label: 'Pad', role: 'Aire armónico de espera y calma', low: 0.72, high: 0.3, floor: 0.18, wave: 'triangle', octave: 3 },
  arpegio: { id: 'arpegio', label: 'Arpegio', role: 'Movimiento y anticipación', low: 0.12, high: 0.72, floor: 0.05, wave: 'triangle', octave: 4 },
  melodia: { id: 'melodia', label: 'Melodía', role: 'Voz principal del momento', low: 0.04, high: 0.78, floor: 0.03, wave: 'triangle', octave: 5 },
  campanas: { id: 'campanas', label: 'Campanas', role: 'Brillo y festividad', low: 0.38, high: 0.24, floor: 0.1, wave: 'sine', octave: 6 },
  coro: { id: 'coro', label: 'Coro', role: 'Capa humana y ceremonial', low: 0.3, high: 0.16, floor: 0.08, wave: 'sawtooth', octave: 3 },
  acento: { id: 'acento', label: 'Acento', role: 'Sello de la festividad activa', low: 0.08, high: 0.9, floor: 0.04, wave: 'square', octave: 5 },
});

export function stemDefinition(id: StemId): StemDefinition {
  return STEM_DEFINITIONS[id];
}

/** Ganancia base por tensión; pad y coro ceden espacio al crecer la partida. */
export function stemGainAt(id: StemId, tension: number): number {
  const definition = STEM_DEFINITIONS[id];
  const amount = clamp01(tension);
  const shaped = id === 'pad' || id === 'coro' ? amount ** 0.75 : amount ** 1.15;
  return clamp(definition.low + (definition.high - definition.low) * shaped, 0, 1);
}

/** Mezcla efectiva del stem con el sesgo propio de la festividad. */
export function effectiveStemGain(id: StemId, tension: number, profile: FestivalProfile): number {
  const bias = profile.stemBias[id] ?? 0;
  return clamp(stemGainAt(id, tension) + bias, 0, 1);
}

export function stemMix(tension: number, profile: FestivalProfile): Readonly<Record<StemId, number>> {
  const mix = {} as Record<StemId, number>;
  for (const id of STEM_IDS) mix[id] = effectiveStemGain(id, tension, profile);
  return mix;
}

export function dominantStem(tension: number, profile: FestivalProfile): StemId {
  let winner: StemId = 'pad';
  let best = -1;
  for (const id of STEM_IDS) {
    const gain = effectiveStemGain(id, tension, profile);
    if (gain > best) {
      best = gain;
      winner = id;
    }
  }
  return winner;
}

export function sortedStemsByGain(tension: number, profile: FestivalProfile): readonly StemId[] {
  return [...STEM_IDS].sort((a, b) => effectiveStemGain(b, tension, profile) - effectiveStemGain(a, tension, profile));
}
