import type { PlayerProfile, RankId } from './types.js';

export const RANKS: readonly RankId[] = [
  'novato',
  'jugador-de-club',
  'maestro-de-mesa',
  'leyenda',
];

/** XP necesaria para pasar del nivel indicado al siguiente. */
export function xpForLevel(level: number): number {
  if (!Number.isInteger(level) || level < 1) {
    throw new Error('El nivel debe ser un entero positivo');
  }
  return 80 + 20 * level + 4 * level * level;
}

/** XP total acumulada necesaria para alcanzar un nivel (nivel 1 = 0). */
export function totalXpForLevel(level: number): number {
  if (!Number.isInteger(level) || level < 1) {
    throw new Error('El nivel debe ser un entero positivo');
  }
  let total = 0;
  for (let current = 1; current < level; current += 1) {
    total += xpForLevel(current);
  }
  return total;
}

export function rankForLevel(level: number): RankId {
  if (level >= 50) return 'leyenda';
  if (level >= 25) return 'maestro-de-mesa';
  if (level >= 10) return 'jugador-de-club';
  return 'novato';
}

export interface LevelInfo {
  readonly level: number;
  readonly xpIntoLevel: number;
  readonly xpForNext: number;
  readonly rank: RankId;
}

export function levelFromXp(xp: number): LevelInfo {
  if (!Number.isFinite(xp) || xp < 0) throw new Error('La XP debe ser no negativa');
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level) && level < 10_000) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return {
    level,
    xpIntoLevel: remaining,
    xpForNext: xpForLevel(level),
    rank: rankForLevel(level),
  };
}

export interface GrantXpResult {
  readonly profile: PlayerProfile;
  readonly levelsGained: number;
}

export function grantXp(profile: PlayerProfile, amount: number): GrantXpResult {
  if (!Number.isFinite(amount) || amount < 0) throw new Error('La XP debe ser no negativa');
  const next = structuredClone(profile);
  next.xp += Math.round(amount);
  const info = levelFromXp(next.xp);
  const levelsGained = info.level - next.level;
  next.level = info.level;
  next.rank = info.rank;
  return { profile: next, levelsGained };
}

export interface ProfileProgress {
  readonly level: number;
  readonly xpIntoLevel: number;
  readonly xpForNext: number;
  readonly percentage: number;
  readonly rank: RankId;
}

export function profileProgress(profile: PlayerProfile): ProfileProgress {
  const info = levelFromXp(profile.xp);
  return {
    ...info,
    percentage: Math.min(100, Math.round((info.xpIntoLevel / info.xpForNext) * 100)),
  };
}
