import type { AudioRuntime } from '../audio/runtime.js';
import { composeLongForm } from '../composer/compose.js';
import { chordAtBeat } from '../composer/harmony.js';
import type { LongFormScore, PerformanceState } from '../composer/types.js';
import type { OrganicOrchestra } from '../instruments/orchestra.js';
import type { InstrumentVoice } from '../instruments/types.js';
import type { FestivalProfile } from '../music/types.js';

export interface ScoreSchedulerOptions {
  readonly seed: number;
  readonly bars: number;
  readonly state: () => PerformanceState;
  readonly profile: () => FestivalProfile;
  readonly orchestra: () => OrganicOrchestra | null;
}

/** Transporte del movimiento largo: eventos, compases, voces y bucles. */
export class ScoreScheduler {
  private readonly runtime: AudioRuntime;
  private readonly options: ScoreSchedulerOptions;
  private score: LongFormScore;
  private eventCursor = 0;
  private movement = 0;
  private startTime = 0;
  private voices: InstrumentVoice[] = [];
  private lastHumMidi: number | null = null;

  constructor(runtime: AudioRuntime, score: LongFormScore, options: ScoreSchedulerOptions) {
    this.runtime = runtime;
    this.score = score;
    this.options = options;
  }

  get currentScore(): LongFormScore {
    return this.score;
  }

  get currentMovement(): number {
    return this.movement;
  }

  get cursor(): number {
    return this.eventCursor;
  }

  get activeVoices(): number {
    return this.voices.length;
  }

  get currentChord(): readonly number[] {
    const context = this.runtime.context;
    if (context === null) return [0, 2, 4];
    const beat = Math.max(0, (context.currentTime - this.startTime) * (this.score.tempo / 60));
    return chordAtBeat(this.score.chords, Math.min(beat, this.score.totalBeats - 0.001));
  }

  reset(score: LongFormScore, startTime: number): void {
    this.stopVoices();
    this.score = score;
    this.startTime = startTime;
    this.eventCursor = 0;
  }

  advance(untilTime: number): number {
    const context = this.runtime.context;
    const orchestra = this.options.orchestra();
    if (context === null || orchestra === null) return 0;
    this.prune(context.currentTime);
    let scheduled = 0;
    while (scheduled < 96) {
      const event = this.score.events[this.eventCursor];
      if (event === undefined) {
        this.nextMovement();
        continue;
      }
      const secondsPerBeat = 60 / this.score.tempo;
      const when = this.startTime + event.timeBeats * secondsPerBeat;
      if (when > untilTime) break;
      const duration = Math.max(0.05, event.durationBeats * secondsPerBeat);
      const previousMidi = event.instrument === 'hum' && this.lastHumMidi !== null ? this.lastHumMidi : undefined;
      const voice = orchestra.play({
        instrument: event.instrument, midi: event.midi, when, duration, velocity: event.velocity,
        ...(event.vowel !== undefined ? { vowel: event.vowel } : {}),
        ...(event.kind !== undefined ? { kind: event.kind } : {}),
        ...(previousMidi !== undefined ? { previousMidi } : {}),
      });
      if (event.instrument === 'hum') this.lastHumMidi = event.midi;
      if (voice !== null) this.voices.push(voice);
      this.eventCursor += 1;
      scheduled += 1;
    }
    return scheduled;
  }

  tick(lookahead: number): void {
    const context = this.runtime.context;
    if (context === null || context.state !== 'running') return;
    this.advance(context.currentTime + lookahead);
  }

  stop(): void {
    this.stopVoices();
  }

  private nextMovement(): void {
    const secondsPerBeat = 60 / this.score.tempo;
    this.startTime += this.score.totalBeats * secondsPerBeat;
    this.movement += 1;
    this.eventCursor = 0;
    this.lastHumMidi = null;
    this.score = composeLongForm(this.options.profile(), this.options.seed + this.movement, {
      bars: this.options.bars,
      state: this.options.state(),
    });
  }

  private prune(now: number): void {
    if (this.voices.length === 0) return;
    this.voices = this.voices.filter((voice) => voice.endsAt + 0.12 > now);
  }

  private stopVoices(): void {
    for (const voice of this.voices) voice.stop();
    this.voices = [];
  }
}
