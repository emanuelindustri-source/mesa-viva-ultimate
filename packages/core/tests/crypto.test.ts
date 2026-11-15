import { describe, expect, it } from 'vitest';
import { hmacSha256Hex, timingSafeEqualHex } from '../src/economy/crypto/hmac.js';
import { sha256Hex } from '../src/economy/crypto/sha256.js';

describe('SHA-256 y HMAC puros', () => {
  it('coincide con los vectores oficiales de SHA-256', () => {
    expect(sha256Hex('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    expect(sha256Hex('Mesa Viva')).toHaveLength(64);
  });

  it('coincide con el vector RFC 4231 de HMAC-SHA256', () => {
    expect(hmacSha256Hex('Jefe', 'what do ya want for nothing?')).toBe(
      '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
    );
    expect(hmacSha256Hex('clave-larga', 'mensaje')).toHaveLength(64);
  });

  it('compara firmas en tiempo constante', () => {
    expect(timingSafeEqualHex('abcd', 'abcd')).toBe(true);
    expect(timingSafeEqualHex('abcd', 'abce')).toBe(false);
    expect(timingSafeEqualHex('abcd', 'abc')).toBe(false);
  });
});
