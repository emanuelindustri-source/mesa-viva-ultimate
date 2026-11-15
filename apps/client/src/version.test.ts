import { describe, expect, it } from 'vitest';
import { APP_PHASE, APP_VERSION } from './version.js';

describe('cliente Mesa Viva', () => {
  it('arranca en la fase 4 con versión sincronizada', () => {
    expect(APP_VERSION).toBe('0.5.0');
    expect(APP_PHASE).toBe(4);
  });
});
