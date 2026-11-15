import type { AudioContextLike } from '../audio/contracts.js';
import { rampParam } from '../audio/params.js';
import { SynthKit } from '../audio/synth.js';
import type { ComposerInstrument, PerformanceState, ScorePercussion } from '../composer/types.js';
import type { MultiChannelRouter } from '../output/router.js';
import type { InstrumentBus, InstrumentRoute } from '../output/types.js';
import { VocalHumSynth } from '../vocal/vocal-hum-synth.js';
import { KarplusSynth } from './karplus.js';
import { DoubleBassSynth, MarimbaSynth, StringsSynth } from './low-and-strings.js';
import { BeatboxSynth, LatinPercussionSynth } from './percussion.js';
import { RhodesSynth } from './rhodes.js';
import type { InstrumentVoice } from './types.js';

export interface OrchestraEvent {
  readonly instrument: ComposerInstrument;
  readonly midi: number;
  readonly when: number;
  readonly duration: number;
  readonly velocity: number;
  readonly vowel?: 'm' | 'u' | 'o';
  readonly previousMidi?: number;
  readonly kind?: ScorePercussion;
}

const BUSES: Readonly<Record<ComposerInstrument, InstrumentRoute>> = Object.freeze({
  rhodes: { target: 'front', pan: 0.28, gain: 0.92 },
  guitar: { target: 'front', pan: -0.32, gain: 0.88, reverb: 0.08 },
  bass: { target: 'lfe', gain: 1 },
  marimba: { target: 'surround', pan: 0.38, gain: 0.82, reverb: 0.12 },
  strings: { target: 'rear', pan: 0.12, gain: 0.78, reverb: 0.55 },
  percussion: { target: 'surround', pan: -0.4, gain: 0.85 },
  beatbox: { target: 'surround', pan: 0, gain: 0.7 },
  hum: { target: 'center', gain: 1, reverb: 0.12 },
});

function energyMix(state: PerformanceState): Readonly<Partial<Record<ComposerInstrument, number>>> {
  if (state === 'concentracion') return { rhodes: 0.9, hum: 1.1, strings: 1.08, percussion: 0.35, beatbox: 0.15, marimba: 0.5, guitar: 0.7 };
  if (state === 'energia') return { percussion: 1.05, beatbox: 0.8, marimba: 0.95, bass: 1.08, guitar: 0.92 };
  if (state === 'climax') return { percussion: 1.2, beatbox: 1, marimba: 1.1, bass: 1.22, hum: 1.12, strings: 1.15 };
  return {};
}

/** Orquesta orgánica con buses propios y mezcla adaptable al estado del jugador. */
export class OrganicOrchestra {
  private readonly context: AudioContextLike;
  private readonly buses = new Map<ComposerInstrument, InstrumentBus>();
  private readonly targets = new Map<ComposerInstrument, number>();
  private readonly rhodes: RhodesSynth;
  private readonly guitar: KarplusSynth;
  private readonly bass: DoubleBassSynth;
  private readonly marimba: MarimbaSynth;
  private readonly strings: StringsSynth;
  private readonly percussion: LatinPercussionSynth;
  private readonly beatbox: BeatboxSynth;
  readonly vocal: VocalHumSynth;

  constructor(context: AudioContextLike, router: MultiChannelRouter, seed = 1) {
    this.context = context;
    for (const [instrument, route] of Object.entries(BUSES) as [ComposerInstrument, InstrumentRoute][]) {
      this.buses.set(instrument, router.createBus(route));
      this.targets.set(instrument, route.gain ?? 0.9);
    }
    this.rhodes = new RhodesSynth(new SynthKit(context, seed));
    this.guitar = new KarplusSynth(context, { seed: seed + 1, brightness: 5200, damping: 0.955, volume: 0.15 });
    this.bass = new DoubleBassSynth(new SynthKit(context, seed + 2));
    this.marimba = new MarimbaSynth(new SynthKit(context, seed + 3));
    this.strings = new StringsSynth(new SynthKit(context, seed + 4));
    this.percussion = new LatinPercussionSynth(new SynthKit(context, seed + 5));
    this.beatbox = new BeatboxSynth(new SynthKit(context, seed + 6));
    this.vocal = new VocalHumSynth(context, { seed: seed + 7 });
  }

  get levels(): Readonly<Record<ComposerInstrument, number>> {
    const levels = {} as Record<ComposerInstrument, number>;
    for (const [instrument, gain] of this.targets) levels[instrument] = gain;
    return levels;
  }

  bus(instrument: ComposerInstrument): InstrumentBus | undefined {
    return this.buses.get(instrument);
  }

  setEnergy(state: PerformanceState): void {
    const mix = energyMix(state);
    const time = this.context.currentTime;
    for (const [instrument, bus] of this.buses) {
      const base = BUSES[instrument].gain ?? 0.9;
      const target = base * (mix[instrument] ?? 1);
      this.targets.set(instrument, target);
      rampParam(bus.input.gain, target, time, 0.6);
    }
  }

  play(event: OrchestraEvent): InstrumentVoice | null {
    const bus = this.buses.get(event.instrument);
    if (bus === undefined) return null;
    const when = Math.max(this.context.currentTime, event.when);
    if (event.instrument === 'hum') {
      const voice = this.vocal.play({
        midi: event.midi, when, duration: event.duration, velocity: event.velocity,
        vowel: event.vowel ?? 'm', portamentoSeconds: 0.07,
        ...(event.previousMidi !== undefined ? { previousMidi: event.previousMidi } : {}),
      }, bus.input);
      return { instrument: 'hum', endsAt: voice.endsAt, stop: (at) => voice.stop(at) };
    }
    const note = { midi: event.midi, when, duration: event.duration, velocity: event.velocity };
    if (event.instrument === 'rhodes') return this.rhodes.play(note, bus.input);
    if (event.instrument === 'guitar') return this.guitar.play(note, bus.input);
    if (event.instrument === 'bass') return this.bass.play(note, bus.input);
    if (event.instrument === 'marimba') return this.marimba.play(note, bus.input);
    if (event.instrument === 'strings') return this.strings.play(note, bus.input);
    if (event.instrument === 'percussion') {
      return this.percussion.play(event.kind === 'snare' ? 'clap' : event.kind ?? 'shaker', when, event.velocity, bus.input);
    }
    const beatboxKind = event.kind === 'kick' ? 'kick' : event.kind === 'snare' ? 'snare' : 'hat';
    return this.beatbox.play(beatboxKind, when, event.velocity, bus.input);
  }

  dispose(): void {
    for (const bus of this.buses.values()) bus.dispose();
    this.buses.clear();
  }
}
