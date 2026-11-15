import { previousDay } from './date.js';
import { LEVEL_UP_CHIPS, normalizeProfile } from './profile.js';
import { grantXp } from './progression.js';
import type { PlayerProfile } from './types.js';

const STREAK_CHIPS = [20, 30, 40, 60, 80, 120, 200] as const;
const STREAK_XP = [10, 15, 20, 30, 40, 60, 100] as const;

export interface StreakClaim {
  readonly profile: PlayerProfile;
  readonly reward: { readonly chips: number; readonly xp: number; readonly day: number };
}

export function claimDailyStreak(profile: PlayerProfile, today: string): StreakClaim {
  const base = normalizeProfile(profile, today);
  if (base.streak.lastClaim === today) {
    throw new Error('La recompensa diaria ya fue reclamada hoy');
  }
  const nextDays = base.streak.lastClaim === previousDay(today) ? base.streak.days + 1 : 1;
  const cycles = Math.floor((nextDays - 1) / 7);
  const day = ((nextDays - 1) % 7) + 1;
  const multiplier = Math.min(2, 1 + cycles * 0.1);
  const chips = Math.round((STREAK_CHIPS[day - 1] ?? 20) * multiplier);
  const xp = Math.round((STREAK_XP[day - 1] ?? 10) * multiplier);

  const granted = grantXp(base, xp);
  const next = granted.profile;
  const levelBonus = granted.levelsGained * LEVEL_UP_CHIPS;
  next.chips += chips + levelBonus;
  next.daily = {
    ...next.daily,
    xpEarned: next.daily.xpEarned + xp,
    chipsEarned: next.daily.chipsEarned + chips + levelBonus,
    streakClaimed: true,
  };
  next.stats = {
    ...next.stats,
    xpEarned: next.stats.xpEarned + xp,
    chipsEarned: next.stats.chipsEarned + chips + levelBonus,
  };
  next.streak = { days: nextDays, cycles, lastClaim: today };
  next.updatedAt = today;
  return { profile: next, reward: { chips, xp, day } };
}
