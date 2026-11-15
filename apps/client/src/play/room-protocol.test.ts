import { describe, expect, it } from 'vitest';
import {
  codeFromText,
  createRoomCode,
  roomLink,
  roomMessage,
  roomPeerId,
  sanitizeChat,
} from './room-protocol.js';
import { iceServers } from './room-support.js';

describe('protocolo de salas', () => {
  it('genera PIN de seis dígitos y deep links estables', () => {
    expect(createRoomCode(42)).toBe('000042');
    expect(createRoomCode(1_234_567)).toBe('234567');
    expect(roomPeerId('123456')).toBe('mesa-viva-ultimate-123456-host');
    expect(roomLink('123456', 'https://juego.dev', '/mesa-viva-ultimate/')).toBe(
      'https://juego.dev/mesa-viva-ultimate/play/?sala=123456',
    );
  });

  it('acepta PIN directo o dentro de una URL y rechaza basura', () => {
    expect(codeFromText(' 123456 ')).toBe('123456');
    expect(codeFromText('https://juego.dev/play/?sala=654321')).toBe('654321');
    expect(codeFromText('https://juego.dev/play/?sala=12')).toBeNull();
    expect(codeFromText('sin-codigo')).toBeNull();
  });

  it('limpia el chat y valida mensajes', () => {
    expect(sanitizeChat('  hola   mesa  ')).toBe('hola mesa');
    expect(sanitizeChat('   ')).toBeNull();
    expect(sanitizeChat('x'.repeat(200))?.length).toBe(160);
    expect(roomMessage({ type: 'hello', playerId: 'p1', name: 'Ana' })).toMatchObject({ type: 'hello' });
    expect(roomMessage({})).toBeNull();
    expect(roomMessage(null)).toBeNull();
  });

  it('añade TURN solo cuando el puente lo configura', () => {
    const base = iceServers({});
    expect(base.length).toBe(2);
    const withTurn = iceServers({ MesaVivaTurn: { url: 'turn:turn.local:3478', username: 'mesa', credential: 'secreto' } });
    expect(withTurn).toHaveLength(3);
    expect(withTurn[2]).toMatchObject({ urls: 'turn:turn.local:3478', username: 'mesa' });
    expect(iceServers({ MesaVivaTurn: { url: '   ' } })).toHaveLength(2);
  });
});
