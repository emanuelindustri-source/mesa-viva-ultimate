import { claimableMissions, type PlayerProfile, profileProgress, RANKS } from '@mesa-viva/core';
import { Check, Flame, Gift, Target, Trophy } from 'lucide-react';
import { useState } from 'preact/hooks';
import { claimMissionById, claimStreak, renameProfile } from './profile-store.js';

const RANK_LABEL: Readonly<Record<string, string>> = {
  novato: 'Novato', 'jugador-de-club': 'Jugador de Club', 'maestro-de-mesa': 'Maestro de Mesa', leyenda: 'Leyenda',
};

interface ProfilePanelProps {
  readonly profile: PlayerProfile;
  readonly onBack: () => void;
  readonly onShop: () => void;
  readonly onReward: () => void;
}

export function ProfilePanel({ profile, onBack, onShop, onReward }: ProfilePanelProps) {
  const progress = profileProgress(profile);
  const claimable = new Set(claimableMissions(profile).map((mission) => mission.id));
  const [name, setName] = useState(profile.displayName);
  const [message, setMessage] = useState('');
  const streak = (): void => {
    try { const claim = claimStreak(); setMessage(`Racha día ${claim.reward.day}: +${claim.reward.chips} fichas.`); }
    catch { setMessage('La recompensa diaria ya fue reclamada.'); }
  };
  const claim = (id: string): void => {
    try { const reward = claimMissionById(id); setMessage(`Misión completada: +${reward.chips} fichas.`); }
    catch { setMessage('La misión no está lista.'); }
  };
  return (
    <div class="panel-perfil">
      <header class="panel__cabecera"><div><p class="sobrelinea">Perfil</p><h2>{profile.displayName}</h2><p>{RANK_LABEL[profile.rank] ?? profile.rank} · nivel {profile.level}</p></div><button class="boton boton--secundario" type="button" onClick={onBack}>Volver</button></header>
      <div class="perfil-rejilla">
        <section class="panel perfil-rango">
          <span class={`perfil-rango__marco perfil-rango__marco--${profile.rank}`}><Trophy size={34} /></span>
          <h3>{RANK_LABEL[profile.rank] ?? profile.rank}</h3>
          <div class="barra"><span style={{ width: `${progress.percentage}%` }} /></div>
          <p>{progress.xpIntoLevel} / {progress.xpForNext} XP para el siguiente nivel.</p>
          <div class="perfil-datos"><span><strong>{profile.chips}</strong> fichas</span><span><strong>{profile.streak.days}</strong> días de racha</span><span><strong>{profile.stats.wins}</strong> victorias</span></div>
          <div class="sala__fila"><button class="boton boton--principal" type="button" onClick={streak}><Flame size={17} /> Reclamar racha</button><button class="boton boton--secundario" type="button" onClick={onShop}>Tienda</button></div>
        </section>
        <section class="panel">
          <h3><Target size={18} /> Misiones diarias</h3>
          <ul class="misiones">
            {profile.missions.items.map((mission) => (
              <li key={mission.id}>
                <span><strong>{mission.title}</strong><small>{mission.description} · {mission.progress}/{mission.target}</small></span>
                <button class="boton boton--secundario" type="button" disabled={!claimable.has(mission.id)} onClick={() => claim(mission.id)}>{claimable.has(mission.id) ? <><Check size={14} /> {mission.rewardChips}</> : `${mission.rewardChips}`}</button>
              </li>
            ))}
            <li><span><strong>Semanal · {profile.weekly.mission.title}</strong><small>{profile.weekly.mission.progress}/{profile.weekly.mission.target}</small></span><button class="boton boton--secundario" type="button" disabled={!claimable.has(profile.weekly.mission.id)} onClick={() => claim(profile.weekly.mission.id)}>{profile.weekly.mission.rewardChips}</button></li>
          </ul>
        </section>
        <section class="panel">
          <h3><Gift size={18} /> Identidad y recompensas</h3>
          <label class="campo"><span>Nombre visible</span><input value={name} maxLength={24} onInput={(event) => setName(event.currentTarget.value)} /></label>
          <button class="boton boton--secundario" type="button" onClick={() => { renameProfile(name); setMessage('Nombre actualizado.'); }}>Guardar nombre</button>
          <button class="boton boton--principal" type="button" onClick={onReward}><Gift size={17} /> Ver anuncio recompensado</button>
          <p class="vacio">{message.length > 0 ? message : 'Las fichas son virtuales y no tienen valor monetario real.'}</p>
          <p class="vacio">Rangos: {RANKS.map((rank) => RANK_LABEL[rank] ?? rank).join(' · ')}</p>
        </section>
      </div>
    </div>
  );
}
