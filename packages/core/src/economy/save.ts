import { canonicalJson } from './canonical.js';
import { hmacSha256Hex, timingSafeEqualHex } from './crypto/hmac.js';
import { PROFILE_VERSION } from './profile.js';
import type { PlayerProfile } from './types.js';

export interface SignedSave {
  readonly version: 1;
  readonly algorithm: 'HMAC-SHA256';
  readonly savedAt: string;
  readonly payload: PlayerProfile;
  readonly signature: string;
}

function signedContent(save: Omit<SignedSave, 'signature'>): string {
  return canonicalJson({
    version: save.version,
    algorithm: save.algorithm,
    savedAt: save.savedAt,
    payload: save.payload,
  });
}

export function signProfile(
  profile: PlayerProfile,
  secret: string,
  savedAt: string = profile.updatedAt,
): SignedSave {
  if (secret.length < 8) throw new Error('La clave de firma debe tener al menos 8 caracteres');
  const content: Omit<SignedSave, 'signature'> = {
    version: 1,
    algorithm: 'HMAC-SHA256',
    savedAt,
    payload: profile,
  };
  return { ...content, signature: hmacSha256Hex(secret, signedContent(content)) };
}

function isProfile(value: unknown): value is PlayerProfile {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    record.version === PROFILE_VERSION &&
    typeof record.playerId === 'string' &&
    typeof record.chips === 'number' &&
    typeof record.xp === 'number' &&
    Array.isArray(record.cosmetics)
  );
}

function isSignedSave(value: unknown): value is SignedSave {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    record.version === 1 &&
    record.algorithm === 'HMAC-SHA256' &&
    typeof record.savedAt === 'string' &&
    typeof record.signature === 'string'
  );
}

export function verifySignedSave(save: unknown, secret: string): PlayerProfile | null {
  if (secret.length < 8 || !isSignedSave(save) || !isProfile(save.payload)) return null;
  if (save.signature.length !== 64) return null;
  const { signature, ...content } = save;
  const expected = hmacSha256Hex(secret, signedContent(content));
  return timingSafeEqualHex(signature, expected) ? save.payload : null;
}

export function encodeSignedSave(save: SignedSave): string {
  return JSON.stringify(save);
}

export function decodeSignedSave(json: string, secret: string): PlayerProfile | null {
  try {
    return verifySignedSave(JSON.parse(json), secret);
  } catch {
    return null;
  }
}
