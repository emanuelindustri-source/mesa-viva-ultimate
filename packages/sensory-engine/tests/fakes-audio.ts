import type { AudioContextLike } from '../src/audio/contracts.js';
import {
  FakeBuffer,
  FakeBufferSource,
  FakeCompressor,
  FakeFilter,
  FakeGain,
  FakeListener,
  FakeNode,
  FakeOscillator,
  FakePanner,
  FakeStereoPanner,
} from './fakes-nodes.js';

export * from './fakes-nodes.js';

export class FakeContext {
  readonly sampleRate: number;
  currentTime = 0;
  state = 'suspended';
  readonly destination = new FakeNode();
  readonly listener = new FakeListener();
  readonly created: FakeNode[] = [];
  resumeCalls = 0;
  closeCalls = 0;

  constructor(sampleRate = 48_000) {
    this.sampleRate = sampleRate;
  }

  createGain(): FakeGain {
    const node = new FakeGain();
    this.created.push(node);
    return node;
  }

  createBiquadFilter(): FakeFilter {
    const node = new FakeFilter();
    this.created.push(node);
    return node;
  }

  createPanner(): FakePanner {
    const node = new FakePanner();
    this.created.push(node);
    return node;
  }

  createStereoPanner(): FakeStereoPanner {
    const node = new FakeStereoPanner();
    this.created.push(node);
    return node;
  }

  createDynamicsCompressor(): FakeCompressor {
    const node = new FakeCompressor();
    this.created.push(node);
    return node;
  }

  createOscillator(): FakeOscillator {
    const node = new FakeOscillator();
    this.created.push(node);
    return node;
  }

  createBufferSource(): FakeBufferSource {
    const node = new FakeBufferSource();
    this.created.push(node);
    return node;
  }

  createBuffer(channels: number, length: number, sampleRate: number): FakeBuffer {
    return new FakeBuffer(channels, length, sampleRate, (_channel, index) => (index % 7) / 7 - 0.5);
  }

  createDelay(): FakeNode {
    const node = new FakeNode();
    this.created.push(node);
    return node;
  }

  createConvolver(): FakeNode {
    const node = new FakeNode();
    this.created.push(node);
    return node;
  }

  createWaveShaper(): FakeNode {
    const node = new FakeNode();
    this.created.push(node);
    return node;
  }

  async resume(): Promise<void> {
    this.resumeCalls += 1;
    this.state = 'running';
  }

  async suspend(): Promise<void> {
    this.state = 'suspended';
  }

  async close(): Promise<void> {
    this.state = 'closed';
    this.closeCalls += 1;
  }

  getByKind(kind: string): FakeNode[] {
    return this.created.filter((node) => node.kind === kind);
  }

  asAudioContext(): AudioContextLike {
    return this as unknown as AudioContextLike;
  }
}

export class FakeOfflineContext extends FakeContext {
  readonly rendered: FakeBuffer;
  rendering = false;

  constructor(channels: number, length: number, sampleRate: number, fill?: (channel: number, index: number) => number) {
    super(sampleRate);
    this.state = 'suspended';
    this.rendered = new FakeBuffer(channels, length, sampleRate, fill ?? ((_channel, index) => Math.sin(index / 4) * 0.5));
  }

  startRendering(): Promise<FakeBuffer> {
    this.rendering = true;
    this.state = 'closed';
    return Promise.resolve(this.rendered);
  }
}

export function fakeFactory(context = new FakeContext()): {
  readonly context: FakeContext;
  readonly factory: (sampleRate: number) => AudioContextLike;
  readonly calls: number[];
} {
  const calls: number[] = [];
  return {
    context,
    calls,
    factory: (sampleRate: number) => {
      calls.push(sampleRate);
      return context.asAudioContext();
    },
  };
}
