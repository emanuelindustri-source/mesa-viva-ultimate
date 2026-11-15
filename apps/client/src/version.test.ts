import { describe, expect, it } from 'vitest';
import { APP_PHASE, APP_VERSION } from './version.js';

describe('cliente Mesa Viva', () => {
  it('arranca en la fase 6 con versión sincronizada', () => {
    expect(APP_VERSION).toBe('0.8.0');
    expect(APP_PHASE).toBe(6);
  });
});
