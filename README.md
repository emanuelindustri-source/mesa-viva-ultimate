# Mesa Viva Ultimate

[![CI](https://github.com/emanuelindustri-source/mesa-viva-ultimate/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/emanuelindustri-source/mesa-viva-ultimate/actions/workflows/ci.yml)

Plataforma multiplataforma de juegos de cartas y juegos de mesa con motor 2.5D,
modo offline, multijugador híbrido y monetización compatible con Google Play.

**Estado actual:** Fase 4 — Motor Sensorial entregada. Audio espacial HRTF a
48 kHz, música adaptativa de ocho stems para 19 festividades y háptica
Capacitor/Web, con laboratorio interactivo en el portal.

## Estructura

| Ruta | Contenido |
| --- | --- |
| `packages/core` | Motor universal de reglas, catálogo, bots y economía |
| `packages/design-system` | Material You, festividades, formatos de pantalla y atlas vectorial |
| `packages/engine-25d` | Motor gráfico PixiJS v8 + GSAP, entidades y sensores |
| `packages/sensory-engine` | Audio espacial, música adaptativa, háptica y sensores |
| `apps/client` | Portal web `/`, app jugable `/play/` y proyecto Capacitor |
| `docs/versiones` | Notas de versión cronológicas y próxima versión |

## Motor 2.5D

- Punto de entrada puro `@mesa-viva/engine-25d` para Node, CI y reglas.
- Runtime gráfico en `@mesa-viva/engine-25d/pixi` para navegador con WebGL.
- `TableStage` adapta cámara, área segura y paneles a móvil, tablet, televisor,
  laptop, ultrawide y plegable.
- Cartas, fichas, dados, peones, pilas de fichas y asientos con pooling.
- Atlas temático rasterizado desde SVG, sin imágenes externas.
- `MotionSensorEngine` con giroscopio, agitado, boca abajo y watchdog seguro.

## Motor sensorial

- `AudioRuntime` perezoso a 48 kHz: el navegador no crea audio hasta un gesto.
- Cuatro buses con limitador maestro y cero archivos externos.
- Audio 3D HRTF atado a asientos y cartas, con degradación a estéreo/mono.
- Ocho stems sincronizados; 19 festividades + Día Normal cambian escala, tempo,
  timbre y acentos. La tensión de partida decide qué capas dominan.
- Doce efectos procedurales y háptica de precisión para Capacitor y web.
- Laboratorio interactivo en el portal para probar tensión, festividades y gestos.

## Comandos

```powershell
pnpm install     # instalar dependencias
pnpm build       # compilar todos los paquetes
pnpm test        # pruebas automáticas con Vitest
pnpm typecheck   # verificación de tipos
pnpm lint        # reglas y estilo con Biome
pnpm dev         # cliente en desarrollo (desde apps/client)
```

## Enlaces

- Portal: https://emanuelindustri-source.github.io/mesa-viva-ultimate/
- Repositorio: https://github.com/emanuelindustri-source/mesa-viva-ultimate

Las fichas de Mesa Viva son virtuales y no tienen valor monetario. No hay apuestas
ni premios reales.
