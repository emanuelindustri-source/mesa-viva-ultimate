import { advanceMission } from './missions.js';
import { LEVEL_UP_CHIPS, normalizeProfile } from './profile.js';
import { grantXp } from './progression.js';
import type {
  MatchApplication,
  MatchOutcomeInput,
  MatchReward,
  PlayerProfile,
} from './types.js';

export const DAILY_XP_CAP = 5_000;
export const DAILY_CHIP_CAP = 2_500;

export function baseMatchReward(input: MatchOutcomeInput): { xp: number; chips: number } {
  const base =
    input.outcome === 'victoria'
      ? { xp: 120, chips: 60 }
      : input.outcome === 'empate'
        ? { xp: 60, chips: 30 }
        : { xp: 30, chips: 15 };
  const difficulty =
    input.difficulty === 'maestro' ? 1.6 : input.difficulty === 'competitivo' ? 1.25 : 1;
  const mode = input.mode === 'online' ? 1.1 : 1;
  return {
    xp: Math.round(base.xp * difficulty * mode),
    chips: Math.round(base.chips * difficulty * mode),
  };
}

export function applyMatch(
  profile: PlayerProfile,
  input: MatchOutcomeInput,
  today: string,
): MatchApplication {
  const next = normalizeProfile(profile, today);
  const base = baseMatchReward(input);
  const xp = Math.min(base.xp, Math.max(0, DAILY_XP_CAP - next.daily.xpEarned));
  const chips = Math.min(base.chips, Math.max(0, DAILY_CHIP_CAP - next.daily.chipsEarned));
  const reward: MatchReward = { xp, chips, capped: xp < base.xp || chips < base.chips };

  next.missions = {
    ...next.missions,
    items: next.missions.items.map((mission) => advanceMission(mission, input, xp)),
  };
  next.weekly = {
    ...next.weekly,
    mission: advanceMission(next.weekly.mission, input, xp),
  };
  next.stats = {
    ...next.stats,
    matches: next.stats.matches + 1,
    wins: next.stats.wins + (input.outcome === 'victoria' ? 1 : 0),
    losses: next.stats.losses + (input.outcome === 'derrota' ? 1 : 0),
    draws: next.stats.draws + (input.outcome === 'empate' ? 1 : 0),
    xpEarned: next.stats.xpEarned + xp,
  };
  next.daily = {
    ...next.daily,
    xpEarned: next.daily.xpEarned + xp,
    chipsEarned: next.daily.chipsEarned + chips,
  };

  const granted = grantXp(next, xp);
  const result = granted.profile;
  const levelBonus = granted.levelsGained * LEVEL_UP_CHIPS;
  result.chips += chips + levelBonus;
  result.daily.chipsEarned += levelBonus;
  result.stats.chipsEarned += chips + levelBonus;
  result.updatedAt = today;
  return { profile: result, reward, levelUps: granted.levelsGained };
}
