import { sha256Hex } from './crypto/sha256.js';
import type { MatchOutcomeInput, Mission, MissionKind } from './types.js';

interface MissionTemplate {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly kind: MissionKind;
  readonly target: number;
  readonly rewardChips: number;
  readonly rewardXp: number;
}

export const DAILY_TEMPLATES: readonly MissionTemplate[] = [
  { id: 'jugar-3', title: 'Mesa abierta', description: 'Juega 3 partidas', kind: 'play-matches', target: 3, rewardChips: 60, rewardXp: 30 },
  { id: 'ganar-2', title: 'Doble victoria', description: 'Gana 2 partidas', kind: 'win-matches', target: 2, rewardChips: 120, rewardXp: 60 },
  { id: 'cartas-2', title: 'Mano de cartas', description: 'Juega 2 partidas de cartas', kind: 'play-cards', target: 2, rewardChips: 80, rewardXp: 40 },
  { id: 'tablero-2', title: 'Sobre el tablero', description: 'Juega 2 partidas de tablero', kind: 'play-board', target: 2, rewardChips: 80, rewardXp: 40 },
  { id: 'xp-600', title: 'Aprendiz constante', description: 'Gana 600 XP', kind: 'earn-xp', target: 600, rewardChips: 150, rewardXp: 0 },
  { id: 'ganar-3', title: 'Racha de mesa', description: 'Gana 3 partidas', kind: 'win-matches', target: 3, rewardChips: 180, rewardXp: 90 },
  { id: 'jugar-5', title: 'Maratón', description: 'Juega 5 partidas', kind: 'play-matches', target: 5, rewardChips: 110, rewardXp: 55 },
  { id: 'ganar-1', title: 'Primera sangre', description: 'Gana 1 partida', kind: 'win-matches', target: 1, rewardChips: 40, rewardXp: 20 },
  { id: 'cartas-3', title: 'Baraja viva', description: 'Juega 3 partidas de cartas', kind: 'play-cards', target: 3, rewardChips: 110, rewardXp: 55 },
  { id: 'tablero-3', title: 'Estratega', description: 'Juega 3 partidas de tablero', kind: 'play-board', target: 3, rewardChips: 110, rewardXp: 55 },
];

export const WEEKLY_TEMPLATES: readonly MissionTemplate[] = [
  { id: 'semanal-ganar-5', title: 'Campeón semanal', description: 'Gana 5 partidas esta semana', kind: 'win-matches', target: 5, rewardChips: 400, rewardXp: 200 },
  { id: 'semanal-jugar-10', title: 'Veterano', description: 'Juega 10 partidas esta semana', kind: 'play-matches', target: 10, rewardChips: 300, rewardXp: 150 },
  { id: 'semanal-cartas-5', title: 'Maestro de cartas', description: 'Juega 5 partidas de cartas', kind: 'play-cards', target: 5, rewardChips: 350, rewardXp: 180 },
  { id: 'semanal-tablero-5', title: 'Maestro de tablero', description: 'Juega 5 partidas de tablero', kind: 'play-board', target: 5, rewardChips: 350, rewardXp: 180 },
];

function pickIndexes(seed: string, count: number, poolSize: number): number[] {
  const hex = sha256Hex(seed);
  const picked: number[] = [];
  const used = new Set<number>();
  for (let offset = 0; offset + 8 <= hex.length && picked.length < count; offset += 8) {
    const value = Number.parseInt(hex.slice(offset, offset + 8), 16);
    const index = value % poolSize;
    if (!used.has(index)) {
      used.add(index);
      picked.push(index);
    }
  }
  for (let index = 0; picked.length < count && index < poolSize; index += 1) {
    if (!used.has(index)) {
      used.add(index);
      picked.push(index);
    }
  }
  return picked;
}

function instantiate(template: MissionTemplate, idPrefix: string): Mission {
  return {
    id: `${idPrefix}-${template.id}`,
    templateId: template.id,
    title: template.title,
    description: template.description,
    kind: template.kind,
    target: template.target,
    progress: 0,
    rewardChips: template.rewardChips,
    rewardXp: template.rewardXp,
    claimed: false,
  };
}

export function createDailyMissions(day: string, playerId: string): Mission[] {
  return pickIndexes(`${playerId}:${day}`, 3, DAILY_TEMPLATES.length)
    .map((index) => DAILY_TEMPLATES[index])
    .filter((template): template is MissionTemplate => template !== undefined)
    .map((template) => instantiate(template, day));
}

export function createWeeklyMission(week: string, playerId: string): Mission {
  const [index] = pickIndexes(`${playerId}:week:${week}`, 1, WEEKLY_TEMPLATES.length);
  const template = index === undefined ? WEEKLY_TEMPLATES[0] : WEEKLY_TEMPLATES[index];
  if (!template) throw new Error('No hay plantilla semanal disponible');
  return instantiate(template, `semana-${week}`);
}

export function advanceMission(
  mission: Mission,
  input: MatchOutcomeInput,
  xpEarned: number,
): Mission {
  if (mission.claimed) return mission;
  let delta = 0;
  if (mission.kind === 'play-matches') delta = 1;
  else if (mission.kind === 'win-matches') delta = input.outcome === 'victoria' ? 1 : 0;
  else if (mission.kind === 'play-cards') delta = input.family === 'cartas' ? 1 : 0;
  else if (mission.kind === 'play-board') delta = input.family === 'tablero' ? 1 : 0;
  else if (mission.kind === 'earn-xp') delta = xpEarned;
  if (delta === 0) return mission;
  return { ...mission, progress: Math.min(mission.target, mission.progress + delta) };
}

export function isMissionClaimable(mission: Mission): boolean {
  return !mission.claimed && mission.progress >= mission.target;
}

export function findMission(profileMissions: readonly Mission[], missionId: string): Mission | null {
  return profileMissions.find((mission) => mission.id === missionId) ?? null;
}
