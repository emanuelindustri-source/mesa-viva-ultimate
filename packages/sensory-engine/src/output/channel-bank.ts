import type { AudioContextLike, AudioNodeLike, BiquadFilterLike, ChannelMergerNodeLike, GainNodeLike } from '../audio/contracts.js';

export interface ChannelStrip {
  readonly index: number;
  readonly input: GainNodeLike;
  readonly filters: readonly BiquadFilterLike[];
}

function makeFilters(context: AudioContextLike, index: number, lfeIndex: number): BiquadFilterLike[] {
  if (index === lfeIndex) {
    const low = context.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 118;
    low.Q.value = 0.7;
    return [low];
  }
  const high = context.createBiquadFilter();
  high.type = 'highpass';
  high.frequency.value = 68;
  high.Q.value = 0.7;
  const presence = context.createBiquadFilter();
  presence.type = 'peaking';
  presence.frequency.value = 2400;
  presence.Q.value = 0.8;
  presence.gain.value = -1.2;
  return [high, presence];
}

/** Banco de canales discretos con EQ por altavoz y mezcla 1:1 al destino. */
export class ChannelBank {
  readonly channels: number;
  readonly merger: ChannelMergerNodeLike;
  private readonly strips: ChannelStrip[] = [];

  constructor(context: AudioContextLike, channels: number, destination: AudioNodeLike, lfeIndex = 3) {
    this.channels = Math.max(1, Math.floor(channels));
    this.merger = context.createChannelMerger(this.channels);
    this.merger.channelInterpretation = 'discrete';
    for (let index = 0; index < this.channels; index += 1) {
      const input = context.createGain();
      input.gain.value = 1;
      const filters = makeFilters(context, index, lfeIndex);
      let node: AudioNodeLike = input;
      for (const filter of filters) {
        node.connect(filter);
        node = filter;
      }
      node.connect(this.merger, 0, index);
      this.strips.push({ index, input, filters });
    }
    this.merger.connect(destination);
  }

  input(index: number): GainNodeLike | undefined {
    return this.strips[index]?.input;
  }

  strip(index: number): ChannelStrip | undefined {
    return this.strips[index];
  }

  get lfeStrip(): ChannelStrip | undefined {
    return this.strips.find((strip) => strip.filters.some((filter) => filter.type === 'lowpass'));
  }

  dispose(): void {
    for (const strip of this.strips) {
      try {
        strip.input.disconnect();
        for (const filter of strip.filters) filter.disconnect();
      } catch {
        // Nodo ya liberado.
      }
    }
    try {
      this.merger.disconnect();
    } catch {
      // Nodo ya liberado.
    }
    this.strips.length = 0;
  }
}
