import type { AudioRuntime } from '../audio/runtime.js';
import type { PerformanceState } from '../composer/types.js';
import type { FestivalId, MusicPhase } from '../music/types.js';
import type { OutputMode, OutputStatus } from '../output/types.js';
import type { HarmonicSfxKind } from './harmonic-sfx.js';
import { SoundtrackEngine } from './soundtrack-engine.js';
import type { PlayerStateInput, SoundtrackOptions, SoundtrackStatus } from './types.js';

export type MusicEngineMode = 'stems' | 'studio';

export interface SoundtrackControllerOptions extends SoundtrackOptions {
  readonly mode?: MusicEngineMode;
}

/** Controla el ciclo de vida de la banda sonora sin acoplar la sesión al motor. */
export class SoundtrackController {
  private readonly engine: SoundtrackEngine;
  private mode: MusicEngineMode;
  private active = false;

  constructor(runtime: AudioRuntime, options: SoundtrackControllerOptions = {}) {
    this.mode = options.mode ?? 'stems';
    this.engine = new SoundtrackEngine(runtime, options);
  }

  get engineMode(): MusicEngineMode {
    return this.mode;
  }

  get playback(): SoundtrackEngine {
    return this.engine;
  }

  get status(): SoundtrackStatus {
    return this.engine.soundtrackStatus;
  }

  get outputStatus(): OutputStatus {
    return this.engine.outputStatus;
  }

  get currentChord(): readonly number[] {
    return this.engine.currentChord;
  }

  start(): boolean {
    if (this.mode !== 'studio') return false;
    this.active = this.engine.start();
    return this.active;
  }

  stop(): void {
    this.engine.stop();
    this.active = false;
  }

  setMode(mode: MusicEngineMode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    if (mode === 'studio' && this.active) this.active = this.engine.start();
    if (mode === 'stems') this.stop();
  }

  setFestival(id: FestivalId): void {
    this.engine.setFestival(id);
  }

  setOutputMode(mode: OutputMode): void {
    this.engine.setOutputMode(mode);
  }

  setBinauralEnabled(enabled: boolean): void {
    this.engine.setBinauralEnabled(enabled);
  }

  setPlayerState(input: PlayerStateInput): PerformanceState {
    return this.engine.setPlayerState(input);
  }

  setPhase(phase: MusicPhase): void {
    this.engine.setPhase(phase);
  }

  setVolume(volume: number): void {
    this.engine.setVolume(volume);
  }

  setMuted(muted: boolean): void {
    this.engine.setMuted(muted);
  }

  playHarmonicSfx(kind: HarmonicSfxKind, baseMidi = 69) {
    return this.engine.playHarmonicSfx(kind, baseMidi);
  }

  playTableImpact(baseMidi = 36) {
    return this.engine.playTableImpact(baseMidi);
  }

  dispose(): void {
    this.engine.dispose();
    this.active = false;
  }
}
