import type { AudioBufferLike, AudioContextLike } from '../audio/contracts.js';
import { mulberry32 } from '../audio/random.js';

/**
 * Impulso procedural de sala de madera: reflexiones tempranas, cola difusa
 * determinista y caída oscura. No descarga ni decodifica ningún archivo.
 */
export function createWoodRoomImpulse(
  context: AudioContextLike,
  seed = 17,
  seconds = 1.8,
  channels = 2,
): AudioBufferLike {
  const duration = Math.max(0.25, seconds);
  const length = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(Math.max(1, channels), length, context.sampleRate);
  const random = mulberry32(seed);
  const reflections = [0.011, 0.017, 0.023, 0.031, 0.047];
  const amplitudes = [0.54, 0.38, 0.27, 0.18, 0.12];
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    let low = 0;
    for (let index = 0; index < length; index += 1) {
      const time = index / context.sampleRate;
      const decay = Math.exp(-time * 3.15);
      const noise = random() * 2 - 1;
      low = low * 0.72 + noise * 0.28;
      data[index] = low * decay * 0.2;
    }
    for (let index = 0; index < reflections.length; index += 1) {
      const sample = Math.floor((reflections[index] ?? 0) * context.sampleRate + channel * 13);
      if (sample < length) data[sample] = (data[sample] ?? 0) + (amplitudes[index] ?? 0) * (channel === 0 ? 1 : -0.92);
    }
    normalizeChannel(data, 0.82);
  }
  return buffer;
}

function normalizeChannel(data: Float32Array, peakTarget: number): void {
  let peak = 0;
  for (const sample of data) peak = Math.max(peak, Math.abs(sample));
  if (peak <= 0.0001) return;
  const gain = peakTarget / peak;
  for (let index = 0; index < data.length; index += 1) data[index] = (data[index] ?? 0) * gain;
}

export function impulseRms(buffer: AudioBufferLike): number {
  const data = buffer.getChannelData(0);
  let sum = 0;
  for (const sample of data) sum += sample * sample;
  return data.length === 0 ? 0 : Math.sqrt(sum / data.length);
}
