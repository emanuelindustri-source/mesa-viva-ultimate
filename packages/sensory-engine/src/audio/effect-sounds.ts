import type { AudioNodeLike } from './contracts.js';
import type { AudioBusName } from './graph.js';
import type { SynthKit, SynthVoice } from './synth.js';

export const EFFECT_IDS = [
  'carta-deslizar',
  'carta-colocar',
  'ficha-colocar',
  'dados-lanzar',
  'barajar',
  'turno',
  'ui-click',
  'victoria',
  'derrota',
  'alerta',
  'silencio',
  'celebracion',
] as const;

export type EffectId = (typeof EFFECT_IDS)[number];

export interface EffectSynthesisOptions {
  readonly when: number;
  readonly volume: number;
}

export interface EffectDefinition {
  readonly id: EffectId;
  readonly label: string;
  readonly durationMs: number;
  readonly bus: AudioBusName;
  readonly spatial: boolean;
  readonly synthesize: (
    kit: SynthKit,
    destination: AudioNodeLike,
    options: EffectSynthesisOptions,
  ) => readonly SynthVoice[];
}

function tones(
  kit: SynthKit,
  destination: AudioNodeLike,
  base: number,
  volume: number,
  when: number,
  steps: readonly number[],
  spacing: number,
): readonly SynthVoice[] {
  return steps.map((frequency, index) => kit.tone({
    when: when + index * spacing,
    frequency: base * frequency,
    duration: 0.14,
    type: 'triangle',
    volume: volume * 0.55,
    destination,
    release: 0.12,
  }));
}

