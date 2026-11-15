import { AUDIO_SAMPLE_RATE } from '../version.js';
import type { AudioBufferLike, AudioContextLike } from './contracts.js';
import { type EffectId, effectDefinition } from './effect-sounds.js';
import { AudioGraph } from './graph.js';
import { SynthKit } from './synth.js';

export interface OfflineAudioContextLike extends AudioContextLike {
  startRendering(): Promise<AudioBufferLike>;
}

export type OfflineAudioContextFactory = (
  channels: number,
  length: number,
  sampleRate: number,
) => OfflineAudioContextLike;

export interface OfflinePreviewOptions {
  readonly durationSeconds?: number;
  readonly sampleRate?: number;
  readonly seed?: number;
  readonly effects?: readonly EffectId[];
}

export interface AudioAnalysis {
  readonly frames: number;
  readonly peak: number;
  readonly rms: number;
  readonly durationSeconds: number;
}

export interface OfflinePreviewResult extends AudioAnalysis {
  readonly sampleRate: number;
  readonly effects: readonly EffectId[];
  readonly samples: Float32Array;
}

type OfflineConstructor = new (channels: number, length: number, sampleRate: number) => unknown;

/** El import no toca el DOM: el navegador debe exponer OfflineAudioContext. */
export function defaultOfflineFactory(
  channels: number,
  length: number,
  sampleRate: number,
): OfflineAudioContextLike {
  const scope = globalThis as {
    OfflineAudioContext?: OfflineConstructor;
    webkitOfflineAudioContext?: OfflineConstructor;
  };
  const Constructor = scope.OfflineAudioContext ?? scope.webkitOfflineAudioContext;
  if (Constructor === undefined) throw new Error('OfflineAudioContext no disponible');
  return new Constructor(channels, length, sampleRate) as OfflineAudioContextLike;
}

export function analyzeBuffer(buffer: AudioBufferLike): AudioAnalysis {
  const data = buffer.getChannelData(0);
  let peak = 0;
  let sum = 0;
  for (const sample of data) {
    const value = Math.abs(sample);
    if (value > peak) peak = value;
    sum += sample * sample;
  }
  return {
    frames: data.length,
    peak,
    rms: data.length === 0 ? 0 : Math.sqrt(sum / data.length),
    durationSeconds: buffer.duration,
  };
}

/** Render determinista de efectos para CI y para medir picos sin altavoces. */
export async function renderSensoryPreview(
  options: OfflinePreviewOptions = {},
  factory: OfflineAudioContextFactory = defaultOfflineFactory,
): Promise<OfflinePreviewResult | null> {
  const sampleRate = options.sampleRate ?? AUDIO_SAMPLE_RATE;
  const duration = Math.max(0.1, options.durationSeconds ?? 1.4);
  const frames = Math.max(1, Math.floor(duration * sampleRate));
  const effects = options.effects ?? ['carta-colocar', 'dados-lanzar', 'celebracion'];
  try {
    const context = factory(1, frames, sampleRate);
    const graph = new AudioGraph(context, { masterVolume: 0.8 });
    const kit = new SynthKit(context, options.seed ?? 13);
    effects.forEach((id, index) => {
      const definition = effectDefinition(id);
      const output = context.createGain();
      output.connect(graph.bus(definition.bus));
      definition.synthesize(kit, output, { when: index * 0.06, volume: 1 });
    });
    const buffer = await context.startRendering();
    const analysis = analyzeBuffer(buffer);
    graph.dispose();
    return {
      ...analysis,
      sampleRate,
      effects: [...effects],
      samples: buffer.getChannelData(0),
    };
  } catch {
    return null;
  }
}
