import { describe, expect, it } from 'vitest';
import { analyzeBuffer, renderSensoryPreview } from '../src/audio/offline.js';
import { FakeBuffer, FakeOfflineContext } from './fakes-audio.js';

describe('render offline determinista', () => {
  it('mide pico y RMS de un buffer conocido', () => {
    const buffer = new FakeBuffer(1, 3, 48_000, (_channel, index) => [0.1, -0.5, 0.25][index] ?? 0);
    const analysis = analyzeBuffer(buffer);
    expect(analysis.peak).toBeCloseTo(0.5, 6);
    expect(analysis.rms).toBeCloseTo(Math.sqrt((0.01 + 0.25 + 0.0625) / 3), 6);
    expect(analysis.frames).toBe(3);
    expect(analysis.durationSeconds).toBeCloseTo(3 / 48_000, 8);
  });

  it('rinde efectos a 48 kHz con un OfflineAudioContext inyectado', async () => {
    let rendered: FakeOfflineContext | null = null;
    const result = await renderSensoryPreview(
      { durationSeconds: 0.5, seed: 4, effects: ['carta-colocar', 'barajar', 'victoria'] },
      (channels, length, sampleRate) => {
        rendered = new FakeOfflineContext(channels, length, sampleRate);
        return rendered as never;
      },
    );
    expect(result).not.toBeNull();
    expect(result?.sampleRate).toBe(48_000);
    expect(result?.frames).toBe(24_000);
    expect(result?.effects).toEqual(['carta-colocar', 'barajar', 'victoria']);
    expect(result?.peak).toBeLessThanOrEqual(1);
    expect(result?.rms).toBeGreaterThan(0);
    expect(rendered?.rendering).toBe(true);
    expect((rendered as FakeOfflineContext | null)?.getByKind('oscillator').length).toBeGreaterThan(0);
  });

  it('devuelve null sin OfflineAudioContext o si el render falla', async () => {
    const missing = await renderSensoryPreview({ durationSeconds: 0.2 }, () => {
      throw new Error('sin offline');
    });
    expect(missing).toBeNull();
    if (typeof OfflineAudioContext === 'undefined') {
      expect(await renderSensoryPreview({ durationSeconds: 0.2 })).toBeNull();
    }
  });

  it('es reproducible con la misma semilla y parámetros', async () => {
    const run = () => renderSensoryPreview(
      { durationSeconds: 0.2, seed: 9, effects: ['dados-lanzar'] },
      (channels, length, sampleRate) => new FakeOfflineContext(channels, length, sampleRate) as never,
    );
    const first = await run();
    const second = await run();
    expect(first?.samples).toEqual(second?.samples);
    expect(first?.peak).toBe(second?.peak);
  });
});
