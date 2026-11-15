import { findCosmetic, type PlayerProfile, SHOP_ITEMS } from '@mesa-viva/core';
import { Crown, Gem, Gift, Lock } from 'lucide-react';
import { buyCosmetic, equipCosmeticById } from './profile-store.js';

interface ShopPanelProps {
  readonly profile: PlayerProfile;
  readonly vip: boolean;
  readonly onBack: () => void;
  readonly onReward: () => void;
  readonly onVip: () => void;
}

export function ShopPanel({ profile, vip, onBack, onReward, onVip }: ShopPanelProps) {
  return (
    <div class="panel-tienda">
      <header class="panel__cabecera"><div><p class="sobrelinea">Tienda</p><h2>Cosméticos y temas</h2><p>{profile.chips} Fichas de Mesa · solo estética, sin ventajas competitivas.</p></div><button class="boton boton--secundario" type="button" onClick={onBack}>Volver</button></header>
      <div class="tienda__vip">
        <Crown size={28} />
        <div><h3>Mesa VIP</h3><p>Quitar anuncios + temas VIP. Compra única; en web es una demostración local hasta Google Play Billing.</p></div>
        <button class="boton boton--principal" type="button" onClick={onVip}>{vip ? 'VIP activo' : 'Activar VIP'}</button>
      </div>
      <div class="tienda__rejilla">
        {SHOP_ITEMS.map((item) => {
          const owned = profile.cosmetics.includes(item.id);
          const equipped = profile.equipped[item.category] === item.id;
          return (
            <article class="tienda__item" key={item.id}>
              <span class="tienda__icono">{owned ? <Gem size={22} /> : <Lock size={22} />}</span>
              <div><h3>{item.name}</h3><p>{item.description}</p><span class="pastilla">{item.rarity} · {item.price === 0 ? 'incluido' : `${item.price} fichas`}</span></div>
              {owned ? (
                <button class="boton boton--secundario" type="button" disabled={equipped} onClick={() => equipCosmeticById(item.id)}>{equipped ? 'Equipado' : 'Equipar'}</button>
              ) : (
                <button class="boton boton--principal" type="button" disabled={item.price > profile.chips} onClick={() => buyCosmetic(item.id)}>{item.price > profile.chips ? 'Faltan fichas' : 'Comprar'}</button>
              )}
            </article>
          );
        })}
      </div>
      <button class="boton boton--secundario tienda__recompensa" type="button" onClick={onReward}><Gift size={17} /> Ganar 80 fichas con un anuncio recompensado</button>
      <p class="vacio">Las fichas virtuales no se compran con dinero real ni se canjean. {findCosmetic('tapete-clasico')?.description ?? ''}</p>
    </div>
  );
}
