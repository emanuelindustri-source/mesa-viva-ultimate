# Próxima versión — v0.4.0 · Fase 3: Motor 2.5D

**Estado:** pendiente de inicio
**Depende de:** v0.3.0 (Fase 2 entregada)
**Objetivo:** construir `@mesa-viva/engine-25d` sobre PixiJS v8 y GSAP para
renderizar mesas, cartas, fichas y tableros con perspectiva, elevación, sombras
proyectadas y físicas táctiles, consumiendo el atlas procedural del sistema de
diseño a 60–120 FPS.

## Punto de retorno

1. Leer `AGENTS.md`, esta nota y `docs/versiones/indice.md`.
2. Ejecutar `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build` y
   `pnpm test:coverage`.
3. Confirmar que la Fase 2 sigue en verde (159 pruebas, 97,21% líneas).
4. Revisar `docs/arquitectura.md` y `packages/design-system/src/vector/`.
5. Continuar con el primer objetivo pendiente de la lista siguiente.

## Entregables de la Fase 3

- [ ] Dependencias `pixi.js` v8 y `gsap` declaradas solo en `engine-25d`.
- [ ] Escena base: aplicación PixiJS, ticker, resize y ciclo de vida sin fugas.
- [ ] Cámara 2.5D: perspectiva configurable, inclinación, zoom y paralaje.
- [ ] Sistema de entidades universales: carta, ficha, dado, tablero y medalla.
- [ ] Object pooling para cartas y fichas; cero asignaciones por frame en reposo.
- [ ] Elevación Z y sombras proyectadas coherentes con los tokens 2.5D.
- [ ] Rasterización del `VectorAtlasGenerator` a texturas GPU y atlas de sprites.
- [ ] Reparto, abanico, arrastre, lanzamiento y ordenamiento de cartas con físicas.
- [ ] Rotación de tableros y asientos multijugador alrededor de la mesa.
- [ ] Capa de raycasting/picking táctil y con ratón, compatible con D-pad.
- [ ] Modo de movimiento reducido y fallback cuando no hay WebGL.
- [ ] Benchmark reproducible de FPS, draw calls y memoria.
- [ ] Pruebas de transformaciones, culling, pooling, picking y determinismo visual.
- [ ] Integración headless con los estados de `@mesa-viva/core` sin duplicar reglas.

## Criterios de aceptación

- `pnpm lint`, `pnpm typecheck`, `pnpm build` y `pnpm test:coverage` en verde.
- 60 FPS mínimos y 120 FPS objetivo en un portátil de gama media; benchmark
  documentado y repetible.
- Paquete web total inferior a 10 MB y cliente inicial razonablemente ligero.
- Ningún archivo supera 200 líneas.
- El atlas de la Fase 2 se rasteriza sin descargar imágenes externas.
- Los seis formatos de pantalla conservan cámara y áreas seguras.
- Ninguna regla de juego vive en el motor gráfico; solo presenta estados de `core`.
- Nota `v0.4.0-fase3-motor-25d.md` y esta nota reescrita para la Fase 4.

## Alcance que NO entra en esta fase

- Audio espacial, música adaptativa y háptica (Fase 4).
- App jugable `/play/`, lobby online y monetización (Fase 5).
- Expansión del catálogo de juegos de mesa (Fase 6).
- Empaquetado Android firmado y publicación en Google Play (Fase 6).
- Animaciones de personajes 3D completos o modelos externos.

## Riesgos conocidos

- PixiJS v8 y GSAP elevan el tamaño del paquete; se medirá el árbol sacudido y se
  cargarán escenas por rutas si hace falta.
- WebGL en televisores antiguos puede ser limitado; se necesita fallback y un
  presupuesto de texturas conservador.
- El atlas procedural debe rasterizarse una sola vez y cachearse; regenerar SVG
  por frame destruiría el rendimiento.
- Las físicas de cartas deben ser deterministas para pruebas visuales, aunque la
  presentación no altere el estado lógico.
- La detección de bisagra y TV llega desde la capa nativa; el motor debe degradar
  con elegancia cuando falte información.
