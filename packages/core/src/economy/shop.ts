import type { CosmeticItem, PlayerProfile } from './types.js';

export const SHOP_ITEMS: readonly CosmeticItem[] = [
  { id: 'tapete-clasico', name: 'Tapete clásico', description: 'Fieltro verde de club', category: 'tapete', rarity: 'comun', price: 0 },
  { id: 'tapete-ambar', name: 'Tapete ámbar', description: 'Calidez de madera y oro', category: 'tapete', rarity: 'raro', price: 800 },
  { id: 'tapete-verde', name: 'Tapete esmeralda', description: 'Fieltro profundo de torneo', category: 'tapete', rarity: 'raro', price: 1200 },
  { id: 'tapete-nocturno', name: 'Tapete nocturno', description: 'Terciopelo azul de medianoche', category: 'tapete', rarity: 'epico', price: 3200 },
  { id: 'tapete-cosmico', name: 'Tapete cósmico', description: 'Nebulosa animada en 2.5D', category: 'tapete', rarity: 'legendario', price: 8000 },
  { id: 'baraja-espanola', name: 'Baraja española', description: 'Oros, copas, espadas y bastos', category: 'baraja', rarity: 'comun', price: 600 },
  { id: 'baraja-venezolana', name: 'Baraja venezolana', description: 'Diseño inspirado en la Caída', category: 'baraja', rarity: 'raro', price: 1200 },
  { id: 'baraja-oro', name: 'Baraja dorada', description: 'Acabado metálico premium', category: 'baraja', rarity: 'epico', price: 2500 },
  { id: 'baraja-hanafuda', name: 'Baraja hanafuda', description: 'Flores y estaciones de Japón', category: 'baraja', rarity: 'epico', price: 4000 },
  { id: 'marco-madera', name: 'Marco de madera', description: 'Borde cálido de nogal', category: 'marco', rarity: 'comun', price: 700 },
  { id: 'marco-oro', name: 'Marco dorado', description: 'Elegancia de mesa principal', category: 'marco', rarity: 'raro', price: 1800 },
  { id: 'marco-neon', name: 'Marco neón', description: 'Luz adaptativa para partidas nocturnas', category: 'marco', rarity: 'epico', price: 3500 },
  { id: 'marco-festivo', name: 'Marco festivo', description: 'Cambia con cada festividad', category: 'marco', rarity: 'epico', price: 5000 },
  { id: 'sonido-madera', name: 'Sonido madera', description: 'Fichas y cartas sobre nogal', category: 'sonido', rarity: 'comun', price: 500 },
  { id: 'sonido-cristal', name: 'Sonido cristal', description: 'Timbre limpio de copas', category: 'sonido', rarity: 'raro', price: 1400 },
  { id: 'sonido-sinfonico', name: 'Sonido sinfónico', description: 'Música adaptativa orquestal', category: 'sonido', rarity: 'epico', price: 3000 },
  { id: 'sonido-binaural', name: 'Sonido binaural', description: 'Frecuencias Alpha y Theta', category: 'sonido', rarity: 'legendario', price: 6000 },
  { id: 'dado-madera', name: 'Dados de madera', description: 'Tacto clásico de mesa', category: 'dado', rarity: 'comun', price: 400 },
  { id: 'dado-obsidiana', name: 'Dados de obsidiana', description: 'Negro profundo con reflejos', category: 'dado', rarity: 'raro', price: 1600 },
  { id: 'dado-cuarzo', name: 'Dados de cuarzo', description: 'Transparencia y luz', category: 'dado', rarity: 'epico', price: 3600 },
  { id: 'tema-dia-normal', name: 'Tema día normal', description: 'Paleta neutra Material You', category: 'tema', rarity: 'comun', price: 900 },
  { id: 'tema-navidad', name: 'Tema Navidad', description: 'Luces, nieve y campanas', category: 'tema', rarity: 'raro', price: 2200 },
  { id: 'tema-halloween', name: 'Tema Halloween', description: 'Calabazas y niebla', category: 'tema', rarity: 'raro', price: 2200 },
  { id: 'tema-arcade', name: 'Tema arcade', description: 'Neón retro de los ochenta', category: 'tema', rarity: 'epico', price: 2800 },
  { id: 'tema-real', name: 'Tema mesa real', description: 'Mármol, oro y terciopelo', category: 'tema', rarity: 'legendario', price: 10000 },
];

export function findCosmetic(itemId: string): CosmeticItem | null {
  return SHOP_ITEMS.find((item) => item.id === itemId) ?? null;
}

export function purchaseCosmetic(
  profile: PlayerProfile,
  itemId: string,
  today: string,
): PlayerProfile {
  const item = findCosmetic(itemId);
  if (!item) throw new Error(`Cosmético desconocido: ${itemId}`);
  if (profile.cosmetics.includes(itemId)) throw new Error('Ese cosmético ya es tuyo');
  if (profile.chips < item.price) throw new Error('No tienes suficientes Fichas de Mesa');
  const next = structuredClone(profile);
  next.chips -= item.price;
  next.cosmetics.push(itemId);
  next.stats.chipsSpent += item.price;
  next.updatedAt = today;
  return next;
}

export function equipCosmetic(profile: PlayerProfile, itemId: string): PlayerProfile {
  const item = findCosmetic(itemId);
  if (!item) throw new Error(`Cosmético desconocido: ${itemId}`);
  if (!profile.cosmetics.includes(itemId)) throw new Error('Primero debes comprar ese cosmético');
  const next = structuredClone(profile);
  next.equipped[item.category] = itemId;
  return next;
}

export function ownedCosmetics(profile: PlayerProfile): CosmeticItem[] {
  return SHOP_ITEMS.filter((item) => profile.cosmetics.includes(item.id));
}
