import type { ComposerInstrument, PerformanceState, PlayerMusicalState } from '../composer/types.js';
import type { FestivalId, MusicPhase } from '../music/types.js';
import type { StudioMasterStatus } from '../output/studio-master.js';
import type { OutputMode, OutputStatus } from '../output/types.js';

export interface SoundtrackOptions {
  readonly seed?: number;
  readonly festival?: FestivalId;
  readonly outputMode?: OutputMode;
  readonly autoTick?: boolean;
  readonly tickMs?: number;
  readonly lookaheadSeconds?: number;
  readonly bars?: number;
  readonly state?: PerformanceState;
  readonly binaural?: boolean;
  readonly volume?: number;
}

export interface SoundtrackStatus {
  readonly running: boolean;
  readonly festival: FestivalId;
  readonly seed: number;
  readonly tempo: number;
  readonly totalBars: number;
  readonly totalBeats: number;
  readonly movement: number;
  readonly eventCursor: number;
  readonly totalEvents: number;
  readonly activeVoices: number;
  readonly chord: readonly number[];
  readonly state: PerformanceState;
  readonly phase: MusicPhase;
  readonly output: OutputStatus;
  readonly master: StudioMasterStatus;
  readonly instrumentLevels: Readonly<Record<ComposerInstrument, number>>;
}

export type PlayerStateInput = PerformanceState | PlayerMusicalState;
