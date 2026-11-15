import type { AudioContextLike, AudioNodeLike, GainNodeLike } from '../audio/contracts.js';
import type { FestivalProfile } from '../music/types.js';
import { type HarmonicSfxKind, type HarmonicSfxPlayback, HarmonicSfxPlayer } from './harmonic-sfx.js';

/** Bus de SFX armónicos: chimes al centro y graves de mesa al LFE. */
export class StudioSfxMixer {
  private readonly player: HarmonicSfxPlayer;
  private readonly center: GainNodeLike;
  private readonly lfe: GainNodeLike;
  private volume: number;

  constructor(context: AudioContextLike, masterInput: AudioNodeLike, lfeInput: AudioNodeLike, seed = 23, volume = 0.8) {
    this.player = new HarmonicSfxPlayer(context, seed);
    this.volume = Math.min(1, Math.max(0, volume));
    this.center = context.createGain();
    this.center.gain.value = this.volume;
    this.center.connect(masterInput);
    this.lfe = context.createGain();
    this.lfe.gain.value = this.volume;
    this.lfe.connect(lfeInput);
  }

  get level(): number {
    return this.volume;
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    this.center.gain.value = this.volume;
    this.lfe.gain.value = this.volume;
  }

  playHarmonic(kind: HarmonicSfxKind, baseMidi: number, profile: FestivalProfile, chord: readonly number[], when: number): HarmonicSfxPlayback {
    return this.player.play(kind, baseMidi, profile, chord, this.center, when);
  }

  playImpact(baseMidi: number, profile: FestivalProfile, chord: readonly number[], when: number): HarmonicSfxPlayback {
    return this.player.play('impact', baseMidi, profile, chord, this.lfe, when);
  }

  dispose(): void {
    for (const node of [this.center, this.lfe]) {
      try {
        node.disconnect();
      } catch {
        // Nodo ya liberado.
      }
    }
  }
}
