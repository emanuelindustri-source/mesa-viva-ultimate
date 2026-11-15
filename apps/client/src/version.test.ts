import { describe, expect, it } from 'vitest';
import { APP_PHASE, APP_VERSION } from './version.js';

describe('cliente Mesa Viva', () => {
  it('arranca en la fase 3 con versión sincronizada', () => {
    expect(APP_VERSION).toBe('0.4.0');
    expect(APP_PHASE).toBe(3);
  });
});
