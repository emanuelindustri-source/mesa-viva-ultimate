import type { AudioBufferLike, AudioContextLike } from './contracts.js';
import { mulberry32 } from './random.js';

/** Ruido determinista compartido por voz, percusión y cuerdas. */
export function createNoiseBuffer(
  context: AudioContextLike,
  seed = 1,
  seconds = 0.6,
  channels = 1,
): AudioBufferLike {
  const length = Math.max(1, Math.floor(context.sampleRate * Math.max(0.01, seconds)));
  const buffer = context.createBuffer(Math.max(1, channels), length, context.sampleRate);
  const random = mulberry32(seed);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    let smooth = 0;
    for (let index = 0; index < length; index += 1) {
      const white = random() * 2 - 1;
      smooth = smooth * 0.35 + white * 0.65;
      data[index] = smooth;
    }
  }
  return buffer;
}
