/** Contratos mínimos de Web Audio para poder probar el motor sin navegador. */

export interface AudioParamLike {
  value: number;
  setValueAtTime(value: number, startTime: number): void;
  linearRampToValueAtTime(value: number, endTime: number): void;
  exponentialRampToValueAtTime(value: number, endTime: number): void;
  cancelScheduledValues(startTime: number): void;
  setTargetAtTime(target: number, startTime: number, timeConstant: number): void;
}

export interface AudioNodeLike {
  connect(destination: AudioNodeLike, output?: number, input?: number): AudioNodeLike;
  disconnect(): void;
}

export interface AudioDestinationLike extends AudioNodeLike {
  channelCount: number;
  channelCountMode: string;
  channelInterpretation: string;
  readonly maxChannelCount: number;
}

export interface ChannelMergerNodeLike extends AudioNodeLike {
  readonly channelCount: number;
  readonly channelCountMode: string;
  channelInterpretation: string;
  readonly numberOfInputs: number;
}

export interface AudioScheduledSourceLike extends AudioNodeLike {
  onended: (() => void) | null;
  start(when?: number): void;
  stop(when?: number): void;
}

export interface GainNodeLike extends AudioNodeLike {
  gain: AudioParamLike;
}

export interface BiquadFilterLike extends AudioNodeLike {
  type: string;
  frequency: AudioParamLike;
  Q: AudioParamLike;
  gain: AudioParamLike;
}

export interface PannerNodeLike extends AudioNodeLike {
  panningModel: string;
  distanceModel: string;
  refDistance: number;
  maxDistance: number;
  rolloffFactor: number;
  positionX: AudioParamLike;
  positionY: AudioParamLike;
  positionZ: AudioParamLike;
}

export interface StereoPannerNodeLike extends AudioNodeLike {
  pan: AudioParamLike;
}

export interface CompressorNodeLike extends AudioNodeLike {
  threshold: AudioParamLike;
  knee: AudioParamLike;
  ratio: AudioParamLike;
  attack: AudioParamLike;
  release: AudioParamLike;
  reduction: number;
}

export interface OscillatorNodeLike extends AudioScheduledSourceLike {
  type: string;
  frequency: AudioParamLike;
  detune: AudioParamLike;
}

export interface AudioBufferLike {
  readonly duration: number;
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  getChannelData(channel: number): Float32Array;
}

export interface AudioBufferSourceLike extends AudioScheduledSourceLike {
  buffer: AudioBufferLike | null;
  playbackRate: AudioParamLike;
  loop: boolean;
}

export interface DelayNodeLike extends AudioNodeLike {
  delayTime: AudioParamLike;
}

export interface ConvolverNodeLike extends AudioNodeLike {
  buffer: AudioBufferLike | null;
  normalize: boolean;
}

export interface WaveShaperNodeLike extends AudioNodeLike {
  curve: Float32Array | null;
  oversample: string;
}

export interface AudioListenerLike {
  positionX: AudioParamLike;
  positionY: AudioParamLike;
  positionZ: AudioParamLike;
  forwardX: AudioParamLike;
  forwardY: AudioParamLike;
  forwardZ: AudioParamLike;
  upX: AudioParamLike;
  upY: AudioParamLike;
  upZ: AudioParamLike;
}

/** Superficie usada por el motor; el AudioContext real se adapta al construir. */
export interface AudioContextLike {
  readonly sampleRate: number;
  readonly currentTime: number;
  readonly state: string;
  readonly destination: AudioDestinationLike;
  readonly listener: AudioListenerLike;
  createGain(): GainNodeLike;
  createBiquadFilter(): BiquadFilterLike;
  createPanner(): PannerNodeLike;
  createStereoPanner(): StereoPannerNodeLike;
  createDynamicsCompressor(): CompressorNodeLike;
  createOscillator(): OscillatorNodeLike;
  createBufferSource(): AudioBufferSourceLike;
  createBuffer(channels: number, length: number, sampleRate: number): AudioBufferLike;
  createDelay(maxDelaySeconds?: number): DelayNodeLike;
  createConvolver(): ConvolverNodeLike;
  createWaveShaper(): WaveShaperNodeLike;
  createChannelMerger(numberOfInputs?: number): ChannelMergerNodeLike;
  resume(): Promise<void>;
  suspend(): Promise<void>;
  close(): Promise<void>;
}

export type AudioContextFactory = (sampleRate: number) => AudioContextLike;
