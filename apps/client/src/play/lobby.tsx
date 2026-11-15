import type { BotLevel, PlayerProfile } from '@mesa-viva/core';
import { Crown, Headphones, Play, Settings, ShoppingBag, User, Users, Wifi } from 'lucide-react';
import { useState } from 'preact/hooks';
import { GameEmblem } from '../ui/brand-mark.js';
import type { AppSettings } from '../ui/settings.js';
import type { AppThemeState } from '../ui/use-theme.js';
import { BoardShowcase } from './board-showcase.js';
import { GAME_DEFINITIONS, GAME_KEYS, type GameKey } from './game-defs.js';
import type { PlayerSeat, PlayMode } from './game-session.js';
import { SalaPanel } from './sala-panel.js';
import { loadSala, saveSala } from './sala-store.js';

interface LobbyProps {
  readonly profile: PlayerProfile;
  readonly themeState: AppThemeState;
  readonly settings: AppSettings;
  readonly onStart: (game: GameKey, mode: PlayMode, humanCount: number, botLevel: BotLevel) => void;
  readonly onSalaStart: (game: GameKey, seats: readonly PlayerSeat[]) => void;
  readonly onRoom: () => void;
  readonly onProfile: () => void;
  readonly onShop: () => void;
  readonly onSettings: () => void;
  readonly onAudio: () => void;
}

export function Lobby({ profile, themeState, settings, onStart, onSalaStart, onRoom, onProfile, onShop, onSettings, onAudio }: LobbyProps) {
  const [game, setGame] = useState<GameKey>('caida');
  const [mode, setMode] = useState<PlayMode>('solo');
  const [botLevel, setBotLevel] = useState<BotLevel>('competitivo');
  const [humanCount, setHumanCount] = useState(2);
  const [guests, setGuests] = useState(loadSala);
  const definition = GAME_DEFINITIONS[game];
  const countOptions = game === 'domino' ? [2, 4] : Array.from({ length: Math.max(2, definition.maxPlayers) - 1 }, (_, index) => index + 2);
  const effectiveHumans = game === 'domino' ? (humanCount >= 4 ? 4 : 2) : Math.max(2, Math.min(definition.maxPlayers, humanCount));
  return (
    <div class="play-lobby">
      <section class="play-hero">
        <div>
          <p class="sobrelinea">Mesa Viva · v0.8.0 · Estudio</p>
          <h1>Tu mesa, tus reglas.</h1>
          <p>Juega solo contra bots, comparte el dispositivo o abre una sala con PIN y QR. La mesa se adapta a tu pantalla y a tu festividad.</p>
        </div>
        <div class="play-hero__perfil">
          <span class="play-hero__nivel">{profile.level}</span>
          <div><strong>{profile.displayName}</strong><small>{profile.rank} · {profile.chips} fichas · racha {profile.streak.days}</small></div>
          <button class="icono-boton" type="button" aria-label="Perfil" onClick={onProfile}><User size={18} /></button>
          <button class="icono-boton" type="button" aria-label="Tienda" onClick={onShop}><ShoppingBag size={18} /></button>
          <button class="icono-boton" type="button" aria-label="Ajustes" onClick={onSettings}><Settings size={18} /></button>
        </div>
      </section>

      <section class="play-seccion">
        <h2>Elige una mesa</h2>
        <div class="play-juegos">
          {GAME_KEYS.map((key) => {
            const item = GAME_DEFINITIONS[key];
            return (
              <button class={`play-juego ${game === key ? 'play-juego--activo' : ''}`} key={key} type="button" aria-pressed={game === key} onClick={() => setGame(key)}>
                <GameEmblem gameId={key} holidayId={themeState.holidayId} mode={themeState.theme.mode} size={66} />
                <span><strong>{item.name}</strong><small>{item.hook}</small></span>
                <span class="pastilla">{item.family}</span>
              </button>
            );
          })}
        </div>
      </section>

      <SalaPanel
        ownerName={profile.displayName}
        guests={guests}
        gameName={definition.name}
        onGuests={(next) => { setGuests([...next]); saveSala(next); }}
        onStart={(seats) => onSalaStart(game, seats)}
      />

      <BoardShowcase />

      <section class="play-seccion play-config">
        <div>
          <h2>Cómo quieres jugar</h2>
          <div class="play-modos">
            <button class={`play-modo ${mode === 'solo' ? 'play-modo--activo' : ''}`} type="button" onClick={() => setMode('solo')}><Users size={18} /><span><strong>1 jugador</strong><small>Contra bots IA</small></span></button>
            <button class={`play-modo ${mode === 'local' ? 'play-modo--activo' : ''}`} type="button" onClick={() => setMode('local')}><Headphones size={18} /><span><strong>Pasa y Juega</strong><small>2–4 en el dispositivo</small></span></button>
            <button class="play-modo" type="button" onClick={onRoom}><Wifi size={18} /><span><strong>Sala online</strong><small>PIN y QR</small></span></button>
          </div>
          {mode === 'solo' && (
            <label class="campo"><span>Nivel de los bots</span><select value={botLevel} onChange={(event) => setBotLevel(event.currentTarget.value as BotLevel)}><option value="novato">Novato</option><option value="competitivo">Competitivo</option><option value="maestro">Maestro</option></select></label>
          )}
          {mode === 'local' && (
            <label class="campo"><span>Jugadores en la mesa</span><select value={effectiveHumans} onChange={(event) => setHumanCount(Number(event.currentTarget.value))}>{countOptions.map((count) => <option key={count} value={count}>{count} jugadores</option>)}</select></label>
          )}
        </div>
        <div class="play-config__resumen">
          <GameEmblem gameId={game} holidayId={themeState.holidayId} mode={themeState.theme.mode} size={110} />
          <h3>{definition.name}</h3>
          <p>{definition.hook}. {mode === 'solo' ? `Bots ${botLevel}.` : mode === 'local' ? `${effectiveHumans} jugadores, privacidad por turnos.` : 'Sala híbrida.'}</p>
          <button class="boton boton--principal" type="button" onClick={() => mode === 'online' ? onRoom() : onStart(game, mode, effectiveHumans, botLevel)}>
            <Play size={18} /> {mode === 'solo' ? 'Jugar contra bots' : 'Abrir mesa'}
          </button>
          <button class="boton boton--secundario" type="button" onClick={onAudio}><Headphones size={17} /> Estudio de audio</button>
          <small class="play-config__nota"><Crown size={13} /> {settings.vip ? 'VIP activo' : 'Fichas virtuales, sin apuestas'}</small>
        </div>
      </section>
    </div>
  );
}
