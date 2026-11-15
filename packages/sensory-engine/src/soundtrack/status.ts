import type { ComposerInstrument, LongFormScore, PerformanceState } from '../composer/types.js';
import type { OrganicOrchestra } from '../instruments/orchestra.js';
import type { FestivalProfile, MusicPhase } from '../music/types.js';
import type { StudioMasterBus, StudioMasterStatus } from '../output/studio-master.js';
import type { OutputStatus } from '../output/types.js';
import type { ScoreScheduler } from './scheduler.js';
import type { SoundtrackStatus } from './types.js';

const EMPTY_LEVELS: Readonly<Record<ComposerInstrument, number>> = Object.freeze({
  hum: 0, rhodes: 0, guitar: 0, bass: 0, marimba: 0, strings: 0, percussion: 0, beatbox: 0,
});

const DEFAULT_MASTER: StudioMasterStatus = Object.freeze({
  volume: 1, muted: false, limiterThresholdDb: -1, limiterRatio: 20, reverbSeconds: 0, reverbRms: 0,
});

export interface SoundtrackStatusInput {
  readonly running: boolean;
  readonly profile: FestivalProfile;
  readonly seed: number;
  readonly score: LongFormScore;
  readonly scheduler: ScoreScheduler | null;
  readonly state: PerformanceState;
  readonly phase: MusicPhase;
  readonly output: OutputStatus;
  readonly master: StudioMasterBus | null;
  readonly orchestra: OrganicOrchestra | null;
  readonly chord: readonly number[];
}

export function buildSoundtrackStatus(input: SoundtrackStatusInput): SoundtrackStatus {
  const scheduler = input.scheduler;
  return {
    running: input.running,
    festival: input.profile.id,
    seed: input.seed,
    tempo: input.profile.tempo,
    totalBars: scheduler?.currentScore.totalBars ?? input.score.totalBars,
    totalBeats: scheduler?.currentScore.totalBeats ?? input.score.totalBeats,
    movement: scheduler?.currentMovement ?? 0,
    eventCursor: scheduler?.cursor ?? 0,
    totalEvents: scheduler?.currentScore.events.length ?? input.score.events.length,
    activeVoices: scheduler?.activeVoices ?? 0,
    chord: input.chord,
    state: input.state,
    phase: input.phase,
    output: input.output,
    master: input.master?.status ?? DEFAULT_MASTER,
    instrumentLevels: input.orchestra?.levels ?? EMPTY_LEVELS,
  };
}
