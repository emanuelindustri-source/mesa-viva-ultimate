import { describe, expect, it } from 'vitest';
import { findGameMeta, GAME_CATALOG, gamesByFamily } from '../src/catalog.js';
import { CORE_VERSION } from '../src/version.js';

describe('catálogo universal', () => {
  it('registra los juegos del cliente con identificadores únicos', () => {
    expect(CORE_VERSION).toBe('0.2.0');
    expect(GAME_CATALOG).toHaveLength(5);
    expect(new Set(GAME_CATALOG.map((game) => game.id)).size).toBe(5);
    expect(GAME_CATALOG.every((game) => game.i18nKey.startsWith('games.'))).toBe(true);
  });

  it('busca por identificador y filtra por familia', () => {
    expect(findGameMeta('caida-venezolana')?.name).toBe('Caída Venezolana');
    expect(findGameMeta('ajedrez-club')?.family).toBe('tablero');
    expect(findGameMeta('inexistente')).toBeNull();
    expect(gamesByFamily('cartas')).toHaveLength(3);
    expect(gamesByFamily('tablero')).toHaveLength(2);
  });
});
