# Próxima versión — v0.3.0 · Fase 2: Diseño Universal

**Estado:** pendiente de inicio
**Depende de:** v0.2.0 (Fase 1 entregada)
**Objetivo:** construir el sistema de diseño multiplataforma que vestirá los
juegos, con Material You, festividades, seis formatos de pantalla, arte vectorial
procedural y los once idiomas del producto.

## Punto de retorno

1. Leer `AGENTS.md`, esta nota y `docs/versiones/indice.md`.
2. Ejecutar `pnpm install`, `pnpm lint`, `pnpm build` y `pnpm test:coverage`.
3. Confirmar que la Fase 1 sigue en verde.
4. Continuar con el primer objetivo pendiente de la lista siguiente.

## Entregables de la Fase 2

- [ ] Tokens Material You: color, tipografía, elevación, radios, movimiento y
      espaciado; modo claro/oscuro.
- [ ] Paletas de usuario y color dinámico Android 12+ con puente Kotlin preparado.
- [ ] `HolidayEngine`: 19 festividades + Día Normal, detección por fecha y país
      con `Intl`, prioridad y ventanas de fechas configurables.
- [ ] Temas festivos: partículas, iconos, marcos y música asociada por identificador.
- [ ] Diseño adaptativo para móvil, tablet, televisor, laptop, ultrawide y plegable
      (detección de bisagra y modo mesa dividida).
- [ ] Navegación con D-pad/control remoto y foco visible para televisores.
- [ ] `VectorAtlasGenerator`: cartas españolas y de colores, fichas de dominó,
      tableros, medallas e iconos en SVG procedural.
- [ ] i18next con 11 locales: `es-VE`, `es`, `en`, `it`, `pt-BR`, `pt-PT`, `fr`,
      `de`, `ca`, `hi`, `ja`, `zh-CN` (español principal).
- [ ] Diccionario de reglas y términos de los cuatro juegos en los 11 idiomas.
- [ ] Pruebas de calendario por país y fecha, snapshots de tokens, cobertura de
      claves i18n y verificación de los seis breakpoints.

## Criterios de aceptación

- `pnpm lint`, `pnpm build` y `pnpm test:coverage` en verde.
- Cada festividad se activa en su fecha simulada y vuelve a Día Normal.
- No falta ninguna clave de traducción en los 11 locales.
- El atlas vectorial se genera sin imágenes externas y con ids estables.
- Ningún archivo supera 200 líneas.
- CI verde y Pages actualizado.
- Nota `v0.3.0-fase2-diseno-universal.md` y esta nota reescrita para la Fase 3.

## Alcance que NO entra en esta fase

- La app jugable `/play/` y el lobby online (Fase 5).
- El motor PixiJS (Fase 3) y el audio/háptica (Fase 4).
- La expansión del catálogo de juegos de mesa (Fase 6).

## Riesgos conocidos

- El calendario festivo varía por país; se implementará una tabla de reglas con
  país opcional y respaldo global.
- `date-holidays` puede añadir peso; se evaluará carga diferida o tabla propia para
  mantener el paquete web por debajo de 10 MB.
- La traducción a hindi, japonés y chino debe revisarse con hablantes nativos antes
  de la publicación comercial; en esta fase se valida la estructura y cobertura.
