import type { AudioRuntime } from '../audio/runtime.js';
import { composeLongForm } from '../composer/compose.js';
import { chordAtBeat } from '../composer/harmony.js';
import { derivePerformanceState } from '../composer/performance.js';
import type { ComposerInstrument, LongFormScore, PerformanceState } from '../composer/types.js';
import { OrganicOrchestra } from '../instruments/orchestra.js';
import { festivalProfile } from '../music/festivals.js';
import type { FestivalId, FestivalProfile, MusicPhase } from '../music/types.js';
import { outputStatus } from '../output/layouts.js';
import { MultiChannelRouter } from '../output/router.js';
import { StudioMasterBus } from '../output/studio-master.js';
import type { OutputMode, OutputStatus } from '../output/types.js';
import type { HarmonicSfxKind } from './harmonic-sfx.js';
import { ScoreScheduler } from './scheduler.js';
import { StudioSfxMixer } from './sfx-mixer.js';
import { buildSoundtrackStatus } from './status.js';
import type { PlayerStateInput, SoundtrackOptions, SoundtrackStatus } from './types.js';
/** Banda sonora de estudio: orquesta multicanal, voz y compositor de forma larga. */
export class SoundtrackEngine {
  private readonly runtime: AudioRuntime;
  private readonly seed: number;
  private readonly autoTick: boolean;
  private readonly tickMs: number;
  private readonly lookahead: number;
  private readonly bars: number;
  private outputMode: OutputMode;
  private profile: FestivalProfile;
  private score: LongFormScore;
  private state: PerformanceState;
  private phase: MusicPhase = 'turno';
  private master: StudioMasterBus | null = null;
  private router: MultiChannelRouter | null = null;
  private orchestra: OrganicOrchestra | null = null;
  private sfxMixer: StudioSfxMixer | null = null;
  private scheduler: ScoreScheduler | null = null;
  private readonly userMix: Partial<Record<ComposerInstrument, number>> = {};
  private sfxVolume = 0.8;
  private binauralIntensity = 0.7;
  private output: OutputStatus;
  private running = false;
  private muted = false;
  private volume: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  constructor(runtime: AudioRuntime, options: SoundtrackOptions = {}) {
    this.runtime = runtime;
    this.seed = options.seed ?? 101;
    this.autoTick = options.autoTick ?? true;
    this.tickMs = Math.max(10, options.tickMs ?? 30);
    this.lookahead = Math.max(0.05, options.lookaheadSeconds ?? 0.22);
    this.bars = Math.min(64, Math.max(32, Math.floor(options.bars ?? 48)));
    this.outputMode = options.outputMode ?? 'auto';
    this.profile = festivalProfile(options.festival ?? 'dia-normal');
    this.state = options.state ?? 'calma';
    this.volume = options.volume ?? 1;
    this.output = outputStatus(this.outputMode, 2);
    this.score = composeLongForm(this.profile, this.seed, { bars: this.bars, state: this.state });
  }
  get soundtrackStatus(): SoundtrackStatus {
    return buildSoundtrackStatus({
      running: this.running, profile: this.profile, seed: this.seed, score: this.score,
      scheduler: this.scheduler, state: this.state, phase: this.phase, output: this.output,
      master: this.master, orchestra: this.orchestra, chord: this.currentChord,
    });
  }
  get currentChord(): readonly number[] {
    if (this.scheduler !== null) return this.scheduler.currentChord;
    return chordAtBeat(this.score.chords, 0);
  }
  get outputStatus(): OutputStatus {
    return this.output;
  }
  start(): boolean {
    if (this.running) return true;
    const context = this.runtime.context;
    const graph = this.runtime.graph;
    if (context === null || graph === null) return false;
    try {
      this.master = new StudioMasterBus(context, graph.masterNode, { volume: this.volume, muted: this.muted, seed: this.seed });
      this.router = new MultiChannelRouter(context, this.master, { mode: this.outputMode });
      this.output = this.router.status;
      this.orchestra = new OrganicOrchestra(context, this.router, this.seed);
      this.orchestra.setUserMix(this.userMix);
      this.router.setBinauralIntensity(this.binauralIntensity);
      this.sfxMixer = new StudioSfxMixer(context, this.master.input, this.orchestra.bus('bass')?.input ?? this.master.input, this.seed, this.sfxVolume);
      this.orchestra.setEnergy(this.state);
      this.score = composeLongForm(this.profile, this.seed, { bars: this.bars, state: this.state });
      this.scheduler = new ScoreScheduler(this.runtime, this.score, {
        seed: this.seed, bars: this.bars, state: () => this.state,
        profile: () => this.profile, orchestra: () => this.orchestra,
      });
      this.scheduler.reset(this.score, context.currentTime + 0.08);
      this.running = true;
      this.tick();
      if (this.autoTick) this.timer = setInterval(() => this.tick(), this.tickMs);
      return true;
    } catch {
      this.disposeGraph();
      return false;
    }
  }
  advance(untilTime: number): number {
    return this.running ? this.scheduler?.advance(untilTime) ?? 0 : 0;
  }
  tick(): void {
    if (this.running) this.scheduler?.tick(this.lookahead);
  }
  setFestival(id: FestivalId): void {
    this.profile = festivalProfile(id);
    const context = this.runtime.context;
    if (!this.running || context === null || this.scheduler === null) return;
    this.score = composeLongForm(this.profile, this.seed, { bars: this.bars, state: this.state });
    this.scheduler.reset(this.score, context.currentTime + 0.08);
  }
  setOutputMode(mode: OutputMode): void {
    if (mode === this.outputMode) return;
    this.outputMode = mode;
    if (!this.running) {
      this.output = outputStatus(mode, 2);
      return;
    }
    this.stop();
    this.disposeGraph();
    this.start();
  }
  setBinauralEnabled(enabled: boolean): void {
    this.router?.setBinauralEnabled(enabled);
  }
  setPlayerState(input: PlayerStateInput): PerformanceState {
    const next = typeof input === 'string' ? input : derivePerformanceState(input);
    if (next !== this.state) {
      this.state = next;
      this.orchestra?.setEnergy(next);
    }
    return next;
  }
  setUserMix(mix: Partial<Record<ComposerInstrument, number>>): void {
    for (const [instrument, value] of Object.entries(mix) as [ComposerInstrument, number][]) {
      this.userMix[instrument] = value;
    }
    this.orchestra?.setUserMix(mix);
  }
  setBinauralIntensity(intensity: number): void {
    this.binauralIntensity = Math.min(1, Math.max(0, intensity));
    this.router?.setBinauralIntensity(this.binauralIntensity);
  }
  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.min(1, Math.max(0, volume));
    this.sfxMixer?.setVolume(this.sfxVolume);
  }
  setPhase(phase: MusicPhase): void {
    this.phase = phase;
  }
  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    this.master?.setVolume(this.volume);
  }
  setMuted(muted: boolean): void {
    this.muted = muted;
    this.master?.setMuted(muted);
  }
  playHarmonicSfx(kind: HarmonicSfxKind, baseMidi = 69) {
    const context = this.runtime.context;
    if (context === null || this.sfxMixer === null) return null;
    return this.sfxMixer.playHarmonic(kind, baseMidi, this.profile, this.currentChord, context.currentTime + 0.02);
  }
  playTableImpact(baseMidi = 36) {
    const context = this.runtime.context;
    if (context === null || this.sfxMixer === null) return null;
    return this.sfxMixer.playImpact(baseMidi, this.profile, this.currentChord, context.currentTime + 0.01);
  }
  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.running = false;
    this.scheduler?.stop();
  }
  dispose(): void {
    this.stop();
    this.disposeGraph();
  }
  private disposeGraph(): void {
    this.orchestra?.dispose();
    this.router?.dispose();
    this.master?.dispose();
    this.sfxMixer?.dispose();
    this.sfxMixer = null;
    this.orchestra = null;
    this.router = null;
    this.master = null;
    this.scheduler = null;
  }
}
