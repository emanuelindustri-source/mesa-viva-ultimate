import { describe, expect, it } from 'vitest';
import * as engine from '../src/index.js';

describe('superficie pública pura del motor 2.5D', () => {
  it('expone la versión y las APIs sin cargar PixiJS', () => {
    expect(engine.ENGINE_25D_VERSION).toBe('0.4.0');
    expect(typeof engine.stageLayoutFor).toBe('function');
    expect(typeof engine.planAtlas).toBe('function');
    expect(typeof engine.MotionSensorEngine).toBe('function');
    expect(typeof engine.snapshotFromBlackjack).toBe('function');
    expect('TableStage' in engine).toBe(false);
    expect('createTableStage' in engine).toBe(false);
  });
});
