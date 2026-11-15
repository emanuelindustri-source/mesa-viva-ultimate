# Arquitectura de Mesa Viva Ultimate

**Estado:** Fase 4 entregada. Motor sensorial con audio espacial HRTF a 48 kHz,
música adaptativa de ocho stems para 19 festividades y háptica Capacitor/Web.

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
- Cuatro buses con compresor-limitador maestro; cero archivos de audio externos.
- `SpatialAudioEngine` HRTF atado a asientos/cartas, 8 fuentes espaciales y
  degradación a estéreo o mono.
- Director adaptativo de 8 stems sincronizados, 19 festividades + Día Normal,
  tensión de partida, patrones deterministas y límite de voces.
- Doce efectos procedurales y háptica de precisión con puente Capacitor y fallback
  `navigator.vibrate`.
- `SensorySession` + `createTableSensoryHooks` integran audio, háptica, silencio
  boca abajo y agitado con `TableStage`, sin bloquear reglas ni turnos.
- Render offline determinista y benchmark de latencia/voces para CI.
- Laboratorio sensorial en `/` para probar tensión, festividades y gestos.

### `@mesa-viva/client`

- Portal informativo `/` y aplicación jugable `/play/` en el mismo despliegue.
- PWA offline-first con Service Worker (Workbox) y aviso de actualización.
- Multijugador híbrido: misma pantalla, Wi-Fi local y WebRTC con PIN/QR.
- AdMob/H5 Ads con límite de frecuencia, Billing VIP y cumplimiento UMP/GDPR.
- Capacitor 8 para Android, con Kotlin nativo (WakeLock, Material You, Play Games).

## Despliegue

- `main` → CI (lint, tipos, build y cobertura) → GitHub Pages en
  `https://emanuelindustri-source.github.io/mesa-viva-ultimate/`.
- Android se empaqueta en la Fase 6 y se publica como artefacto firmado `.aab`.

## Reglas de ingeniería

Ver `AGENTS.md`. Resumen: módulos de máximo 200 líneas, tipos estrictos, pruebas
por fase, cero secretos en el repositorio y notas de versión obligatorias.
