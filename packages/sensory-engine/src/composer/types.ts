import type { FestivalId } from '../music/types.js';

export type PerformanceState = 'calma' | 'concentracion' | 'energia' | 'climax';

export interface PlayerMusicalState {
  readonly idleSeconds?: number;
  readonly streak?: number;
  readonly chants?: number;
  readonly tension?: number;
}

export type ComposerLead = 'hum' | 'rhodes' | 'guitar';

export type ComposerInstrument =
  | 'hum'
  | 'rhodes'
  | 'guitar'
  | 'bass'
  | 'marimba'
  | 'strings'
  | 'percussion'
  | 'beatbox';

export interface MotifCell {
  readonly degree: number;
  readonly durationBeats: number;
  readonly velocity: number;
}

export interface Motif {
  readonly id: string;
  readonly cells: readonly MotifCell[];
  readonly contour: 'asc' | 'desc' | 'wave';
}

export interface LongFormSection {
  readonly index: number;
  readonly startBar: number;
  readonly bars: number;
  readonly tonic: number;
  readonly chordDegrees: readonly number[];
  readonly energy: number;
  readonly lead: ComposerLead;
  readonly responder: ComposerLead;
}

export interface ChordSlot {
  readonly startBeat: number;
  readonly endBeat: number;
  readonly degrees: readonly number[];
  readonly tonic: number;
  readonly section: number;
}

export type ScorePercussion = 'shaker' | 'maracas' | 'cajon' | 'clap' | 'kick' | 'hat' | 'snare';

export interface ScoreEvent {
  readonly timeBeats: number;
  readonly durationBeats: number;
  readonly instrument: ComposerInstrument;
  readonly midi: number;
  readonly velocity: number;
  readonly vowel?: 'm' | 'u' | 'o';
  readonly kind?: ScorePercussion;
  readonly section: number;
  readonly chordDegree: number;
}

export interface LongFormScore {
  readonly festival: FestivalId;
  readonly seed: number;
  readonly tempo: number;
  readonly totalBars: number;
  readonly totalBeats: number;
  readonly sections: readonly LongFormSection[];
  readonly chords: readonly ChordSlot[];
  readonly events: readonly ScoreEvent[];
}

export interface ComposeOptions {
  readonly bars?: number;
  readonly state?: PerformanceState;
}
