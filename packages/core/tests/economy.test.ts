import { describe, expect, it } from 'vitest';
import { claimableMissions, claimMission } from '../src/economy/claims.js';
import { addDays, dayKey, weekKey } from '../src/economy/date.js';
import { createProfile, normalizeProfile } from '../src/economy/profile.js';
import {
  levelFromXp,
  rankForLevel,
  totalXpForLevel,
  xpForLevel,
} from '../src/economy/progression.js';
import { applyMatch, baseMatchReward, DAILY_XP_CAP } from '../src/economy/rewards.js';
import { signProfile, verifySignedSave } from '../src/economy/save.js';
import { equipCosmetic, purchaseCosmetic, SHOP_ITEMS } from '../src/economy/shop.js';
import { claimDailyStreak } from '../src/economy/streak.js';
import type { MatchOutcomeInput, PlayerProfile } from '../src/economy/types.js';

const DAY = '2026-01-05';
const SECRET = 'clave-de-prueba-mesa-viva';

function win(): MatchOutcomeInput {
  return { outcome: 'victoria', family: 'cartas', difficulty: 'novato', mode: 'local' };
}

describe('progresión de largo plazo', () => {
  it('calcula niveles, XP y rangos', () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(xpForLevel(1)).toBe(104);
    expect(levelFromXp(totalXpForLevel(10)).level).toBe(10);
    expect(rankForLevel(1)).toBe('novato');
    expect(rankForLevel(10)).toBe('jugador-de-club');
    expect(rankForLevel(25)).toBe('maestro-de-mesa');
    expect(rankForLevel(50)).toBe('leyenda');
    expect(levelFromXp(xpForLevel(1)).level).toBe(2);
  });

  it('crea y normaliza perfiles por día y semana', () => {
    const profile = createProfile('p1', DAY);
    expect(profile.chips).toBe(500);
    expect(profile.missions.items).toHaveLength(3);
    expect(profile.weekly.weekKey).toBe(weekKey(DAY));
    expect(profile.equipped.tapete).toBe('tapete-clasico');
    const nextDay = addDays(DAY, 1);
    const normalized = normalizeProfile(profile, nextDay);
    expect(normalized.daily.date).toBe(nextDay);
    expect(normalized.missions.date).toBe(nextDay);
    expect(normalized.missions.items.every((mission) => mission.progress === 0)).toBe(true);
  });
});

describe('recompensas y misiones', () => {
  it('aplica recompensas, XP y progreso de misiones', () => {
    const profile = createProfile('p1', DAY);
    const result = applyMatch(profile, win(), DAY);
    expect(result.reward).toMatchObject({ xp: 120, chips: 60, capped: false });
    expect(result.profile.stats.matches).toBe(1);
    expect(result.profile.stats.wins).toBe(1);
    expect(result.profile.xp).toBe(120);
    expect(result.profile.level).toBe(2);
    expect(result.profile.missions.items.some((mission) => mission.progress > 0)).toBe(true);
  });

  it('reclama misiones solo una vez y suma sus recompensas', () => {
    let profile = createProfile('p1', DAY);
    for (let index = 0; index < 5; index += 1) {
      profile = applyMatch(profile, win(), DAY).profile;
    }
    const ready = claimableMissions(profile);
    expect(ready.length).toBeGreaterThan(0);
    const first = ready[0];
    if (!first) throw new Error('Sin misión reclamable');
    const chipsBefore = profile.chips;
    const claim = claimMission(profile, first.id, DAY);
    expect(claim.profile.chips).toBeGreaterThan(chipsBefore);
    expect(claim.profile.missions.items.find((mission) => mission.id === first.id)?.claimed).toBe(true);
    expect(() => claimMission(claim.profile, first.id, DAY)).toThrow();
  });

  it('respeta el tope diario de recompensas', () => {
    let profile = createProfile('p1', DAY);
    for (let index = 0; index < 80; index += 1) {
      profile = applyMatch(
        profile,
        { outcome: 'victoria', family: 'cartas', difficulty: 'maestro', mode: 'online' },
        DAY,
      ).profile;
    }
    expect(profile.daily.xpEarned).toBe(DAILY_XP_CAP);
    expect(profile.stats.matches).toBe(80);
    expect(baseMatchReward(win())).toEqual({ xp: 120, chips: 60 });
  });
});

describe('racha diaria y tienda', () => {
  it('acumula rachas y reinicia al saltar un día', () => {
    const first = claimDailyStreak(createProfile('p1', DAY), DAY);
    expect(first.reward.day).toBe(1);
    expect(() => claimDailyStreak(first.profile, DAY)).toThrow();
    const second = claimDailyStreak(first.profile, addDays(DAY, 1));
    expect(second.profile.streak.days).toBe(2);
    const skipped = claimDailyStreak(second.profile, addDays(DAY, 4));
    expect(skipped.profile.streak.days).toBe(1);
  });

  it('compra, equipa y valida cosméticos', () => {
    const profile = createProfile('p1', DAY);
    const item = SHOP_ITEMS.find((cosmetic) => cosmetic.id === 'dado-madera');
    if (!item) throw new Error('Falta el cosmético de prueba');
    const bought = purchaseCosmetic(profile, item.id, DAY);
    expect(bought.chips).toBe(500 - item.price);
    expect(bought.cosmetics).toContain(item.id);
    expect(() => purchaseCosmetic(bought, item.id, DAY)).toThrow();
    const equipped = equipCosmetic(bought, item.id);
    expect(equipped.equipped.dado).toBe(item.id);
    expect(() => purchaseCosmetic(profile, 'tema-real', DAY)).toThrow();
  });
});

describe('guardado firmado con HMAC', () => {
  it('firma, verifica y detecta manipulaciones', () => {
    const profile = createProfile('p1', DAY);
    const save = signProfile(profile, SECRET);
    expect(verifySignedSave(save, SECRET)).toEqual(profile);
    const tampered = { ...save, payload: { ...save.payload, chips: 999_999 } };
    expect(verifySignedSave(tampered, SECRET)).toBeNull();
    expect(verifySignedSave(save, 'otra-clave-segura')).toBeNull();
    const decoded = JSON.parse(JSON.stringify(save));
    expect(verifySignedSave(decoded, SECRET)).toEqual(profile);
  });
});

describe('simulación de tres años', () => {
  it('mantiene una economía estable y alcanza el rango Leyenda', () => {
    let profile: PlayerProfile = createProfile('veterano', '2024-01-01');
    const start = '2024-01-01';
    for (let dayOffset = 0; dayOffset < 1095; dayOffset += 1) {
      const today = addDays(start, dayOffset);
      profile = claimDailyStreak(profile, today).profile;
      profile = applyMatch(profile, win(), today).profile;
      profile = applyMatch(profile, win(), today).profile;
      profile = applyMatch(
        profile,
        { outcome: 'derrota', family: 'tablero', difficulty: 'novato', mode: 'local' },
        today,
      ).profile;
      let guard = 0;
      while (guard < 5) {
        const ready = claimableMissions(profile);
        const mission = ready[0];
        if (!mission) break;
        profile = claimMission(profile, mission.id, today).profile;
        guard += 1;
      }
    }
    expect(profile.stats.matches).toBe(1095 * 3);
    expect(profile.level).toBeGreaterThanOrEqual(50);
    expect(profile.chips).toBeGreaterThan(0);
    expect(Number.isFinite(profile.xp)).toBe(true);
    expect(profile.rank).toBe('leyenda');
    expect(dayKey(new Date('2024-01-01T00:00:00Z'))).toBe('2024-01-01');
  });
});
