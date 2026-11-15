import type { SpatialPoint } from './audio/params.js';
import type { TableSpatialLayout } from './audio/spatial-layout.js';
import type { PerformanceState } from './composer/types.js';
import type { OutputMode } from './output/types.js';
import { SensorySessionCore } from './session-core.js';
import type { SensorySessionOptions } from './session-types.js';
import type { HarmonicSfxKind } from './soundtrack/harmonic-sfx.js';
import type { MusicEngineMode } from './soundtrack/soundtrack-controller.js';
import { SpatialLayoutController } from './soundtrack/spatial-layout-controller.js';
import type { PlayerStateInput } from './soundtrack/types.js';
import type { Vec3 } from './types.js';

/** Fachada completa: añade banda sonora de estudio y layout espacial al núcleo. */
export class SensorySession extends SensorySessionCore {
  private readonly layout: SpatialLayoutController;

  constructor(options: SensorySessionOptions = {}) {
    super(options);
    this.layout = new SpatialLayoutController(this.spatial);
  }

  setMusicEngine(mode: MusicEngineMode): void {
    this.soundtrack.setMode(mode);
    if (!this.runtime.isReady) return;
    if (mode === 'studio') {
      this.director.stop();
      this.soundtrack.start();
      this.soundtrack.setMuted(this.preferences.muted || this.faceDown);
    } else {
      this.soundtrack.stop();
      this.director.start();
      this.director.setMuted(this.preferences.muted || this.faceDown);
    }
  }

  setOutputMode(mode: OutputMode): void {
    this.soundtrack.setOutputMode(mode);
  }

  setBinauralEnabled(enabled: boolean): void {
    this.soundtrack.setBinauralEnabled(enabled);
  }

  setPlayerState(input: PlayerStateInput): PerformanceState {
    return this.soundtrack.setPlayerState(input);
  }

  playHarmonicSfx(kind: HarmonicSfxKind, baseMidi = 69) {
    return this.soundtrack.playHarmonicSfx(kind, baseMidi);
  }

  setLayout(layout: TableSpatialLayout): void {
    this.layout.setLayout(layout);
  }

  moveCard(id: string, position: Vec3, fadeSeconds = 0.08): void {
    this.layout.moveCard(id, position, fadeSeconds);
  }

  attachSeat(id: string, position: SpatialPoint): void {
    this.layout.attachSeat(id, position);
  }

  attachCard(id: string, position: SpatialPoint): void {
    this.layout.attachCard(id, position);
  }
}
