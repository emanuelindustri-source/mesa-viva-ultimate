import { isValidDayKey, weekKey } from './date.js';
import { createDailyMissions, createWeeklyMission } from './missions.js';
import { levelFromXp, rankForLevel } from './progression.js';
import type { PlayerProfile } from './types.js';

export const PROFILE_VERSION = 1;
export const STARTING_CHIPS = 500;
export const LEVEL_UP_CHIPS = 100;

export function createProfile(
  playerId: string,
  today: string,
  displayName = 'Jugador',
): PlayerProfile {
  if (playerId.trim().length === 0) throw new Error('El identificador no puede estar vacío');
  if (!isValidDayKey(today)) throw new Error(`Fecha inválida: ${today}`);
  const info = levelFromXp(0);
  return {
    version: PROFILE_VERSION,
    playerId,
    displayName: displayName.trim() || 'Jugador',
    xp: 0,
    level: info.level,
    rank: rankForLevel(info.level),
    chips: STARTING_CHIPS,
    streak: { days: 0, cycles: 0, lastClaim: null },
    missions: { date: today, items: createDailyMissions(today, playerId) },
    weekly: { weekKey: weekKey(today), mission: createWeeklyMission(weekKey(today), playerId) },
    daily: { date: today, xpEarned: 0, chipsEarned: 0, streakClaimed: false },
    cosmetics: ['tapete-clasico'],
    equipped: { tapete: 'tapete-clasico' },
    stats: {
      matches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      xpEarned: 0,
      chipsEarned: 0,
      chipsSpent: 0,
    },
    createdAt: today,
    updatedAt: today,
  };
}

/** Ajusta misiones diarias, semanales y topes al día actual. */
export function normalizeProfile(profile: PlayerProfile, today: string): PlayerProfile {
  if (profile.version !== PROFILE_VERSION) {
    throw new Error(`Versión de perfil no soportada: ${String(profile.version)}`);
  }
  if (!isValidDayKey(today)) throw new Error(`Fecha inválida: ${today}`);
  const next = structuredClone(profile);
  if (next.daily.date !== today) {
    next.daily = { date: today, xpEarned: 0, chipsEarned: 0, streakClaimed: false };
  }
  if (next.missions.date !== today) {
    next.missions = { date: today, items: createDailyMissions(today, next.playerId) };
  }
  const currentWeek = weekKey(today);
  if (next.weekly.weekKey !== currentWeek) {
    next.weekly = {
      weekKey: currentWeek,
      mission: createWeeklyMission(currentWeek, next.playerId),
    };
  }
  if (next.updatedAt !== today) next.updatedAt = today;
  return next;
}
