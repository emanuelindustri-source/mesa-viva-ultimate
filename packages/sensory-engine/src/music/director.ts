import type { AudioRuntime } from '../audio/runtime.js';
import { SynthKit } from '../audio/synth.js';
import { clamp, clamp01 } from '../types.js';
import { festivalProfile } from './festivals.js';
import { StemMixer } from './mixer.js';
import { MusicNoteSynth, type ScheduledMusicVoice } from './note-synth.js';
import { type BarPatterns, buildBarPatterns, notesAt, STEPS_PER_BAR, swingDelay } from './patterns.js';
import { effectiveStemGain, sortedStemsByGain } from './stems.js';
import { deriveTension } from './tension.js';
import { type FestivalId, type FestivalProfile, type MusicDirectorOptions, type MusicDirectorStatus, type MusicPhase, STEM_IDS, type StemId, type TensionInput } from './types.js';

/**
 * Director adaptativo: un solo reloj para ocho stems, crossfades cortos y
 * patrones deterministas. La tensión decide qué capas dominan; la festividad
 * aporta escala, tempo, timbre y acentos.
 */
export class AdaptiveMusicDirector {
  private readonly runtime: AudioRuntime;  private readonly seed: number;
  private readonly autoTick: boolean;
  private readonly tickMs: number;
  private readonly lookahead: number;
  private readonly crossfade: number;
  private readonly maxVoices: number;
  private profile: FestivalProfile;
  private tensionValue: number;
  private phase: MusicPhase = 'turno';
  private running = false;
  private muted = false;
  private volume = 1;
  private stepIndex = 0;
  private nextStepTime = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private mixer: StemMixer | null = null;
  private noteSynth: MusicNoteSynth | null = null;
  private voices: ScheduledMusicVoice[] = [];
  private patterns: BarPatterns | null = null;
  private patternBar = -1;
  private disposed = false;

  constructor(runtime: AudioRuntime, options: MusicDirectorOptions = {}) {
    this.runtime = runtime;
    this.seed = options.seed ?? 29;
    this.autoTick = options.autoTick ?? true;
    this.tickMs = Math.max(10, options.tickMs ?? 30);
    this.lookahead = Math.max(0.05, options.lookaheadSeconds ?? 0.18);
    this.crossfade = Math.max(0.05, options.crossfadeSeconds ?? 0.35);
    this.maxVoices = Math.max(4, Math.floor(options.maxVoices ?? 28));
    this.profile = festivalProfile(options.festival ?? 'dia-normal');
    this.tensionValue = clamp01(options.initialTension ?? 0.18);
  }

  get status(): MusicDirectorStatus {
    return {
      running: this.running,
      festival: this.profile.id,
      musicId: this.profile.musicId,
      tempo: this.profile.tempo,
      tension: this.tensionValue,
      step: this.stepIndex,
      bar: Math.floor(this.stepIndex / STEPS_PER_BAR),
      activeVoices: this.voices.length,
      muted: this.muted,
      volume: this.volume,
    };
  }

  get currentProfile(): FestivalProfile {
    return this.profile;
  }

  get stemLevels(): Readonly<Record<StemId, number>> {
    const levels = {} as Record<StemId, number>;
    for (const stem of STEM_IDS) levels[stem] = effectiveStemGain(stem, this.tensionValue, this.profile);
    return levels;
  }

  start(): boolean {
    if (this.running) return true;
    if (this.disposed) return false;
    const context = this.runtime.context;
    const graph = this.runtime.graph;
    if (context === null || graph === null) return false;
    try {
      if (this.mixer === null) this.mixer = new StemMixer(context, graph, this.volume, this.muted);
      this.mixer.ensureStems();
      this.mixer.applyLevels(this.tensionValue, this.profile, 0);
      this.mixer.setMuted(this.muted);
      this.noteSynth = new MusicNoteSynth(new SynthKit(context, this.seed));
      this.nextStepTime = context.currentTime + 0.06;
      this.stepIndex = 0;
      this.patternBar = -1;
      this.running = true;
      this.tick();
      if (this.autoTick) this.timer = setInterval(() => this.tick(), this.tickMs);
      return true;
    } catch {
      return false;
    }
  }

  /** Programa todos los pasos necesarios; pensado para pruebas sin timers. */
  advance(untilTime: number): number {
    if (!this.running) return 0;
    const context = this.runtime.context;
    if (context === null || this.noteSynth === null) return 0;
    this.pruneVoices(context.currentTime);
    let scheduled = 0;
    while (this.nextStepTime < untilTime && scheduled < 64) {
      this.scheduleStep(this.stepIndex, this.nextStepTime);
      this.stepIndex += 1;
      this.nextStepTime += 60 / this.profile.tempo / 4;
      scheduled += 1;
    }
    return scheduled;
  }

  tick(): void {
    if (!this.running) return;
    const context = this.runtime.context;
    if (context === null || context.state !== 'running') return;
    this.advance(context.currentTime + this.lookahead);
  }

  setTension(input: number | TensionInput): number {
    const next = typeof input === 'number' ? clamp01(input) : deriveTension(input).tension;
    this.phase = typeof input === 'number' ? this.phase : input.phase ?? this.phase;
    this.tensionValue = next;
    this.mixer?.applyLevels(next, this.profile, this.crossfade);
    return next;
  }

  setPhase(phase: MusicPhase): void {
    this.phase = phase;
  }

  setFestival(id: FestivalId): void {
    this.profile = festivalProfile(id);
    this.patterns = null;
    this.patternBar = -1;
    this.mixer?.applyLevels(this.tensionValue, this.profile, this.crossfade);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.mixer?.setMuted(muted);
  }

  setVolume(volume: number): void {
    this.volume = clamp(volume, 0, 1);
    this.mixer?.setVolume(this.volume);
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    for (const voice of this.voices) voice.voice.stop();
    this.voices = [];
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.mixer?.dispose();
    this.mixer = null;
    this.noteSynth = null;
  }

  private scheduleStep(step: number, when: number): void {
    const bar = Math.floor(step / STEPS_PER_BAR);
    const local = step % STEPS_PER_BAR;
    if (this.patterns === null || this.patternBar !== bar) {
      this.patterns = buildBarPatterns(this.profile, this.seed, bar);
      this.patternBar = bar;
    }
    const stepDuration = 60 / this.profile.tempo / 4;
    const delay = swingDelay(local, this.profile.swing, stepDuration);
    for (const stem of sortedStemsByGain(this.tensionValue, this.profile)) {
      const destination = this.mixer?.node(stem);
      if (destination === undefined) continue;
      for (const note of notesAt(this.patterns[stem], local)) {
        if (this.voices.length >= this.maxVoices) return;
        const played = this.noteSynth?.play(stem, this.profile, note, when + delay, stepDuration, destination) ?? [];
        this.voices.push(...played);
      }
    }
  }

  private pruneVoices(now: number): void {
    if (this.voices.length === 0) return;
    this.voices = this.voices.filter((voice) => voice.endsAt + 0.1 > now);
  }
}
