import type { AudioContextLike, GainNodeLike } from '../audio/contracts.js';
import { BinauralLayer } from './binaural-layer.js';
import { ChannelBank } from './channel-bank.js';
import { createDiscreteBus } from './discrete-bus.js';
import { createBinauralBus, createStereoBus } from './instrument-bus.js';
import { outputStatus } from './layouts.js';
import type { StudioMasterBus } from './studio-master.js';
import type { InstrumentBus, InstrumentRoute, OutputMode, OutputStatus, ResolvedOutputMode } from './types.js';

export interface MultiChannelOptions {
  readonly mode?: OutputMode;
  readonly binauralLayer?: boolean;
  readonly binauralIntensity?: number;
}

/**
 * Enrutador discreto: detecta el máximo del dispositivo, elige o degrada el
 * modo y asigna cada instrumento a sus altavoces. En 2.0 activa HRTF binaural.
 */
export class MultiChannelRouter {
  readonly status: OutputStatus;
  readonly mode: ResolvedOutputMode;
  private readonly context: AudioContextLike;
  private readonly master: StudioMasterBus;
  private readonly mainInput: GainNodeLike;
  private readonly bank: ChannelBank | null;
  private readonly layer: BinauralLayer | null;
  private readonly buses = new Set<InstrumentBus>();
  private readonly reverbTrims: GainNodeLike[] = [];

  constructor(context: AudioContextLike, master: StudioMasterBus, options: MultiChannelOptions = {}) {
    this.context = context;
    this.master = master;
    this.status = outputStatus(options.mode ?? 'auto', context.destination.maxChannelCount || 2);
    this.mode = this.status.active;
    this.configureDestination();
    this.mainInput = context.createGain();
    this.mainInput.gain.value = 1;
    this.mainInput.connect(master.input);
    if (this.mode === 'binaural') {
      this.layer = new BinauralLayer(context, this.mainInput, {
        enabled: options.binauralLayer ?? true,
        intensity: options.binauralIntensity ?? 0.7,
      });
      this.routeReverbTo([this.mainInput]);
      this.bank = null;
    } else if (this.mode === 'stereo') {
      this.layer = null;
      this.bank = null;
      this.routeReverbTo([this.mainInput]);
    } else {
      this.layer = null;
      this.bank = new ChannelBank(context, this.status.channels, this.mainInput, this.mode === '2.1' ? 2 : 3);
      this.routeReverbTo(this.reverbChannels());
    }
  }

  get binauralLayer(): BinauralLayer | null {
    return this.layer;
  }

  get channelBank(): ChannelBank | null {
    return this.bank;
  }

  get activeBuses(): number {
    return this.buses.size;
  }

  setBinauralEnabled(enabled: boolean): void {
    this.layer?.setEnabled(enabled);
  }

  setBinauralIntensity(intensity: number): void {
    this.layer?.setIntensity(intensity);
  }

  createBus(route: InstrumentRoute): InstrumentBus {
    let bus: InstrumentBus;
    if (this.mode === 'binaural') {
      bus = createBinauralBus(this.context, this.mainInput, route, this.master.reverbSend);
    } else if (this.mode === 'stereo') {
      bus = createStereoBus(this.context, this.mainInput, route, this.master.reverbSend);
    } else {
      const bank = this.bank;
      if (bank === null) throw new Error('Banco de canales no disponible');
      bus = createDiscreteBus(this.context, bank, this.mode, route, this.master.reverbSend);
    }
    const dispose = bus.dispose;
    const tracked: InstrumentBus = {
      input: bus.input,
      route: bus.route,
      dispose: () => {
        dispose();
        this.buses.delete(tracked);
      },
    };
    this.buses.add(tracked);
    return tracked;
  }

  setVolume(volume: number): void {
    this.master.setVolume(volume);
  }

  setMuted(muted: boolean): void {
    this.master.setMuted(muted);
  }

  dispose(): void {
    for (const bus of [...this.buses]) bus.dispose();
    this.buses.clear();
    this.layer?.dispose();
    this.bank?.dispose();
    for (const trim of this.reverbTrims) {
      try {
        trim.disconnect();
      } catch {
        // Nodo ya liberado.
      }
    }
    this.reverbTrims.length = 0;
    try {
      this.mainInput.disconnect();
    } catch {
      // Nodo ya liberado.
    }
  }

  private configureDestination(): void {
    const destination = this.context.destination;
    try {
      destination.channelCount = this.status.channels;
      destination.channelCountMode = 'explicit';
      destination.channelInterpretation = this.status.binaural ? 'speakers' : 'discrete';
    } catch {
      // Dispositivos que ignoran channelCount usan su mezcla nativa.
    }
  }

  private reverbChannels(): readonly GainNodeLike[] {
    const bank = this.bank;
    if (bank === null) return [];
    if (this.mode === '7.1') {
      return [bank.input(6), bank.input(7)].filter((node): node is GainNodeLike => node !== undefined);
    }
    if (this.mode === '5.1' || this.mode === '5.2') {
      return [bank.input(4), bank.input(5)].filter((node): node is GainNodeLike => node !== undefined);
    }
    return [bank.input(0), bank.input(1)].filter((node): node is GainNodeLike => node !== undefined);
  }

  private routeReverbTo(channels: readonly GainNodeLike[]): void {
    for (const channel of channels) {
      const trim = this.context.createGain();
      trim.gain.value = 1 / Math.max(1, channels.length);
      this.master.reverbReturn.connect(trim);
      trim.connect(channel);
      this.reverbTrims.push(trim);
    }
  }
}

export type { InstrumentBus, InstrumentRoute, OutputMode, OutputStatus };
