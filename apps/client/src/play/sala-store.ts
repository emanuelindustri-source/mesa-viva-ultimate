export interface SalaGuest {
  readonly id: string;
  readonly name: string;
  readonly avatar: number;
}

const STORAGE_KEY = 'mesa-viva:sala:v1';
const MAX_GUESTS = 3;

export const DEFAULT_SALA: readonly SalaGuest[] = [
  { id: 'g1', name: 'María', avatar: 2 },
  { id: 'g2', name: 'Juan', avatar: 3 },
  { id: 'g3', name: 'Camila', avatar: 4 },
];

export function loadSala(): SalaGuest[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (raw === null || raw === undefined) return [...DEFAULT_SALA];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...DEFAULT_SALA];
    return parsed
      .filter((item): item is SalaGuest => typeof item === 'object' && item !== null && typeof (item as SalaGuest).name === 'string')
      .slice(0, MAX_GUESTS)
      .map((item, index) => ({ id: item.id || `g${index + 1}`, name: item.name.slice(0, 18), avatar: Number(item.avatar) || index + 2 }));
  } catch {
    return [...DEFAULT_SALA];
  }
}

export function saveSala(guests: readonly SalaGuest[]): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(guests));
  } catch {
    // La sala vive en memoria si el navegador bloquea el almacenamiento.
  }
}

export function addGuest(guests: readonly SalaGuest[]): SalaGuest[] {
  if (guests.length >= MAX_GUESTS) return [...guests];
  const id = `g${Date.now().toString(36)}`;
  return [...guests, { id, name: `Invitado ${guests.length + 2}`, avatar: guests.length + 2 }];
}

export function renameGuest(guests: readonly SalaGuest[], id: string, name: string): SalaGuest[] {
  return guests.map((guest) => guest.id === id ? { ...guest, name: name.trim().slice(0, 18) || 'Invitado' } : guest);
}

export function removeGuest(guests: readonly SalaGuest[], id: string): SalaGuest[] {
  return guests.filter((guest) => guest.id !== id);
}
