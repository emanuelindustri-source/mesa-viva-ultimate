import type { BotLevel } from '../ai/types.js';
import type { GameFamily, GameMode } from '../engine/types.js';

export type RankId = 'novato' | 'jugador-de-club' | 'maestro-de-mesa' | 'leyenda';

export type MissionKind =
  | 'play-matches'
  | 'win-matches'
  | 'play-cards'
  | 'play-board'
  | 'earn-xp';

export interface Mission {
  readonly id: string;
  readonly templateId: string;
  readonly title: string;
  readonly description: string;
  readonly kind: MissionKind;
  readonly target: number;
  progress: number;
  readonly rewardChips: number;
  readonly rewardXp: number;
  claimed: boolean;
}

export interface DailyMissions {
  readonly date: string;
  readonly items: Mission[];
}

export interface WeeklyMissionState {
  readonly weekKey: string;
  readonly mission: Mission;
}

export interface StreakState {
  days: number;
  cycles: number;
  lastClaim: string | null;
}

export interface DailyProgress {
  readonly date: string;
  xpEarned: number;
  chipsEarned: number;
  streakClaimed: boolean;
}

export interface PlayerStats {
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  xpEarned: number;
  chipsEarned: number;
  chipsSpent: number;
}

export type CosmeticCategory =
  | 'tapete'
  | 'baraja'
  | 'marco'
  | 'sonido'
  | 'dado'
  | 'tema';

export type CosmeticRarity = 'comun' | 'raro' | 'epico' | 'legendario';

export interface CosmeticItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: CosmeticCategory;
  readonly rarity: CosmeticRarity;
  readonly price: number;
}

export interface PlayerProfile {
  readonly version: 1;
  readonly playerId: string;
  displayName: string;
  xp: number;
  level: number;
  rank: RankId;
  chips: number;
  streak: StreakState;
  missions: DailyMissions;
  weekly: WeeklyMissionState;
  daily: DailyProgress;
  cosmetics: string[];
  equipped: Partial<Record<CosmeticCategory, string>>;
  stats: PlayerStats;
  readonly createdAt: string;
  updatedAt: string;
}

export interface MatchOutcomeInput {
  readonly outcome: 'victoria' | 'derrota' | 'empate';
  readonly family: GameFamily;
  readonly difficulty: BotLevel;
  readonly mode: GameMode;
}

export interface MatchReward {
  readonly xp: number;
  readonly chips: number;
  readonly capped: boolean;
}

export interface MatchApplication {
  readonly profile: PlayerProfile;
  readonly reward: MatchReward;
  readonly levelUps: number;
}
