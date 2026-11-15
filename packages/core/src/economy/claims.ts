import { LEVEL_UP_CHIPS, normalizeProfile } from './profile.js';
import { grantXp } from './progression.js';
import type { Mission, PlayerProfile } from './types.js';

export interface MissionClaim {
  readonly profile: PlayerProfile;
  readonly mission: Mission;
  readonly chips: number;
  readonly xp: number;
}

function isReady(mission: Mission): boolean {
  return !mission.claimed && mission.progress >= mission.target;
}

export function claimableMissions(profile: PlayerProfile): Mission[] {
  return [
    ...profile.missions.items.filter(isReady),
    ...(isReady(profile.weekly.mission) ? [profile.weekly.mission] : []),
  ];
}

export function claimMission(
  profile: PlayerProfile,
  missionId: string,
  today: string,
): MissionClaim {
  const base = normalizeProfile(profile, today);
  const dailyIndex = base.missions.items.findIndex((mission) => mission.id === missionId);
  const weekly = base.weekly.mission.id === missionId ? base.weekly.mission : null;
  const found =
    dailyIndex >= 0 ? base.missions.items[dailyIndex] ?? null : weekly;
  if (!found || !isReady(found)) {
    throw new Error('La misión no está lista para reclamar');
  }
  const next = structuredClone(base);
  const target =
    dailyIndex >= 0
      ? next.missions.items[dailyIndex]
      : next.weekly.mission;
  if (!target) throw new Error('Misión no encontrada');
  target.claimed = true;
  const granted = grantXp(next, found.rewardXp);
  const result = granted.profile;
  const levelBonus = granted.levelsGained * LEVEL_UP_CHIPS;
  result.chips += found.rewardChips + levelBonus;
  result.daily = {
    ...result.daily,
    xpEarned: result.daily.xpEarned + found.rewardXp,
    chipsEarned: result.daily.chipsEarned + found.rewardChips + levelBonus,
  };
  result.stats = {
    ...result.stats,
    xpEarned: result.stats.xpEarned + found.rewardXp,
    chipsEarned: result.stats.chipsEarned + found.rewardChips + levelBonus,
  };
  result.updatedAt = today;
  return {
    profile: result,
    mission: found,
    chips: found.rewardChips,
    xp: found.rewardXp,
  };
}
