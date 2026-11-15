import type { AudioNodeLike } from '../audio/contracts.js';
import type { SynthKit, SynthVoice } from '../audio/synth.js';
import { noteFrequency } from './patterns.js';
import type { FestivalProfile, NoteEvent, StemId } from './types.js';

export interface ScheduledMusicVoice {
  readonly stem: StemId;
  readonly voice: SynthVoice;
  readonly endsAt: number;
}

function instrumentWave(profile: FestivalProfile): string {
  switch (profile.instrument) {
    case 'campanas':
    case 'metal':
      return 'triangle';
    case 'flauta':
      return 'sine';
    case 'marimba':
      return 'triangle';
    case 'coro':
      return 'sawtooth';
    case 'citara':
      return 'square';
    case 'sintetizador':
      return 'square';
    default:
      return 'triangle';
  }
}

/** Síntesis de una nota de stem; todo procedural, sin samples externos. */
export class MusicNoteSynth {
  private readonly kit: SynthKit;

  constructor(kit: SynthKit) {
    this.kit = kit;
  }

  play(
    stem: StemId,
    profile: FestivalProfile,
    note: NoteEvent,
    when: number,
    stepDuration: number,
    destination: AudioNodeLike,
  ): readonly ScheduledMusicVoice[] {
    const frequency = noteFrequency(profile, note);
    const duration = Math.max(0.08, note.durationSteps * stepDuration);
    const velocity = Math.min(1, Math.max(0.05, note.velocity));
    try {
      if (stem === 'pulso') {
        const voice = this.kit.tone({
          when, frequency: 82 + note.degree * 6, glideTo: 48, duration: 0.16,
          type: 'sine', volume: 0.34 * velocity, destination, release: 0.14,
        });
        return [{ stem, voice, endsAt: when + 0.24 }];
      }
      if (stem === 'acento' && (profile.accent === 'tambor' || profile.accent === 'palmas' || profile.accent === 'fuegos')) {
        const voice = this.kit.noiseBurst({
          when, duration: Math.min(0.2, duration), volume: 0.18 * velocity, destination,
          filterHz: profile.accent === 'tambor' ? 320 : 1800,
          filterType: profile.accent === 'tambor' ? 'lowpass' : 'bandpass',
        });
        return [{ stem, voice, endsAt: when + duration }];
      }
      const common = { when, frequency, duration, destination, volume: 0.1 * velocity, release: duration * 0.95 };
      if (stem === 'bajo') {
        return [{ stem, voice: this.kit.tone({ ...common, type: 'sawtooth', volume: 0.18 * velocity, filterHz: 460 }), endsAt: when + duration }];
      }
      if (stem === 'pad') {
        return [{ stem, voice: this.kit.tone({ ...common, type: 'triangle', attack: 0.22, volume: 0.09 * velocity, detune: 3, filterHz: 1500 }), endsAt: when + duration }];
      }
      if (stem === 'arpegio') {
        return [{ stem, voice: this.kit.tone({ ...common, type: 'triangle', volume: 0.08 * velocity, filterHz: 3400 }), endsAt: when + duration }];
      }
      if (stem === 'melodia') {
        return [{ stem, voice: this.kit.tone({ ...common, type: 'triangle', volume: 0.12 * velocity, filterHz: 2800 }), endsAt: when + duration }];
      }
      if (stem === 'campanas') {
        return [{ stem, voice: this.kit.tone({ ...common, frequency: frequency * 2, type: 'sine', volume: 0.06 * velocity, detune: 7, release: duration + 0.12 }), endsAt: when + duration + 0.12 }];
      }
      if (stem === 'coro') {
        return [{ stem, voice: this.kit.tone({ ...common, type: 'sawtooth', attack: 0.16, volume: 0.07 * velocity, detune: -4, filterHz: 980 }), endsAt: when + duration }];
      }
      return [{ stem, voice: this.kit.tone({ ...common, type: instrumentWave(profile), frequency: frequency * 2, volume: 0.09 * velocity }), endsAt: when + duration }];
    } catch {
      return [];
    }
  }
}
