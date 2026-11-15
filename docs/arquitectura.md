# Arquitectura de Mesa Viva Ultimate

**Estado:** Fase 1 entregada. Motor universal, cuatro juegos, bots de tres niveles
y economía de largo plazo verificados con 4.000 partidas simuladas.

## Visión

Un monorepo pnpm con cuatro motores independientes y un cliente Preact ligero.
La lógica de juego es 100% TypeScript puro, determinista y testeable sin navegador.
La presentación (2.5D, sonido, háptica) consume esos estados, nunca al revés.

```
apps/client ──► engine-25d ──► design-system ──► core
      │                                          ▲
      ├────────► sensory-engine ─────────────────┘
      └────────► core
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
- `VectorAtlasGenerator`: SVG procedural a atlas de GPU, sin imágenes pesadas.

### `@mesa-viva/engine-25d`

- PixiJS v8 + GSAP. Cámara 2.5D, elevación Z, sombras proyectadas y físicas táctiles.
- Entidades universales reutilizables con object pooling.
- Objetivo: 60–120 FPS en hardware modesto.

### `@mesa-viva/sensory-engine`

- Audio espacial HRTF y música adaptativa de ocho stems según tensión y festividad.
- Háptica por primitivas reales con puente nativo y fallback web.
- Sensores: paralaje con giroscopio, agitado para dados y boca abajo para ocultar.

### `@mesa-viva/client`

- Portal informativo `/` y aplicación jugable `/play/` en el mismo despliegue.
- PWA offline-first con Service Worker (Workbox) y aviso de actualización.
- Multijugador híbrido: misma pantalla, Wi-Fi local y WebRTC con PIN/QR.
- AdMob/H5 Ads con límite de frecuencia, Billing VIP y cumplimiento UMP/GDPR.
- Capacitor 8 para Android, con Kotlin nativo (WakeLock, Material You, Play Games).

## Despliegue

- `main` → CI (lint, build, test) → GitHub Pages en
  `https://emanuelindustri-source.github.io/mesa-viva-ultimate/`.
- Android se empaqueta en la Fase 6 y se publica como artefacto firmado `.aab`.

## Reglas de ingeniería

Ver `AGENTS.md`. Resumen: módulos de máximo 200 líneas, tipos estrictos, pruebas
por fase, cero secretos en el repositorio y notas de versión obligatorias.
