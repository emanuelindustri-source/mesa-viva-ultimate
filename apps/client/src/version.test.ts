import { describe, expect, it } from 'vitest';
import { APP_PHASE, APP_VERSION } from './version.js';

describe('cliente Mesa Viva', () => {
  it('arranca en la fase 5 con versión sincronizada', () => {
    expect(APP_VERSION).toBe('0.7.0');
    expect(APP_PHASE).toBe(5);
  });
});
