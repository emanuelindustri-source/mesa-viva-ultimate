import type { GainNodeLike } from '../audio/contracts.js';

export type OutputMode = 'auto' | 'binaural' | 'stereo' | '2.1' | '5.1' | '5.2' | '7.1';

export type ResolvedOutputMode = Exclude<OutputMode, 'auto'>;

export type SpeakerZone =
  | 'front-left'
  | 'front-right'
  | 'center'
  | 'lfe'
  | 'lfe-2'
  | 'surround-left'
  | 'surround-right'
  | 'rear-left'
  | 'rear-right';

export interface LayoutDefinition {
  readonly label: string;
  readonly channels: number;
  readonly zones: readonly SpeakerZone[];
  readonly subwoofers: number;
  readonly description: string;
}

export interface OutputStatus {
  readonly requested: OutputMode;
  readonly active: ResolvedOutputMode;
  readonly label: string;
  readonly channels: number;
  readonly maxChannelCount: number;
  readonly fallback: boolean;
  readonly binaural: boolean;
  readonly description: string;
}

export type InstrumentTarget = 'front' | 'center' | 'lfe' | 'surround' | 'rear';

export interface InstrumentRoute {
  readonly target: InstrumentTarget;
  readonly pan?: number;
  readonly gain?: number;
  readonly reverb?: number;
}

export interface InstrumentBus {
  readonly input: GainNodeLike;
  readonly route: InstrumentRoute;
  dispose(): void;
}
