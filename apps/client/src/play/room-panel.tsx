import type { BotLevel } from '@mesa-viva/core';
import type { Theme } from '@mesa-viva/design-system';
import { Copy, Hash, LogIn, Plus, QrCode, Send, Users } from 'lucide-react';
import { useRef, useState } from 'preact/hooks';
import { QRCodeSVG } from 'qrcode.react';
import type { AppSettings } from '../ui/settings.js';
import { GAME_DEFINITIONS, GAME_KEYS, type GameKey } from './game-defs.js';
import type { PlayerSeat } from './game-session.js';
import type { RoomLobby, RoomState } from './room-protocol.js';
import { codeFromText, roomLink } from './room-protocol.js';
import { RoomScanner } from './room-scanner.js';
import { RoomService } from './room-service.js';

interface RoomPanelProps {
  readonly profileName: string;
  readonly theme: Theme;
  readonly settings: AppSettings;
  readonly botLevel: BotLevel;
  readonly onHostGame: (room: RoomService, seats: readonly PlayerSeat[], seed: number, gameKey: GameKey, botLevel: BotLevel) => void;
  readonly onGuestState: (state: RoomState, room: RoomService) => void;
  readonly onExit: () => void;
}

interface ChatLine { readonly from: string; readonly text: string; }

export function RoomPanel({ profileName, theme, settings, botLevel, onHostGame, onGuestState, onExit }: RoomPanelProps) {
  const [room, setRoom] = useState<RoomService | null>(null);
  const [host, setHost] = useState(false);
  const [lobby, setLobby] = useState<RoomLobby | null>(null);
  const [gameKey, setGameKey] = useState<GameKey>('caida');
  const [joinCode, setJoinCode] = useState('');
  const [status, setStatus] = useState('Crea una sala o únete con un PIN de 6 dígitos.');
  const [error, setError] = useState('');
  const [chat, setChat] = useState<readonly ChatLine[]>([]);
  const [chatText, setChatText] = useState('');
  const [scanner, setScanner] = useState(false);
  const props = useRef({ onHostGame, onGuestState, onExit });
  props.current = { onHostGame, onGuestState, onExit };
  const roomRef = useRef<RoomService | null>(null);

  const makeRoom = (): RoomService => new RoomService({
    onStatus: (text) => setStatus(text),
    onLobby: (next) => setLobby(next),
    onState: (state) => { if (roomRef.current !== null) props.current.onGuestState(state, roomRef.current); },
    onChat: (from, _name, text) => setChat((current) => [...current.slice(-30), { from, text }]),
    onError: (message) => setError(message),
  });

  const createRoom = async (): Promise<void> => {
    setError('');
    const service = makeRoom();
    roomRef.current = service;
    setRoom(service);
    setHost(true);
    try {
      await service.host(profileName, gameKey);
    } catch {
      setError('No se pudo abrir la sala. Revisa la conexión.');
    }
  };

  const join = async (codeText: string): Promise<void> => {
    const code = codeFromText(codeText);
    if (code === null) { setError('El PIN debe tener 6 dígitos.'); return; }
    setError('');
    const service = makeRoom();
    roomRef.current = service;
    setRoom(service);
    setHost(false);
    try {
      await service.join(code, profileName);
    } catch {
      setError('No se pudo entrar a la sala. Verifica el PIN.');
    }
  };

  const start = (): void => {
    if (room === null || lobby === null) return;
    const players = lobby.players.filter((player) => player.connected);
    const definition = GAME_DEFINITIONS[gameKey];
    const seats: PlayerSeat[] = players.map((player) => ({ id: player.id, name: player.name, kind: 'human' }));
    let botIndex = 1;
    while (seats.length < Math.max(players.length, definition.defaultPlayers)) {
      seats.push({ id: `bot-${botIndex}`, name: `Bot ${botIndex}`, kind: 'bot' });
      botIndex += 1;
    }
    setStatus('Iniciando mesa…');
    props.current.onHostGame(room, seats, Date.now(), gameKey, botLevel);
  };

  const sendChat = (): void => {
    const clean = chatText.trim();
    if (clean.length === 0 || room === null) return;
    room.sendChat(clean, profileName);
    setChatText('');
  };

  const link = lobby === null ? '' : roomLink(lobby.code);
  return (
    <div class="sala">
      <header class="sala__cabecera">
        <div><p class="sobrelinea">Salón multijugador</p><h2>Sala por PIN y QR</h2><p>{status}</p></div>
        <button class="boton boton--secundario" type="button" onClick={() => { room?.leave(); props.current.onExit(); }}>Volver</button>
      </header>
      {lobby === null ? (
        <div class="sala__entrada">
          <section class="panel">
            <h3><Plus size={18} /> Crear sala</h3>
            <label class="campo"><span>Juego inicial</span><select value={gameKey} onChange={(event) => setGameKey(event.currentTarget.value as GameKey)}>{GAME_KEYS.map((key) => <option key={key} value={key}>{GAME_DEFINITIONS[key].name}</option>)}</select></label>
            <button class="boton boton--principal" type="button" onClick={() => void createRoom()}>Abrir sala</button>
          </section>
          <section class="panel">
            <h3><LogIn size={18} /> Unirse</h3>
            <label class="campo"><span>PIN de 6 dígitos</span><input inputMode="numeric" maxLength={6} placeholder="123456" value={joinCode} onInput={(event) => setJoinCode(event.currentTarget.value)} /></label>
            <div class="sala__fila">
              <button class="boton boton--principal" type="button" onClick={() => void join(joinCode)}><Hash size={16} /> Entrar</button>
              <button class="boton boton--secundario" type="button" onClick={() => setScanner((value) => !value)}><QrCode size={16} /> QR</button>
            </div>
            {scanner && <RoomScanner onCode={(text) => { setScanner(false); setJoinCode(codeFromText(text) ?? ''); void join(text); }} onClose={() => setScanner(false)} />}
          </section>
          {error.length > 0 && <p class="sala__error" role="alert">{error}</p>}
        </div>
      ) : (
        <div class="sala__cuerpo">
          <section class="panel sala__codigo">
            <p class="sobrelinea">PIN de la sala</p>
            <strong class="sala__pin">{lobby.code}</strong>
            <div class="sala__qr"><QRCodeSVG value={link} size={170} bgColor="#ffffff" fgColor="#12100e" /></div>
            <div class="sala__fila">
              <button class="boton boton--secundario" type="button" onClick={() => void globalThis.navigator?.clipboard?.writeText(link)}><Copy size={16} /> Copiar enlace</button>
              {host && <button class="boton boton--principal" type="button" onClick={start}>Iniciar mesa</button>}
            </div>
          </section>
          <section class="panel">
            <h3><Users size={18} /> Asientos · {lobby.players.length}</h3>
            <ul class="sala__jugadores">
              {lobby.players.map((player) => <li key={player.id}><span class="asiento__avatar">{player.name.slice(0, 2).toUpperCase()}</span><span>{player.name} {player.isHost ? '· anfitrión' : ''}</span><span class={`pastilla ${player.connected ? '' : 'pastilla--alerta'}`}>{player.connected ? 'listo' : 'reconectando'}</span></li>)}
            </ul>
            <h3>Chat rápido</h3>
            <div class="sala__chat">{chat.map((line, index) => <p key={`${line.from}-${index}`}><strong>{line.from}:</strong> {line.text}</p>)}</div>
            <div class="sala__fila"><input class="sala__chat-input" value={chatText} maxLength={120} placeholder="¡Buena mesa!" onInput={(event) => setChatText(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') sendChat(); }} /><button class="icono-boton" type="button" aria-label="Enviar" onClick={sendChat}><Send size={18} /></button></div>
            {!host && <p class="vacio">Esperando a que el anfitrión inicie la mesa.</p>}
          </section>
        </div>
      )}
      {error.length > 0 && lobby !== null && <p class="sala__error">{error}</p>}
      <p class="sala__nota">WebRTC con STUN público. En redes restrictivas usa el mismo dispositivo o el modo Pasa y Juega. {settings.vip ? 'VIP: sin anuncios.' : 'Sin anuncios durante la partida.'}</p>
      <p class="solo-lector">Tema {theme.mode}, idioma {settings.locale}, bot {botLevel}</p>
    </div>
  );
}
