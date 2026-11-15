import { InvalidConfigError } from './errors.js';
import type { GameConfig, GameOptions } from './types.js';

export function readNumber(
  options: GameOptions | undefined,
  key: string,
  fallback: number,
): number {
  const value = options?.[key];
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new InvalidConfigError(`La opción "${key}" debe ser un número`);
  }
  return value;
}

export function readInt(
  options: GameOptions | undefined,
  key: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const value = readNumber(options, key, fallback);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new InvalidConfigError(
      `La opción "${key}" debe ser un entero entre ${min} y ${max}`,
    );
  }
  return value;
}

export function readBoolean(
  options: GameOptions | undefined,
  key: string,
  fallback: boolean,
): boolean {
  const value = options?.[key];
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') {
    throw new InvalidConfigError(`La opción "${key}" debe ser booleana`);
  }
  return value;
}

export function readString<T extends string>(
  options: GameOptions | undefined,
  key: string,
  fallback: T,
  allowed: readonly T[],
): T {
  const value = options?.[key];
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new InvalidConfigError(
      `La opción "${key}" debe ser uno de: ${allowed.join(', ')}`,
    );
  }
  return value as T;
}

export function validatePlayers(config: GameConfig, min: number, max: number): void {
  const { players } = config;
  if (players.length < min || players.length > max) {
    throw new InvalidConfigError(
      `Se requieren entre ${min} y ${max} jugadores (recibidos: ${players.length})`,
    );
  }
  const ids = new Set(players.map((player) => player.id));
  if (ids.size !== players.length) {
    throw new InvalidConfigError('Los identificadores de jugador deben ser únicos');
  }
  if (!Number.isInteger(config.seed)) {
    throw new InvalidConfigError('La semilla debe ser un entero');
  }
}
