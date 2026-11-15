import {
  applyMatch,
  type BotLevel,
  claimDailyStreak,
  claimMission,
  createProfile,
  dayKey,
  decodeSignedSave,
  encodeSignedSave,
  equipCosmetic,
  type GameFamily,
  type GameMode,
  type MatchApplication,
  normalizeProfile,
  type PlayerProfile,
  type ProfileProgress,
  profileProgress,
  purchaseCosmetic,
  type StreakClaim,
  signProfile,
} from '@mesa-viva/core';

const STORAGE_KEY = 'mesa-viva:profile:v1';
const SECRET = 'mesa-viva-integridad-local-v1';

function playerId(): string {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}`;
  } catch {
    return `local-${Date.now()}`;
  }
}

function load(): PlayerProfile {
  const today = dayKey();
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (raw !== null && raw !== undefined) {
      const verified = decodeSignedSave(raw, SECRET);
      if (verified !== null) return normalizeProfile(verified, today);
    }
  } catch {
    // Guardado corrupto o almacenamiento bloqueado: se crea un perfil nuevo.
  }
  return createProfile(playerId(), today, 'Jugador');
}

let current = load();
const listeners = new Set<() => void>();

function persist(profile: PlayerProfile): PlayerProfile {
  current = profile;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, encodeSignedSave(signProfile(profile, SECRET, profile.updatedAt)));
  } catch {
    // La sesión sigue en memoria.
  }
  for (const listener of listeners) listener();
  return current;
}

export function profileSnapshot(): PlayerProfile {
  return current;
}

export function profileProgressSnapshot(): ProfileProgress {
  return profileProgress(current);
}

export function subscribeProfile(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function recordMatch(
  outcome: 'victoria' | 'derrota' | 'empate',
  family: GameFamily,
  difficulty: BotLevel,
  mode: GameMode,
): MatchApplication {
  const application = applyMatch(current, { outcome, family, difficulty, mode }, dayKey());
  persist(application.profile);
  return application;
}

export function claimStreak(): StreakClaim {
  const claim = claimDailyStreak(current, dayKey());
  persist(claim.profile);
  return claim;
}

export function claimMissionById(missionId: string): { chips: number; xp: number } {
  const claim = claimMission(current, missionId, dayKey());
  persist(claim.profile);
  return { chips: claim.chips, xp: claim.xp };
}

export function buyCosmetic(id: string): PlayerProfile {
  return persist(purchaseCosmetic(current, id, dayKey()));
}

export function equipCosmeticById(id: string): PlayerProfile {
  return persist(equipCosmetic(current, id));
}

export function renameProfile(name: string): PlayerProfile {
  const next = normalizeProfile({ ...current, displayName: name.trim() || 'Jugador', updatedAt: dayKey() }, dayKey());
  return persist(next);
}

export function grantChips(amount: number): PlayerProfile {
  if (!Number.isFinite(amount) || amount <= 0) return current;
  const next = normalizeProfile({ ...current, chips: current.chips + Math.round(amount), updatedAt: dayKey() }, dayKey());
  return persist(next);
}

export function resetProfile(name = 'Jugador'): PlayerProfile {
  return persist(createProfile(playerId(), dayKey(), name));
}
