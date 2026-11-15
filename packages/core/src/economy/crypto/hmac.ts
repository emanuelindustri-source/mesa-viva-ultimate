import { bytesToHex, sha256Bytes, utf8Bytes } from './sha256.js';

const BLOCK_SIZE = 64;

function concat(left: Uint8Array, right: Uint8Array): Uint8Array {
  const output = new Uint8Array(left.length + right.length);
  output.set(left);
  output.set(right, left.length);
  return output;
}

export function hmacSha256Bytes(key: Uint8Array, message: Uint8Array): Uint8Array {
  let normalized = key;
  if (key.length > BLOCK_SIZE) normalized = sha256Bytes(key);
  const padded = new Uint8Array(BLOCK_SIZE);
  padded.set(normalized);
  const inner = new Uint8Array(BLOCK_SIZE);
  const outer = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i += 1) {
    inner[i] = (padded[i] ?? 0) ^ 0x36;
    outer[i] = (padded[i] ?? 0) ^ 0x5c;
  }
  return sha256Bytes(concat(outer, sha256Bytes(concat(inner, message))));
}

export function hmacSha256Hex(key: string, message: string): string {
  return bytesToHex(hmacSha256Bytes(utf8Bytes(key), utf8Bytes(message)));
}

/** Comparación en tiempo constante para firmas HMAC. */
export function timingSafeEqualHex(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i += 1) {
    difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return difference === 0;
}
