import type { AudioBufferLike } from '../src/audio/contracts.js';

let nodeSequence = 0;

export class FakeParam {
  value = 0;
  readonly events: string[] = [];

  setValueAtTime(value: number, time: number): void {
    this.value = value;
    this.events.push(`set:${value}@${time}`);
  }

  linearRampToValueAtTime(value: number, time: number): void {
    this.value = value;
    this.events.push(`linear:${value}@${time}`);
  }

  exponentialRampToValueAtTime(value: number, time: number): void {
    this.value = value;
    this.events.push(`exp:${value}@${time}`);
  }

  cancelScheduledValues(time: number): void {
    this.events.push(`cancel@${time}`);
  }

  setTargetAtTime(value: number, time: number): void {
    this.value = value;
    this.events.push(`target:${value}@${time}`);
  }
}

export class FakeNode {
  readonly nodeId = nodeSequence++;
  readonly kind = 'node';
  readonly connections: FakeNode[] = [];
  disconnected = false;

  connect(destination: FakeNode): FakeNode {
    this.connections.push(destination);
    return destination;
  }

  disconnect(): void {
    this.connections.length = 0;
    this.disconnected = true;
  }
}

export class FakeGain extends FakeNode {
  override readonly kind = 'gain';
  readonly gain = new FakeParam();
}

export class FakeFilter extends FakeNode {
  override readonly kind = 'filter';
  type = 'lowpass';
  readonly frequency = new FakeParam();
  readonly Q = new FakeParam();
  readonly gain = new FakeParam();
}

export class FakePanner extends FakeNode {
  override readonly kind = 'panner';
  panningModel = 'equalpower';
  distanceModel = 'inverse';
  refDistance = 1;
  maxDistance = 10000;
  rolloffFactor = 1;
  readonly positionX = new FakeParam();
  readonly positionY = new FakeParam();
  readonly positionZ = new FakeParam();
}

export class FakeStereoPanner extends FakeNode {
  override readonly kind = 'stereo-panner';
  readonly pan = new FakeParam();
}

export class FakeCompressor extends FakeNode {
  override readonly kind = 'compressor';
  readonly threshold = new FakeParam();
  readonly knee = new FakeParam();
  readonly ratio = new FakeParam();
  readonly attack = new FakeParam();
  readonly release = new FakeParam();
  reduction = 0;
}

export class FakeSource extends FakeNode {
  onended: (() => void) | null = null;
  startedAt: number | null = null;
  stoppedAt: number | null = null;

  start(when = 0): void {
    this.startedAt = when;
  }

  stop(when = 0): void {
    this.stoppedAt = when;
  }
}

export class FakeOscillator extends FakeSource {
  override readonly kind = 'oscillator';
  type = 'sine';
  readonly frequency = new FakeParam();
  readonly detune = new FakeParam();
}

export class FakeBufferSource extends FakeSource {
  override readonly kind = 'buffer-source';
  buffer: AudioBufferLike | null = null;
  readonly playbackRate = new FakeParam();
  loop = false;
}

export class FakeBuffer implements AudioBufferLike {
  readonly duration: number;
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  private readonly channels: Float32Array[];

  constructor(channels: number, length: number, sampleRate: number, fill?: (channel: number, index: number) => number) {
    this.numberOfChannels = channels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.duration = length / sampleRate;
    this.channels = Array.from({ length: channels }, (_, channel) =>
      Float32Array.from({ length }, (_, index) => fill?.(channel, index) ?? 0));
  }

  getChannelData(channel: number): Float32Array {
    return this.channels[channel] ?? new Float32Array(this.length);
  }
}

export class FakeListener {
  readonly positionX = new FakeParam();
  readonly positionY = new FakeParam();
  readonly positionZ = new FakeParam();
  readonly forwardX = new FakeParam();
  readonly forwardY = new FakeParam();
  readonly forwardZ = new FakeParam();
  readonly upX = new FakeParam();
  readonly upY = new FakeParam();
  readonly upZ = new FakeParam();
}