export const EFFECT_DEFINITIONS: Readonly<Record<EffectId, EffectDefinition>> = Object.freeze({
  'carta-deslizar': {
    id: 'carta-deslizar', label: 'Deslizar carta', durationMs: 190, bus: 'effects', spatial: true,
    synthesize: (kit, destination, options) => {
      const when = options.when;
      return [
        kit.noiseBurst({ when, duration: 0.14, volume: 0.16 * options.volume, destination, filterHz: 2400, filterType: 'highpass' }),
        kit.tone({ when, frequency: 330, glideTo: 210, duration: 0.12, type: 'triangle', volume: 0.05 * options.volume, destination }),
      ];
    },
  },
  'carta-colocar': {
    id: 'carta-colocar', label: 'Colocar carta', durationMs: 160, bus: 'effects', spatial: true,
    synthesize: (kit, destination, options) => {
      const when = options.when;
      return [
        kit.noiseBurst({ when, duration: 0.1, volume: 0.2 * options.volume, destination, filterHz: 780, filterType: 'lowpass' }),
        kit.tone({ when, frequency: 118, glideTo: 64, duration: 0.12, type: 'sine', volume: 0.16 * options.volume, destination }),
      ];
    },
  },
  'ficha-colocar': {
    id: 'ficha-colocar', label: 'Colocar ficha', durationMs: 180, bus: 'effects', spatial: true,
    synthesize: (kit, destination, options) => {
      const when = options.when;
      return [
        kit.tone({ when, frequency: 1280, duration: 0.035, type: 'square', volume: 0.06 * options.volume, destination }),
        kit.noiseBurst({ when: when + 0.012, duration: 0.06, volume: 0.14 * options.volume, destination, filterHz: 1100, filterType: 'lowpass' }),
        kit.tone({ when: when + 0.03, frequency: 92, glideTo: 58, duration: 0.11, type: 'sine', volume: 0.15 * options.volume, destination }),
      ];
    },
  },
  'dados-lanzar': {
    id: 'dados-lanzar', label: 'Lanzar dados', durationMs: 720, bus: 'effects', spatial: true,
    synthesize: (kit, destination, options) => {
      const when = options.when;
      const voices: SynthVoice[] = [
        kit.noiseBurst({ when, duration: 0.42, volume: 0.14 * options.volume, destination, filterHz: 1500, filterType: 'bandpass' }),
      ];
      for (let click = 0; click < 5; click += 1) {
        voices.push(kit.tone({
          when: when + 0.08 + click * 0.095,
          frequency: 480 + click * 115,
          glideTo: 260,
          duration: 0.055,
          type: 'square',
          volume: (0.07 - click * 0.008) * options.volume,
          destination,
        }));
      }
      voices.push(kit.tone({ when: when + 0.58, frequency: 84, glideTo: 52, duration: 0.16, type: 'sine', volume: 0.2 * options.volume, destination }));
      return voices;
    },
  },
  barajar: {
    id: 'barajar', label: 'Barajar', durationMs: 520, bus: 'effects', spatial: false,
    synthesize: (kit, destination, options) => {
      const when = options.when;
      return Array.from({ length: 6 }, (_, index) => kit.noiseBurst({
        when: when + index * 0.07,
        duration: 0.055,
        volume: (0.12 - index * 0.008) * options.volume,
        destination,
        filterHz: 1200 + index * 260,
        filterType: 'bandpass',
        playbackRate: 0.9 + index * 0.05,
      }));
    },
  },
  turno: {
    id: 'turno', label: 'Cambio de turno', durationMs: 420, bus: 'ui', spatial: false,
    synthesize: (kit, destination, options) => {
      const when = options.when;
      return [
        kit.tone({ when, frequency: 880, duration: 0.2, type: 'sine', volume: 0.1 * options.volume, destination, release: 0.22 }),
        kit.tone({ when: when + 0.03, frequency: 1320, duration: 0.18, type: 'sine', volume: 0.045 * options.volume, destination, release: 0.2 }),
      ];
    },
  },
  'ui-click': {
    id: 'ui-click', label: 'Toque de interfaz', durationMs: 90, bus: 'ui', spatial: false,
    synthesize: (kit, destination, options) => [
      kit.tone({ when: options.when, frequency: 660, duration: 0.045, type: 'triangle', volume: 0.09 * options.volume, destination, release: 0.04 }),
    ],
  },
  victoria: {
    id: 'victoria', label: 'Victoria', durationMs: 940, bus: 'music', spatial: false,
    synthesize: (kit, destination, options) => tones(kit, destination, 523.25, options.volume, options.when, [1, 1.25, 1.5, 2], 0.11),
  },
  derrota: {
    id: 'derrota', label: 'Derrota', durationMs: 820, bus: 'music', spatial: false,
    synthesize: (kit, destination, options) => tones(kit, destination, 440, options.volume, options.when, [1, 0.84, 0.71, 0.56], 0.15),
  },
  alerta: {
    id: 'alerta', label: 'Aviso', durationMs: 380, bus: 'ui', spatial: false,
    synthesize: (kit, destination, options) => [
      kit.tone({ when: options.when, frequency: 740, duration: 0.12, type: 'square', volume: 0.06 * options.volume, destination }),
      kit.tone({ when: options.when + 0.15, frequency: 880, duration: 0.14, type: 'square', volume: 0.06 * options.volume, destination }),
    ],
  },
  silencio: {
    id: 'silencio', label: 'Silenciar', durationMs: 140, bus: 'ui', spatial: false,
    synthesize: (kit, destination, options) => [
      kit.tone({ when: options.when, frequency: 420, glideTo: 260, duration: 0.1, type: 'sine', volume: 0.07 * options.volume, destination }),
    ],
  },
  celebracion: {
    id: 'celebracion', label: 'Celebración', durationMs: 1300, bus: 'music', spatial: false,
    synthesize: (kit, destination, options) => {
      const when = options.when;
      const voices = [...tones(kit, destination, 392, options.volume, when, [1, 1.25, 1.5, 2, 2.5], 0.1)];
      voices.push(kit.noiseBurst({ when: when + 0.42, duration: 0.5, volume: 0.08 * options.volume, destination, filterHz: 3200, filterType: 'highpass' }));
      return voices;
    },
  },
});

export function effectDefinition(id: EffectId): EffectDefinition {
  return EFFECT_DEFINITIONS[id];
}
