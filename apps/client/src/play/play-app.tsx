import type { BotLevel } from '@mesa-viva/core';
import { Headphones, Home, ShoppingBag, User, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { AdBanner } from '../ads/ad-banner.js';
import { AdService } from '../ads/ad-service.js';
import { BillingService } from '../ads/billing-service.js';
import { ConsentDialog } from '../ads/consent-dialog.js';
import { RewardedAdHost } from '../ads/rewarded-host.js';
import { telemetry } from '../ads/telemetry-service.js';
import { createWebAdAdapter } from '../ads/web-adapter.js';
import { routeHref } from '../routes.js';
import { Dialog } from '../ui/dialog.js';
import { updateSettings } from '../ui/settings.js';
import { TopNav } from '../ui/top-nav.js';
import { useSettings } from '../ui/use-settings.js';
import { useAppTheme } from '../ui/use-theme.js';
import { AudioStudioPanel } from './audio-panel.js';
import type { GameKey } from './game-defs.js';
import { GamePanel } from './game-panel.js';
import { type GameSession, newGameSession, type PlayMode } from './game-session.js';
import { Lobby } from './lobby.js';
import { ProfilePanel } from './profile-panel.js';
import { grantChips, recordMatch, resetProfile } from './profile-store.js';
import { RemoteGamePanel } from './remote-game-panel.js';
import { RoomGameHost } from './room-game.js';
import { RoomPanel } from './room-panel.js';
import type { RoomState } from './room-protocol.js';
import type { RoomService } from './room-service.js';
import { SettingsPanel } from './settings-panel.js';
import { ShopPanel } from './shop-panel.js';
import { useProfile } from './use-profile.js';
import { useSensory } from './use-sensory.js';
import './play.css';

type PlayView = 'lobby' | 'game' | 'remote' | 'room' | 'profile' | 'shop' | 'settings';
interface GameConfig { readonly game: GameKey; readonly mode: PlayMode; readonly humanCount: number; readonly botLevel: BotLevel; }

export function PlayApp() {
  const settings = useSettings();
  const themeState = useAppTheme();
  const profile = useProfile();
  const sensory = useSensory(settings);
  const [view, setView] = useState<PlayView>('lobby');
  const [session, setSession] = useState<GameSession | null>(null);
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [room, setRoom] = useState<RoomService | null>(null);
  const [hostGame, setHostGame] = useState<RoomGameHost | null>(null);
  const [remoteState, setRemoteState] = useState<RoomState | null>(null);
  const [remoteRoom, setRemoteRoom] = useState<RoomService | null>(null);
  const [roomRevision, setRoomRevision] = useState(0);
  const [toast, setToast] = useState('');
  const [consentOpen, setConsentOpen] = useState(settings.adsConsent === 'unknown');
  const [audioOpen, setAudioOpen] = useState(false);
  const vipRef = useRef(settings.vip);
  vipRef.current = settings.vip;
  const reported = useRef(false);
  const adService = useMemo(() => new AdService({ adapter: createWebAdAdapter(), vip: () => vipRef.current }), []);
  const billing = useMemo(() => new BillingService({ isVip: () => vipRef.current, onVip: () => updateSettings({ vip: true }) }), []);

  useEffect(() => { adService.setInGame(view === 'game' || view === 'remote'); }, [view, adService]);
  useEffect(() => {
    const result = remoteState?.result as { winners?: readonly string[] } | null | undefined;
    if (result === undefined || result === null || reported.current) return;
    reported.current = true;
    const playerId = remoteRoom?.currentPlayerId ?? '';
    const outcome = result.winners?.includes(playerId) ? 'victoria' : (result.winners?.length ?? 0) === 0 ? 'empate' : 'derrota';
    const application = recordMatch(outcome, 'cartas', 'competitivo', 'online');
    setToast(`+${application.reward.xp} XP · +${application.reward.chips} fichas`);
  }, [remoteState, remoteRoom]);

  const start = (game: GameKey, mode: PlayMode, humanCount: number, botLevel: BotLevel): void => {
    const next = newGameSession({ game, mode, humanName: profile.displayName, botLevel, humanCount, seed: Date.now() });
    reported.current = false;
    setSession(next);
    setConfig({ game, mode, humanCount, botLevel });
    setView('game');
    telemetry.track('match.started', { game, mode });
  };

  const finished = (outcome: 'victoria' | 'derrota' | 'empate'): void => {
    if (session === null) return;
    const application = recordMatch(outcome, session.game.family, session.botLevel, session.mode);
    setToast(`+${application.reward.xp} XP · +${application.reward.chips} fichas${application.reward.capped ? ' (tope diario)' : ''}`);
    telemetry.track('match.finished', { game: session.game.key, mode: session.mode, outcome });
    void adService.showInterstitial();
  };

  const restart = (): void => {
    if (config === null) return;
    if (config.mode === 'online' && hostGame !== null && room !== null) {
      const seats = hostGame.session.seats;
      const host = new RoomGameHost(room, config.game, seats, Date.now(), config.botLevel);
      room.setActionHandler((playerId, action) => { host.handleAction(playerId, action); setRoomRevision((value) => value + 1); });
      host.start();
      setHostGame(host);
      setSession(host.session);
      reported.current = false;
      return;
    }
    start(config.game, config.mode, config.humanCount, config.botLevel);
  };

  const exitGame = (): void => {
    room?.leave();
    setRoom(null);
    setHostGame(null);
    setSession(null);
    setRemoteState(null);
    setRemoteRoom(null);
    setView('lobby');
  };

  const hostStart = (service: RoomService, seats: readonly import('./game-session.js').PlayerSeat[], seed: number, gameKey: GameKey, botLevel: BotLevel): void => {
    const host = new RoomGameHost(service, gameKey, seats, seed, botLevel);
    service.setActionHandler((playerId, action) => { host.handleAction(playerId, action); setRoomRevision((value) => value + 1); });
    host.start();
    setRoom(service);
    setHostGame(host);
    setSession(host.session);
    setConfig({ game: gameKey, mode: 'online', humanCount: seats.length, botLevel });
    reported.current = false;
    setView('game');
  };

  const guestState = (state: RoomState, service: RoomService): void => {
    setRemoteState(state);
    setRemoteRoom(service);
    setView('remote');
  };

  const reward = async (): Promise<void> => {
    const shown = await adService.showRewarded();
    if (shown) { grantChips(80); setToast('+80 fichas virtuales'); telemetry.track('ad.rewarded'); }
    else setToast('El anuncio recompensado no está disponible ahora.');
  };

  const vip = (): void => {
    void billing.purchaseVip().then((ok) => { if (ok) { updateSettings({ vip: true }); setToast('Mesa VIP activa: sin anuncios.'); } });
  };

  return (
    <div class="pagina play-app">
      <TopNav active="play" compact />
      <div class="play-barra">
        <a class="boton boton--secundario" href={routeHref('')}><Home size={16} /> Portal</a>
        <button class="boton boton--secundario" type="button" onClick={() => setView('lobby')}>Salón</button>
        <button class="boton boton--secundario" type="button" onClick={() => setView('profile')}><User size={16} /> {profile.displayName}</button>
        <button class="boton boton--secundario" type="button" onClick={() => setView('shop')}><ShoppingBag size={16} /> Tienda</button>
        <button class="boton boton--secundario" type="button" onClick={() => setAudioOpen(true)}><Headphones size={16} /> Audio</button>
        <span class="play-barra__fichas"><Volume2 size={15} /> {profile.chips} fichas</span>
      </div>
      {view === 'lobby' && <><AdBanner vip={settings.vip} consent={settings.adsConsent} onUpgrade={vip} /><Lobby profile={profile} themeState={themeState} settings={settings} onStart={start} onRoom={() => setView('room')} onProfile={() => setView('profile')} onShop={() => setView('shop')} onSettings={() => setView('settings')} onAudio={() => setAudioOpen(true)} /></>}
      {view === 'game' && session !== null && <GamePanel session={session} theme={themeState.theme} settings={settings} sensory={sensory} externalRevision={roomRevision} onChange={() => hostGame?.broadcast()} onExit={exitGame} onRestart={restart} onFinished={finished} />}
      {view === 'remote' && remoteState !== null && <RemoteGamePanel state={remoteState} playerId={remoteRoom?.currentPlayerId ?? ''} theme={themeState.theme} settings={settings} onAction={(action) => remoteRoom?.sendAction(action)} onExit={exitGame} />}
      {view === 'room' && <RoomPanel profileName={profile.displayName} theme={themeState.theme} settings={settings} botLevel="competitivo" onHostGame={hostStart} onGuestState={guestState} onExit={() => setView('lobby')} />}
      {view === 'profile' && <ProfilePanel profile={profile} onBack={() => setView('lobby')} onShop={() => setView('shop')} onReward={() => void reward()} />}
      {view === 'shop' && <ShopPanel profile={profile} vip={settings.vip} onBack={() => setView('lobby')} onReward={() => void reward()} onVip={vip} />}
      {view === 'settings' && <SettingsPanel settings={settings} sensory={sensory} onBack={() => setView('lobby')} onConsent={() => setConsentOpen(true)} onVip={vip} onReset={() => { resetProfile(settings.playerName); setToast('Perfil local reiniciado'); }} />}
      {toast.length > 0 && <div class="aviso-flotante" role="status"><span>{toast}</span><button class="aviso-flotante__accion" type="button" onClick={() => setToast('')}>Cerrar</button></div>}
      <Dialog open={audioOpen} title="Estudio de audio y háptica" onClose={() => setAudioOpen(false)} wide><AudioStudioPanel settings={settings} sensory={sensory} /></Dialog>
      <ConsentDialog open={consentOpen} onClose={() => setConsentOpen(false)} />
      <RewardedAdHost />
      <footer class="pie"><p>Mesa Viva · Fichas virtuales sin valor monetario real. Sin apuestas.</p><p><a class="enlace" href={routeHref('privacy')}>Privacidad</a> · <a class="enlace" href={routeHref('terms')}>Términos</a></p></footer>
    </div>
  );
}
