import { describe, expect, it } from 'vitest';
import { canonicalJson } from '../src/economy/canonical.js';
import { claimMission } from '../src/economy/claims.js';
import { sha256Hex } from '../src/economy/crypto/sha256.js';
import { addDays, compareDays, isValidDayKey, weekKey } from '../src/economy/date.js';
import {
  advanceMission,
  createDailyMissions,
  createWeeklyMission,
  findMission,
  isMissionClaimable,
} from '../src/economy/missions.js';
import { createProfile } from '../src/economy/profile.js';
import {
  grantXp,
  levelFromXp,
  profileProgress,
  totalXpForLevel,
  xpForLevel,
} from '../src/economy/progression.js';
import { baseMatchReward } from '../src/economy/rewards.js';
import { decodeSignedSave, signProfile, verifySignedSave } from '../src/economy/save.js';
import {
  equipCosmetic,
  findCosmetic,
  ownedCosmetics,
  purchaseCosmetic,
} from '../src/economy/shop.js';
import { card } from './helpers.js';

const DAY = '2026-03-10';

describe('utilidades de fecha', () => {
  it('valida, suma y compara días', () => {
    expect(isValidDayKey('2026-02-30')).toBe(false);
    expect(isValidDayKey('2026-2-3')).toBe(false);
    expect(addDays('2026-01-01', 31)).toBe('2026-02-01');
    expect(() => addDays('2026-01-01', 1.5)).toThrow();
    expect(weekKey('2026-03-10')).toBe('2026-03-09');
    expect(compareDays('2026-01-01', '2026-01-02')).toBeLessThan(0);
    expect(() => weekKey('mal')).toThrow();
  });
});

describe('progresión: caminos de error', () => {
  it('rechaza niveles y XP inválidos', () => {
    expect(() => xpForLevel(0)).toThrow();
    expect(() => totalXpForLevel(0)).toThrow();
    expect(() => levelFromXp(-1)).toThrow();
    const profile = createProfile('p1', DAY);
    expect(() => grantXp(profile, -5)).toThrow();
    expect(profileProgress(profile).percentage).toBe(0);
    expect(levelFromXp(10_000).level).toBeGreaterThan(1);
  });
});

describe('misiones: plantillas y estados', () => {
  it('genera 3 diarias únicas y una semanal', () => {
    const daily = createDailyMissions(DAY, 'p1');
    const first = daily[0];
    if (!first) throw new Error('Sin misión diaria');
    expect(new Set(daily.map((mission) => mission.id)).size).toBe(3);
    expect(findMission(daily, first.id)?.id).toBe(first.id);
    expect(findMission(daily, 'no-existe')).toBeNull();
    const weekly = createWeeklyMission(weekKey(DAY), 'p1');
    expect(weekly.target).toBeGreaterThan(0);
    expect(isMissionClaimable({ ...first, progress: first.target })).toBe(true);
  });

  it('no avanza misiones reclamadas y progresa por XP', () => {
    const base = createDailyMissions(DAY, 'p1')[0];
    if (!base) throw new Error('Sin misión diaria');
    const mission = { ...base };
    const claimed = { ...mission, claimed: true, progress: 0 };
    expect(advanceMission(claimed, { outcome: 'victoria', family: 'cartas', difficulty: 'novato', mode: 'local' }, 100)).toEqual(claimed);
    const xp = { ...mission, kind: 'earn-xp' as const, target: 100, progress: 50, claimed: false };
    expect(
      advanceMission(xp, { outcome: 'victoria', family: 'cartas', difficulty: 'novato', mode: 'local' }, 60).progress,
    ).toBe(100);
  });
});

describe('economía: caminos de error y utilidades', () => {
  it('valida perfiles y misiones', () => {
    expect(() => createProfile('   ', DAY)).toThrow();
    expect(() => createProfile('p1', 'mal')).toThrow();
    expect(createProfile('p1', DAY, '  ').displayName).toBe('Jugador');
    expect(() => claimMission(createProfile('p1', DAY), 'no-existe', DAY)).toThrow();
  });

  it('calcula recompensas por resultado y dificultad', () => {
    expect(baseMatchReward({ outcome: 'empate', family: 'cartas', difficulty: 'novato', mode: 'local' })).toEqual({ xp: 60, chips: 30 });
    expect(baseMatchReward({ outcome: 'derrota', family: 'cartas', difficulty: 'maestro', mode: 'online' })).toEqual({ xp: 53, chips: 26 });
    expect(baseMatchReward({ outcome: 'victoria', family: 'tablero', difficulty: 'competitivo', mode: 'local' })).toEqual({ xp: 150, chips: 75 });
  });

  it('valida compras y equipamiento', () => {
    const profile = createProfile('p1', DAY);
    expect(findCosmetic('no-existe')).toBeNull();
    expect(() => purchaseCosmetic(profile, 'no-existe', DAY)).toThrow();
    expect(() => equipCosmetic(profile, 'no-existe')).toThrow();
    expect(() => equipCosmetic(profile, 'tema-real')).toThrow();
    expect(ownedCosmetics(profile).map((item) => item.id)).toContain('tapete-clasico');
  });

  it('serializa datos canónicos y rechaza firmas inválidas', () => {
    expect(canonicalJson([1, 'a'])).toBe('[1,"a"]');
    expect(canonicalJson(null)).toBe('null');
    expect(canonicalJson({ b: 1, a: [2, 3] })).toBe('{"a":[2,3],"b":1}');
    const profile = createProfile('p1', DAY);
    expect(() => signProfile(profile, 'corta')).toThrow();
    expect(verifySignedSave(null, 'clave-segura')).toBeNull();
    expect(verifySignedSave({}, 'clave-segura')).toBeNull();
    expect(decodeSignedSave('{mal', 'clave-segura')).toBeNull();
    expect(sha256Hex('ñandú 😀')).toHaveLength(64);
  });

  it('las cartas de la baraja española tienen identificadores estables', () => {
    expect(card(1, 'copa').id).toBe('1-copa');
  });
});
