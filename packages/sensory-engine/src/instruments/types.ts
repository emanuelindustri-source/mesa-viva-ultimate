import type { AudioContextLike, AudioNodeLike, AudioScheduledSourceLike } from '../audio/contracts.js';

export type InstrumentName = 'rhodes' | 'guitar' | 'bass' | 'marimba' | 'strings' | 'percussion' | 'beatbox';

export type PercussionKind = 'shaker' | 'maracas' | 'cajon' | 'clap' | 'kick' | 'hat';

export type BeatboxKind = 'kick' | 'snare' | 'hat';

export interface InstrumentNote {
  readonly midi: number;
  readonly when: number;
  readonly duration: number;
  readonly velocity: number;
}

export interface InstrumentVoice {
  readonly instrument: InstrumentName | 'hum';
  readonly endsAt: number;
  stop(when?: number): void;
}

export interface VoiceNodes {
  readonly nodes: readonly AudioNodeLike[];
  readonly sources: readonly AudioScheduledSourceLike[];
}

export function makeVoice(
  context: AudioContextLike,
  instrument: InstrumentName | 'hum',
  parts: VoiceNodes,
  endsAt: number,
): InstrumentVoice {
  let stopped = false;
  return {
    instrument,
    endsAt,
    stop: (when = context.currentTime) => {
      if (stopped) return;
      stopped = true;
      for (const source of parts.sources) {
        try {
          source.stop(Math.max(context.currentTime, when));
        } catch {
          // La fuente ya terminó.
        }
      }
      for (const node of parts.nodes) {
        try {
          node.disconnect();
        } catch {
          // Nodo ya liberado.
        }
      }
    },
  };
}
