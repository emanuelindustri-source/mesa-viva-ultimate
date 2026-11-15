# Arquitectura de Mesa Viva Ultimate

**Estado:** Fase 6 entregada. Portal `/`, app jugable `/play/` a 100dvh, salón
de club procedural, mesa ovalada 2.5D, arrastre táctil global, historial lateral,
sala persistente, chat con emojis y cinco juegos (Caída, Dominó, Blackjack,
Colores y Ajedrez de Club). La Fase 7 prepara Ludo, Escaleras y Póker y el `.aab`
Android.

## Visión

Un monorepo pnpm con cuatro motores independientes y un cliente Preact ligero.
La lógica de juego es TypeScript puro, determinista y testeable sin navegador.
La presentación (2.5D, sonido, háptica) consume esos estados, nunca al revés.

```
apps/client ──> engine-25d ──> design-system ──> core
      │                                            ▲
      ├────────> sensory-engine ───────────────────┘
      └────────> core
```

## Paquetes

### `@mesa-viva/core`

- Contrato `IGameModule` basado en datos: estado, acciones legales, reducer puro y
  validación. Un juego nuevo = un módulo + pruebas, sin tocar el resto.
- RNG determinista por semilla (`createRng`) para partidas reproducibles.
- Bots de tres niveles con conteo real de cartas y fichas.
- Enciclopedia de reglas, variantes y glosario con claves de traducción.
- Economía: XP, rangos, Fichas de Mesa, misiones, rachas y guardado firmado con HMAC.

### `@mesa-viva/design-system`

- Tokens Material You, incluido color dinámico Android 12+.
- `HolidayEngine`: 19 festividades + Día Normal, según fecha y país (`Intl`).
- Seis formatos: móvil, tablet, televisor, laptop, ultrawide y plegable.
- `VectorAtlasGenerator`: SVG procedural en siete familias, sin imágenes externas.
- `BrandAssetGenerator`: logo mutante por festividad, emblemas por juego, iconos
  PWA/Android, monocromo Material You, splash y banner del repositorio.

### `@mesa-viva/engine-25d`

- Superficie pura (`.`) sin PixiJS: cámara, layout, físicas, pooling, picking,
  sensores y adaptadores de estado de `core`.
- Runtime `./pixi`: `TableStage`, entidades, atlas de GPU, partículas, D-pad y
  fallback DOM cuando no existe WebGL.
- Cámara 2.5D por formato, elevación Z, sombras proyectadas y aterrizaje con rebote.
- Object pooling para cartas, fichas, peones, sombras y partículas; culling por
  viewport y cero objetos temporales en el ticker.

### `@mesa-viva/sensory-engine`

- `AudioRuntime` perezoso a 48 kHz con desbloqueo por gesto, suspensión y cierre.
- `MultiChannelRouter` con detección de `maxChannelCount`, `ChannelMerger` discreto
  y modos binaural 2.0, 2.1, 5.1, 5.2 y 7.1; LFE dedicado y EQ por canal.
- `StudioMasterBus` con convolución procedural de sala de madera y limitador
  brickwall a −1,0 dBFS.
- `VocalHumSynth`: formantes /m/, /u/, /o/, portamento, respiración y vibrato
  progresivo; la voz va al canal central.
- Orquesta orgánica: Rhodes, Karplus para cuatro/guitarra, contrabajo LFE, marimba,
  cuerdas, percusión latina y beatbox.
- `LongFormComposer`: movimientos de 32–64 compases, cuatro secciones moduladas,
  motivos transformados, pregunta/respuesta, 19 festividades y estados de jugador.
- `SoundtrackEngine`/`SoundtrackController` integran salida, festival, energía,
  acorde activo, SFX armónicos y ciclo de vida.
- `SensorySession` conserva el modo de ocho stems y añade `musicEngine: 'studio'`,
  salida multicanal, estado del jugador y SFX.
- Render offline determinista, benchmark de latencia/voces y laboratorio multicanal
  en el portal.

### `@mesa-viva/client`

- Portal multipágina `/`, `/play/`, `/privacy/` y `/terms/` con Vite y Preact;
  `preact/compat` permite `framer-motion`, `lucide-react` y `qrcode.react` sin
  cargar React completo.
- Matriz claro/oscuro/sistema × festividad × Material You aplicada como variables
  CSS y `color-scheme`, con el logo mutante sincronizado.
- `GameSession` conecta los cuatro módulos de `core` con bots, semilla, vistas por
  jugador, snapshot 2.5D y `GameVFXController` por juego.
- `useSensory` y el estudio de audio aplican salida física, mezcla independiente,
  binaural, háptica y preferencias de accesibilidad.
- Salas host-autoritativas sobre PeerJS con PIN/QR, chat saneado y una vista por
  jugador; el invitado nunca recibe manos ajenas.
- PWA offline-first con Service Worker (Workbox), precache completo y aviso de
  actualización.
- Monetización: `AdService` con mínimo de tres minutos, recompensados, `BillingService`
  VIP, UMP, `app-ads.txt` y telemetría con cola local.
- Capacitor 8 para Android; los puentes nativos de AdMob/Billing y el `.aab`
  firmado se completan en la Fase 6.

## Despliegue

- `main` → CI (lint, tipos, build y cobertura) → GitHub Pages en
  `https://emanuelindustri-source.github.io/mesa-viva-ultimate/`.
- Android se empaqueta en la Fase 6 y se publica como artefacto firmado `.aab`.

## Reglas de ingeniería

Ver `AGENTS.md`. Resumen: módulos de máximo 200 líneas, tipos estrictos, pruebas
por fase, cero secretos en el repositorio y notas de versión obligatorias.
